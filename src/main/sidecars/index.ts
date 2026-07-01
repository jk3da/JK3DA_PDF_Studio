import { app } from 'electron'
import { join } from 'node:path'
import { existsSync } from 'node:fs'
import { spawn } from 'node:child_process'

/**
 * Verzeichnis der nativen Windows-Sidecars.
 * Dev: <projectRoot>/resources/bin/win · Paket: <resources>/bin/win
 */
function binDir(): string {
  if (app.isPackaged) return join(process.resourcesPath, 'bin', 'win')
  return join(app.getAppPath(), 'resources', 'bin', 'win')
}

/** Vollständiger Pfad zur Binary oder null, wenn nicht vorhanden. */
export function resolveBinary(name: string): string | null {
  const exe = name.toLowerCase().endsWith('.exe') ? name : `${name}.exe`
  const p = join(binDir(), exe)
  return existsSync(p) ? p : null
}

export function toolAvailable(name: string): boolean {
  return resolveBinary(name) !== null
}

export interface RunResult {
  code: number
  stdout: string
  stderr: string
}

/** Führt eine Sidecar-Binary aus und sammelt stdout/stderr. */
export function runBinary(name: string, args: string[]): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    const bin = resolveBinary(name)
    if (!bin) {
      reject(new Error(`Sidecar nicht gefunden: ${name} (resources/bin/win)`))
      return
    }
    const child = spawn(bin, args, { windowsHide: true })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (d: Buffer) => (stdout += d.toString()))
    child.stderr.on('data', (d: Buffer) => (stderr += d.toString()))
    child.on('error', reject)
    child.on('close', (code) => resolve({ code: code ?? -1, stdout, stderr }))
  })
}
