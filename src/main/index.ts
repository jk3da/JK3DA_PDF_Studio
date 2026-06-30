import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import { join, basename } from 'node:path'
import { readFile, writeFile } from 'node:fs/promises'
import { IPC, type OpenedPdf, type SavedPdf } from '../shared/types'

const isDev = !!process.env['ELECTRON_RENDERER_URL']

function createWindow(): void {
  const window = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 960,
    minHeight: 620,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#1b1f24',
    title: 'JK3DA PDF Studio',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })

  window.on('ready-to-show', () => window.show())

  // Offline-first: externe Links niemals im App-Fenster, gar nicht ohne Not.
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) shell.openExternal(url)
    return { action: 'deny' }
  })

  if (isDev) {
    window.loadURL(process.env['ELECTRON_RENDERER_URL'] as string)
  } else {
    window.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function registerIpc(): void {
  ipcMain.handle(IPC.ping, () => 'pong')

  ipcMain.handle(IPC.getVersion, () => app.getVersion())

  ipcMain.handle(IPC.openPdf, async (): Promise<OpenedPdf | null> => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'PDF öffnen',
      properties: ['openFile'],
      filters: [{ name: 'PDF-Dokumente', extensions: ['pdf'] }]
    })
    if (canceled || filePaths.length === 0) return null

    const filePath = filePaths[0]
    const data = await readFile(filePath)
    return {
      path: filePath,
      name: basename(filePath),
      bytes: new Uint8Array(data)
    }
  })

  // "Speichern unter": schreibt die Bytes nie über das Original, sondern fragt
  // immer einen Zielpfad ab (verlustfreies Arbeitsprinzip).
  ipcMain.handle(
    IPC.savePdf,
    async (_e, payload: { bytes: Uint8Array; defaultName?: string }): Promise<SavedPdf | null> => {
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Speichern unter',
        defaultPath: payload.defaultName ?? 'dokument.pdf',
        filters: [{ name: 'PDF-Dokumente', extensions: ['pdf'] }]
      })
      if (canceled || !filePath) return null
      await writeFile(filePath, Buffer.from(payload.bytes))
      return { path: filePath, name: basename(filePath) }
    }
  )
}

app.whenReady().then(() => {
  registerIpc()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
