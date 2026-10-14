import { readdir, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const sourceRoot = path.resolve("public", "NUEVO", "IRP-imagenes-por-servicio");
const outputRoot = path.resolve("public", "images", "configurator", "catalog");

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(absolute) : [absolute];
  }));
  return nested.flat();
}

const sources = (await filesIn(sourceRoot)).filter((file) => path.extname(file).toLowerCase() === ".png");
for (const source of sources) {
  const relative = path.relative(sourceRoot, source);
  const targetDirectory = path.join(outputRoot, path.dirname(relative));
  const base = path.basename(relative, path.extname(relative));
  await mkdir(targetDirectory, { recursive: true });
  await sharp(source).rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).webp({ quality: 82, effort: 5 }).toFile(path.join(targetDirectory, `${base}.webp`));
  await sharp(source).rotate().resize({ width: 520, height: 520, fit: "inside", withoutEnlargement: true }).webp({ quality: 76, effort: 5 }).toFile(path.join(targetDirectory, `${base}-thumb.webp`));
}

console.log(`Optimized ${sources.length} catalog images in ${outputRoot}`);
