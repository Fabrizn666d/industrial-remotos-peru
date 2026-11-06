import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const projectRoot = process.cwd();
const sourceRoot = path.join(projectRoot, "public", "NUEVO", "WAZAA");
const outputRoot = path.join(projectRoot, "public", "images", "service-details", "imported-colors");

const variants = [
  ["Puerta blanca satinada con tirador negro-2.png", "importada-blanco.webp"],
  ["Puerta grafito en fachada luminosa-3.png", "importada-grafito.webp"],
  ["Puerta de madera con apertura interior-1.png", "importada-miel.webp"],
  ["Puerta negra mate en fachada luminosa-4.png", "importada-negro.webp"],
  ["Puerta y marco en nogal-5.png", "importada-nogal.webp"]
];

await mkdir(outputRoot, { recursive: true });

for (const [sourceName, outputName] of variants) {
  const source = path.join(sourceRoot, sourceName);
  const output = path.join(outputRoot, outputName);
  const info = await sharp(source)
    .rotate()
    .webp({ quality: 90, smartSubsample: true, effort: 6 })
    .toFile(output);

  console.log(`${outputName}: ${info.width}x${info.height} (${info.size} bytes)`);
}
