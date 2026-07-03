import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import { join, basename } from 'node:path'
import { readFile, writeFile, rm, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import {
  IPC,
  type OpenedPdf,
  type SavedPdf,
  type SavedBatch,
  type BatchFile,
  type EncryptRequest,
  type EncryptResult,
  type ImageInput,
  type CompressResult,
  type OfficeResult,
  type OcrRequest,
  type OcrResult
} from '../shared/types'
import { toolAvailable, runBinary } from './sidecars'

const isDev = !!process.env['ELECTRON_RENDERER_URL']

let mainWindow: BrowserWindow | null = null
/** Ungespeicherte Änderungen? Wird vom Renderer gemeldet (app:setDirty). */
let rendererDirty = false

/** Liest eine PDF und schiebt sie als Open-Event in den Renderer. */
async function openPathInWindow(win: BrowserWindow, filePath: string): Promise<void> {
  try {
    const data = await readFile(filePath)
    const payload: OpenedPdf = {
      path: filePath,
      name: basename(filePath),
      bytes: new Uint8Array(data)
    }
    win.webContents.send(IPC.openFileEvent, payload)
  } catch {
    /* Datei nicht lesbar — ignorieren */
  }
}

/** PDF-Pfad aus Startargumenten (Doppelklick / "Öffnen mit"). */
function pdfArgFrom(argv: string[]): string | null {
  const args = argv.slice(app.isPackaged ? 1 : 2)
  return args.find((a) => a.toLowerCase().endsWith('.pdf') && existsSync(a)) ?? null
}

function createWindow(): void {
  const window = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 960,
    minHeight: 620,
    show: false,
    frame: false,
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

  mainWindow = window
  window.on('ready-to-show', () => window.show())
  window.on('closed', () => {
    if (mainWindow === window) mainWindow = null
  })

  // Verlustfrei: Schließen mit ungespeicherten Änderungen erst bestätigen.
  window.on('close', (e) => {
    if (!rendererDirty) return
    const choice = dialog.showMessageBoxSync(window, {
      type: 'warning',
      buttons: ['Schließen ohne Speichern', 'Abbrechen'],
      defaultId: 1,
      cancelId: 1,
      title: 'Ungespeicherte Änderungen',
      message: 'Das Dokument hat ungespeicherte Änderungen.',
      detail: 'Beim Schließen gehen die Änderungen verloren.'
    })
    if (choice === 1) e.preventDefault()
    else rendererDirty = false
  })

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

  // Fenster-Steuerung (rahmenloses Fenster -> eigene Titelleiste).
  ipcMain.handle(IPC.winMinimize, (e) => BrowserWindow.fromWebContents(e.sender)?.minimize())
  ipcMain.handle(IPC.winClose, (e) => BrowserWindow.fromWebContents(e.sender)?.close())
  ipcMain.handle(IPC.winMaximizeToggle, (e) => {
    const w = BrowserWindow.fromWebContents(e.sender)
    if (!w) return false
    if (w.isMaximized()) w.unmaximize()
    else w.maximize()
    return w.isMaximized()
  })
  ipcMain.handle(IPC.winIsMaximized, (e) => BrowserWindow.fromWebContents(e.sender)?.isMaximized() ?? false)
  ipcMain.handle(IPC.toggleFullscreen, (e) => {
    const w = BrowserWindow.fromWebContents(e.sender)
    if (!w) return false
    w.setFullScreen(!w.isFullScreen())
    return w.isFullScreen()
  })

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

  // Renderer meldet den Dirty-Zustand (für den Schließen-Schutz).
  ipcMain.on(IPC.setDirty, (_e, d: boolean) => {
    rendererDirty = d
  })

  // PDF direkt von einem Pfad laden (Zuletzt verwendet).
  ipcMain.handle(IPC.openPdfPath, async (_e, filePath: string): Promise<OpenedPdf | null> => {
    try {
      if (!existsSync(filePath)) return null
      const data = await readFile(filePath)
      return { path: filePath, name: basename(filePath), bytes: new Uint8Array(data) }
    } catch {
      return null
    }
  })

  // Druck: fertiges HTML (Seiten-Bilder) in unsichtbarem Fenster + System-Dialog.
  ipcMain.handle(IPC.printHtml, async (_e, html: string): Promise<boolean> => {
    const tmp = join(tmpdir(), `jk3da-print-${Date.now()}-${Math.floor(Math.random() * 1e6)}.html`)
    const w = new BrowserWindow({ show: false })
    try {
      await writeFile(tmp, html, 'utf8')
      await w.loadFile(tmp)
      return await new Promise<boolean>((resolve) => {
        w.webContents.print({ silent: false, printBackground: true }, (ok) => {
          resolve(ok)
          w.destroy()
          void rm(tmp, { force: true }).catch(() => undefined)
        })
      })
    } catch {
      w.destroy()
      await rm(tmp, { force: true }).catch(() => undefined)
      return false
    }
  })

  ipcMain.handle(IPC.openImages, async (): Promise<ImageInput[] | null> => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Bilder auswählen',
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'Bilder', extensions: ['png', 'jpg', 'jpeg'] }]
    })
    if (canceled || filePaths.length === 0) return null
    const out: ImageInput[] = []
    for (const p of filePaths) {
      out.push({ name: basename(p), bytes: new Uint8Array(await readFile(p)) })
    }
    return out
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

  // Komprimieren via Ghostscript.
  ipcMain.handle(
    IPC.compressPdf,
    async (_e, payload: { bytes: Uint8Array; quality: string }): Promise<CompressResult> => {
      if (!toolAvailable('gswin64c')) return { ok: false, error: 'gswin64c-missing' }
      const stamp = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`
      const inPath = join(tmpdir(), `jk3da-gs-in-${stamp}.pdf`)
      const outPath = join(tmpdir(), `jk3da-gs-out-${stamp}.pdf`)
      try {
        await writeFile(inPath, Buffer.from(payload.bytes))
        const res = await runBinary('gswin64c', [
          '-sDEVICE=pdfwrite',
          '-dCompatibilityLevel=1.4',
          `-dPDFSETTINGS=/${payload.quality}`,
          '-dNOPAUSE',
          '-dBATCH',
          '-dQUIET',
          `-sOutputFile=${outPath}`,
          inPath
        ])
        if (!existsSync(outPath)) return { ok: false, error: res.stderr || `gs exit ${res.code}` }
        return { ok: true, bytes: new Uint8Array(await readFile(outPath)) }
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) }
      } finally {
        await rm(inPath, { force: true }).catch(() => undefined)
        await rm(outPath, { force: true }).catch(() => undefined)
      }
    }
  )

  // Office -> PDF via LibreOffice (soffice --headless).
  ipcMain.handle(IPC.convertOfficeToPdf, async (): Promise<OfficeResult> => {
    if (!toolAvailable('soffice')) return { ok: false, error: 'soffice-missing' }
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Office-Datei wählen',
      properties: ['openFile'],
      filters: [{ name: 'Office', extensions: ['docx', 'doc', 'odt', 'rtf', 'xlsx', 'xls', 'ods', 'pptx', 'ppt', 'odp'] }]
    })
    if (canceled || filePaths.length === 0) return { ok: false, error: 'canceled' }
    const inPath = filePaths[0]
    const outDir = join(tmpdir(), `jk3da-office-${Date.now()}-${Math.floor(Math.random() * 1e6)}`)
    try {
      await mkdir(outDir, { recursive: true })
      const res = await runBinary('soffice', ['--headless', '--convert-to', 'pdf', '--outdir', outDir, inPath])
      const outName = basename(inPath).replace(/\.[^.]+$/, '.pdf')
      const outPath = join(outDir, outName)
      if (!existsSync(outPath)) return { ok: false, error: res.stderr || 'Konvertierung fehlgeschlagen' }
      return { ok: true, bytes: new Uint8Array(await readFile(outPath)), name: outName }
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) }
    } finally {
      await rm(outDir, { recursive: true, force: true }).catch(() => undefined)
    }
  })

  // OCR: pro Bild eine durchsuchbare Ein-Seiten-PDF via Tesseract.
  ipcMain.handle(IPC.ocrImages, async (_e, payload: OcrRequest): Promise<OcrResult> => {
    if (!toolAvailable('tesseract')) return { ok: false, error: 'tesseract-missing' }
    const dir = join(tmpdir(), `jk3da-ocr-${Date.now()}-${Math.floor(Math.random() * 1e6)}`)
    try {
      await mkdir(dir, { recursive: true })
      const pages: Uint8Array[] = []
      for (let i = 0; i < payload.images.length; i++) {
        const inPath = join(dir, `p${i}.png`)
        const outBase = join(dir, `p${i}`)
        await writeFile(inPath, Buffer.from(payload.images[i].bytes))
        const res = await runBinary('tesseract', [inPath, outBase, '-l', payload.lang || 'deu', 'pdf'])
        const outPath = `${outBase}.pdf`
        if (!existsSync(outPath)) return { ok: false, error: res.stderr || `tesseract exit ${res.code}` }
        pages.push(new Uint8Array(await readFile(outPath)))
      }
      return { ok: true, pages }
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) }
    } finally {
      await rm(dir, { recursive: true, force: true }).catch(() => undefined)
    }
  })
}

// Eine Instanz: Doppelklick auf eine weitere PDF landet im offenen Fenster.
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', (_e, argv) => {
    if (!mainWindow) return
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
    const p = pdfArgFrom(argv)
    if (p) void openPathInWindow(mainWindow, p)
  })

  app.whenReady().then(() => {
    registerIpc()
    createWindow()

    // "Öffnen mit" / Doppelklick: Pfad aus den Startargumenten laden.
    const startupPdf = pdfArgFrom(process.argv)
    if (startupPdf && mainWindow) {
      const win = mainWindow
      win.webContents.once('did-finish-load', () => void openPathInWindow(win, startupPdf))
    }

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
