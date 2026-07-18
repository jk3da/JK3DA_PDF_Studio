// Erzeugt build/icon.ico (Multi-Size) und build/icon.png aus build/icon.svg.
// Aufruf: npm run make-icon
import sharp from 'sharp'
import pngToIco from 'png-to-ico'
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const svg = await readFile(join(root, 'build', 'icon.svg'))

const sizes = [16, 24, 32, 48, 64, 128, 256]
const pngs = await Promise.all(
  sizes.map((s) => sharp(svg).resize(s, s, { fit: 'cover' }).png().toBuffer())
)

await writeFile(join(root, 'build', 'icon.ico'), await pngToIco(pngs))
await writeFile(join(root, 'build', 'icon.png'), await sharp(svg).resize(512, 512).png().toBuffer())

console.log(`icon.ico (${sizes.join('/')}) + icon.png (512) geschrieben`)
