import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import { join, basename } from 'node:path'
import { readFile, writeFile, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import {
  IPC,
  type OpenedPdf,
  type SavedPdf,
  type SavedBatch,
  type BatchFile,
  type EncryptRequest,
  type EncryptResult
} from '../shared/types'
import { toolAvailable, runBinary } from './sidecars'

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

  // Batch-Export (z. B. Aufteilen in Einzelseiten): Zielordner wählen, alle schreiben.
  ipcMain.handle(
    IPC.savePdfBatch,
    async (_e, payload: { files: BatchFile[] }): Promise<SavedBatch | null> => {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'Zielordner wählen',
        properties: ['openDirectory', 'createDirectory']
      })
      if (canceled || filePaths.length === 0) return null
      const dir = filePaths[0]
      for (const f of payload.files) {
        await writeFile(join(dir, f.name), Buffer.from(f.bytes))
      }
      return { dir, count: payload.files.length }
    }
  )

  // Ist ein natives Sidecar (qpdf, gswin64c, tesseract, …) vorhanden?
  ipcMain.handle(IPC.toolAvailable, (_e, name: string): boolean => toolAvailable(name))

  // Verschlüsselung/Passwort/Berechtigungen via qpdf.
  ipcMain.handle(IPC.encryptPdf, async (_e, req: EncryptRequest): Promise<EncryptResult> => {
    if (!toolAvailable('qpdf')) return { ok: false, error: 'qpdf-missing' }
    const stamp = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`
    const inPath = join(tmpdir(), `jk3da-in-${stamp}.pdf`)
    const outPath = join(tmpdir(), `jk3da-out-${stamp}.pdf`)
    try {
      await writeFile(inPath, Buffer.from(req.bytes))
      const user = req.userPassword ?? ''
      const owner = req.ownerPassword || req.userPassword || ''
      const { print, modify, copy } = req.permissions
      const args = [
        '--encrypt',
        user,
        owner,
        '256',
        `--print=${print ? 'full' : 'none'}`,
        `--modify=${modify ? 'all' : 'none'}`,
        `--extract=${copy ? 'y' : 'n'}`,
        '--',
        inPath,
        outPath
      ]
      const res = await runBinary('qpdf', args)
      // qpdf: 0 = ok, 3 = ok mit Warnungen.
      if (!existsSync(outPath)) return { ok: false, error: res.stderr || `qpdf exit ${res.code}` }
      const out = await readFile(outPath)
      return { ok: true, bytes: new Uint8Array(out) }
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) }
    } finally {
      await rm(inPath, { force: true }).catch(() => undefined)
      await rm(outPath, { force: true }).catch(() => undefined)
    }
  })
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
