import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const MAX_BYTES = 1048576;
const MAX_DIM = 1024;

const sourceUrl = new URL('./entry.png', import.meta.url);
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const destPath = join(outputDir, 'entry.png');

const imageBytes = readFileSync(sourceUrl);
if (imageBytes.length === 0 || imageBytes.length > MAX_BYTES) {
  throw new Error(`entry.png size out of bounds: ${imageBytes.length} bytes`);
}

// Validate PNG signature and IHDR dimensions before writing deterministically
const pngMagic = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (!imageBytes.subarray(0, 8).equals(pngMagic) || imageBytes.toString('ascii', 12, 16) !== 'IHDR') {
  throw new Error('entry.png does not carry a valid PNG IHDR header');
}

const width = imageBytes.readUInt32BE(16);
const height = imageBytes.readUInt32BE(20);
if (width < 1 || width > MAX_DIM || height < 1 || height > MAX_DIM) {
  throw new Error(`entry.png dimensions out of bounds: ${width}x${height}`);
}

mkdirSync(outputDir, { recursive: true });
writeFileSync(destPath, imageBytes);
