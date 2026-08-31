import sharp from "sharp";
import { fileURLToPath } from "node:url";

const source = fileURLToPath(new URL("../public/images/advisor-cutout.png", import.meta.url));
const target = fileURLToPath(new URL("../public/images/advisor-cutout-transparent.png", import.meta.url));

const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
const transparent = new Uint8Array(width * height);
const queue = new Int32Array(width * height);
let head = 0;
let tail = 0;

function looksLikeBackground(pixel) {
  const offset = pixel * channels;
  const red = data[offset];
  const green = data[offset + 1];
  const blue = data[offset + 2];
  const high = Math.max(red, green, blue);
  const low = Math.min(red, green, blue);
  return low >= 226 && high - low <= 18;
}

function enqueue(pixel) {
  if (pixel < 0 || pixel >= width * height || transparent[pixel] || !looksLikeBackground(pixel)) return;
  transparent[pixel] = 1;
  queue[tail++] = pixel;
}

for (let x = 0; x < width; x += 1) {
  enqueue(x);
  enqueue((height - 1) * width + x);
}

for (let y = 0; y < height; y += 1) {
  enqueue(y * width);
  enqueue(y * width + width - 1);
}

while (head < tail) {
  const pixel = queue[head++];
  const x = pixel % width;
  const y = Math.floor(pixel / width);
  if (x > 0) enqueue(pixel - 1);
  if (x + 1 < width) enqueue(pixel + 1);
  if (y > 0) enqueue(pixel - width);
  if (y + 1 < height) enqueue(pixel + width);
}

for (let pixel = 0; pixel < transparent.length; pixel += 1) {
  if (transparent[pixel]) data[pixel * channels + 3] = 0;
}

// Feather only pale pixels touching the extracted area. This removes the faint
// checkerboard fringe without changing light details enclosed by the subject.
for (let pass = 0; pass < 2; pass += 1) {
  const next = new Uint8Array(transparent);
  for (let pixel = 0; pixel < transparent.length; pixel += 1) {
    if (transparent[pixel]) continue;
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    const neighbours = [x > 0 && pixel - 1, x + 1 < width && pixel + 1, y > 0 && pixel - width, y + 1 < height && pixel + width].filter((value) => value !== false);
    if (!neighbours.some((neighbour) => transparent[neighbour])) continue;
    const offset = pixel * channels;
    const red = data[offset];
    const green = data[offset + 1];
    const blue = data[offset + 2];
    const high = Math.max(red, green, blue);
    const low = Math.min(red, green, blue);
    if (low < 190 || high - low > 28) continue;
    data[offset + 3] = Math.min(data[offset + 3], Math.max(0, Math.round((245 - low) * 5.1)));
    if (data[offset + 3] < 24) next[pixel] = 1;
  }
  transparent.set(next);
}

await sharp(data, { raw: { width, height, channels } }).png().toFile(target);
console.log(`Saved ${target} (${width}x${height})`);
