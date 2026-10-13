import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const sourceDir = path.join(process.cwd(), "public", "NUEVO", "cotizador inteli");
const auditDir = path.join(process.cwd(), ".visual-audit", "configurator-assets");
const outputDir = path.join(process.cwd(), "public", "images", "configurator");

const assets = [
  ["Barandilla arquitectónica en negro mate-44.png", "baranda-negro-mate"],
  ["Barandilla con acabado gris grafito-43.png", "baranda-gris-grafito"],
  ["Barandilla de acero inoxidable para escaleras-6.png", "baranda-acero-inoxidable"],
  ["Cerco eléctrico moderno en muro perimetral-8.png", "cerco-electrico"],
  ["Columnas y vigas en blanco roto-37.png", "techo-estructura-blanco-texturado"],
  ["Columnas y vigas en negro mate-38.png", "techo-estructura-negro-mate"],
  ["Columnas y vigas en negro mate-42.png", "estructura-especial-negro-mate"],
  ["Detalle de pared de yeso laminado-36.png", "drywall-revestimiento"],
  ["Estructura de acero para taller-7.png", "estructura-especial-gris-grafito"],
  ["Estructura metálica en blanco roto-41.png", "estructura-especial-blanco-texturado"],
  ["Mampara corredera con ventana de aluminio-5.png", "mampara-corredera"],
  ["Mampara de vidrio con marco grafito-34.png", "mampara-gris-grafito"],
  ["Marquesina moderna de acero y policarbonato translúcido-4.png", "techo-translucido-negro-mate"],
  ["Motor de garaje con puerta seccional-10.png", "automatizacion-garaje-seccional"],
  ["Pasamanos inoxidable sobre escalera marfil-35.png", "pasamanos-acero-inoxidable"],
  ["Pérgola moderna de lamas grafito-32.png", "techo-sol-sombra-negro-mate"],
  ["Portón corredero de acero antracita-28.png", "garaje-corrediza"],
  ["Portón de acero con lamas horizontales-29.png", "garaje-batiente"],
  ["Puerta basculante monobloque antracita-27.png", "garaje-levadiza"],
  ["Puerta con acabado cedro dorado-16.png", "principal-una-hoja-cedro-dorado"],
  ["Puerta con acabado cedro dorado-24.png", "garaje-seccional-cedro-dorado"],
  ["Puerta con acabado cedro liso-11.png", "principal-una-hoja-cedro-liso"],
  ["Puerta con acabado cedro liso-19.png", "garaje-seccional-cedro-liso"],
  ["Puerta con acabado de nogal oscuro-13.png", "principal-una-hoja-nogal-oscuro"],
  ["Puerta con acabado negro mate-23.png", "garaje-seccional-negro-mate"],
  ["Puerta con acabado roble natural miel-12.png", "principal-una-hoja-roble-natural"],
  ["Puerta de acero antracita con tirador vertical-1.png", "principal-una-hoja-gris-grafito"],
  ["Puerta de acero galvanizado satinado sin pintar-26.png", "garaje-seccional-sin-pintar"],
  ["Puerta de acero galvanizado satinado-18.png", "principal-una-hoja-sin-pintar"],
  ["Puerta de entrada con acabado roble natural-20.png", "garaje-seccional-roble-natural"],
  ["Puerta de entrada nogal con tirador negro-3.png", "puertas-importadas-categoria"],
  ["Puerta de nogal oscuro, acabado madera-21.png", "garaje-seccional-nogal-oscuro"],
  ["Puerta doble de acero carbón-30.png", "principal-doble-hoja-negro-mate"],
  ["Puerta metálica con acabado blanco texturado-14.png", "principal-una-hoja-blanco-texturado"],
  ["Puerta metálica con acabado blanco texturado-22.png", "garaje-seccional-blanco-texturado"],
  ["Puerta metálica con acabado castaño-17.png", "principal-una-hoja-castano"],
  ["Puerta metálica con acabado castaño-25.png", "garaje-seccional-castano"],
  ["Puerta metálica en negro mate-15.png", "principal-una-hoja-negro-mate"],
  ["Puerta pivotante antracita contemporánea-31.png", "principal-pivotante-gris-grafito"],
  ["Puerta seccional de garaje antracita-2.png", "garaje-seccional-gris-grafito"],
  ["Ventana proyectante de aluminio grafito abierta-33.png", "mampara-ventana-proyectante-gris-grafito"],
  ["Ventanas y correderas en blanco roto-39.png", "mampara-blanco-texturado"],
  ["Ventanas y correderas en negro mate-40.png", "mampara-negro-mate"]
];

const files = (await readdir(sourceDir))
  .filter((name) => /\.(png|jpe?g|webp)$/i.test(name))
  .sort((left, right) => left.localeCompare(right, "es", { numeric: true }));

await Promise.all([mkdir(auditDir, { recursive: true }), mkdir(outputDir, { recursive: true })]);

for (const [sourceName, stableName] of assets) {
  const source = path.join(sourceDir, sourceName);
  await Promise.all([
    sharp(source)
      .rotate()
      .resize({ width: 1600, height: 1000, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82, effort: 5 })
      .toFile(path.join(outputDir, `${stableName}.webp`)),
    sharp(source)
      .rotate()
      .resize({ width: 520, height: 360, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 76, effort: 5 })
      .toFile(path.join(outputDir, `${stableName}-thumb.webp`))
  ]);
}

const pageSize = 22;
const cellWidth = 360;
const imageHeight = 230;
const labelHeight = 64;
const cellHeight = imageHeight + labelHeight;
const columns = 4;

for (let page = 0; page * pageSize < files.length; page += 1) {
  const pageFiles = files.slice(page * pageSize, (page + 1) * pageSize);
  const rows = Math.ceil(pageFiles.length / columns);
  const composites = [];

  for (let index = 0; index < pageFiles.length; index += 1) {
    const filename = pageFiles[index];
    const image = await sharp(path.join(sourceDir, filename))
      .resize(cellWidth, imageHeight, { fit: "cover" })
      .webp({ quality: 74 })
      .toBuffer();
    const shortLabel = `${page * pageSize + index + 1}. ${filename.replace(/\.png$/i, "")}`;
    const safeLabel = shortLabel
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
    const label = Buffer.from(`<svg width="${cellWidth}" height="${labelHeight}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#071b38"/><foreignObject x="12" y="7" width="${cellWidth - 24}" height="${labelHeight - 12}"><div xmlns="http://www.w3.org/1999/xhtml" style="font: 14px Arial; color: white; line-height: 1.25;">${safeLabel}</div></foreignObject></svg>`);
    const x = (index % columns) * cellWidth;
    const y = Math.floor(index / columns) * cellHeight;
    composites.push({ input: image, left: x, top: y }, { input: label, left: x, top: y + imageHeight });
  }

  await sharp({ create: { width: columns * cellWidth, height: rows * cellHeight, channels: 3, background: "#ffffff" } })
    .composite(composites)
    .jpeg({ quality: 88 })
    .toFile(path.join(auditDir, `contact-sheet-${page + 1}.jpg`));
}

console.log(`Created ${assets.length * 2} optimized configurator images and ${Math.ceil(files.length / pageSize)} contact sheets for ${files.length} source assets.`);
