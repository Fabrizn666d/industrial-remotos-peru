import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourceDir = path.join(root, "public", "NUEVO", "nuevooooooo");
const outputDir = path.join(root, "public", "images", "service-details");

const assets = {
  "custom-door-main.webp": "Puerta pivotante de madera en entrada moderna-2.png",
  "custom-door-detail.webp": "Tirador y cerradura en grafito-14.png",
  "garage-main.webp": "Puerta de garaje grafito en fachada de hormigón-1.png",
  "garage-detail.webp": "Puerta corredera de grafito y hormigón-13.png",
  "contraplacada-main.webp": "Puerta geométrica de grafito en hormigón-3.png",
  "contraplacada-singapur.webp": "Puerta Singapur de listones entreabierta-11.png",
  "imported-main.webp": "Entrada contemporánea con puerta color miel-4.png",
  "imported-colors.webp": "Cinco puertas de entrada, cinco acabados-12.png",
  "pergola-main.webp": "Pérgola de listones en patio luminoso-5.png",
  "pergola-detail.webp": "Terraza panorámica bajo pérgola grafito-15.png",
  "glass-main.webp": "Salón moderno con puertas correderas al jardín-6.png",
  "glass-detail.webp": "Mampara negra de vidrio en despacho-16.png",
  "rail-main.webp": "Escalera moderna con barandilla de vidrio-7.png",
  "rail-detail.webp": "Barandilla de acero sobre vidrio-17.png",
  "structure-main.webp": "Estructura de acero en patio comercial-8.png",
  "structure-detail.webp": "Unión atornillada de viga y pilar-20.png",
  "fence-main.webp": "Muro perimetral moderno con valla eléctrica-9.png",
  "fence-detail.webp": "Poste de valla eléctrica con cables tensos-18.png",
  "drywall-main.webp": "Tabique de yeso en apartamento luminoso-10.png",
  "drywall-detail.webp": "Instalador fijando placa de yeso-19.png"
};

await fs.mkdir(outputDir, { recursive: true });

for (const [outputName, sourceName] of Object.entries(assets)) {
  const source = path.join(sourceDir, sourceName);
  const target = path.join(outputDir, outputName);
  await fs.access(source);
  await sharp(source)
    .rotate()
    .resize({ width: 1536, height: 1024, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 88, effort: 6, smartSubsample: true })
    .toFile(target);
  const metadata = await sharp(target).metadata();
  console.log(`${outputName}: ${metadata.width}x${metadata.height}`);
}
