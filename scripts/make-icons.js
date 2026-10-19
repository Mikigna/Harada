import fs from 'node:fs';
import zlib from 'node:zlib';

function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcBuf = Buffer.alloc(4);
  const combined = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(combined), 0);

  return Buffer.concat([lenBuf, combined, crcBuf]);
}

function generatePng(size) {
  const width = size;
  const height = size;
  const rawBytes = Buffer.alloc((width * 4 + 1) * height);

  const cornerRadius = size * 0.22;
  const half = size / 2;

  let pos = 0;
  for (let y = 0; y < height; y++) {
    rawBytes[pos++] = 0; // Filter type 0
    for (let x = 0; x < width; x++) {
      const dx = Math.max(0, Math.abs(x - half) - (half - cornerRadius));
      const dy = Math.max(0, Math.abs(y - half) - (half - cornerRadius));
      const distFromCorner = Math.sqrt(dx * dx + dy * dy);

      if (distFromCorner > cornerRadius) {
        rawBytes[pos++] = 0;
        rawBytes[pos++] = 0;
        rawBytes[pos++] = 0;
        rawBytes[pos++] = 0;
        continue;
      }

      const t = (x + y) / (width + height);
      let r = Math.round(67 * (1 - t) + 124 * t);
      let g = Math.round(56 * (1 - t) + 58 * t);
      let b = Math.round(202 * (1 - t) + 237 * t);
      let a = 255;

      const pad = size * 0.16;
      const cellSize = (size - pad * 2) / 3;
      const gap = size * 0.02;

      const innerX = x - pad;
      const innerY = y - pad;

      if (innerX >= 0 && innerX <= cellSize * 3 && innerY >= 0 && innerY <= cellSize * 3) {
        const col = Math.floor(innerX / cellSize);
        const row = Math.floor(innerY / cellSize);
        const cellLocalX = innerX % cellSize;
        const cellLocalY = innerY % cellSize;

        if (cellLocalX >= gap && cellLocalX <= cellSize - gap && cellLocalY >= gap && cellLocalY <= cellSize - gap) {
          if (col === 1 && row === 1) {
            r = 245;
            g = 158;
            b = 11;
            const starDx = Math.abs(cellLocalX - cellSize / 2);
            const starDy = Math.abs(cellLocalY - cellSize / 2);
            if (starDx + starDy < cellSize * 0.28) {
              r = 255;
              g = 255;
              b = 255;
            }
          } else {
            r = Math.min(255, r + 45);
            g = Math.min(255, g + 45);
            b = Math.min(255, b + 55);
          }
        }
      }

      rawBytes[pos++] = r;
      rawBytes[pos++] = g;
      rawBytes[pos++] = b;
      rawBytes[pos++] = a;
    }
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8);
  ihdrData.writeUInt8(6, 9);
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);
  const ihdr = makeChunk('IHDR', ihdrData);
  const compressed = zlib.deflateSync(rawBytes, { level: 9 });
  const idat = makeChunk('IDAT', compressed);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

const dir = './public';
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

fs.writeFileSync(`${dir}/pwa-512x512.png`, generatePng(512));
fs.writeFileSync(`${dir}/pwa-maskable-512x512.png`, generatePng(512));
fs.writeFileSync(`${dir}/pwa-192x192.png`, generatePng(192));
fs.writeFileSync(`${dir}/apple-touch-icon.png`, generatePng(180));
fs.writeFileSync(`${dir}/favicon.ico`, generatePng(64));

console.log('Generated all PWA png and ico assets successfully!');
