// Genera las versiones AVIF y WebP (y tamaños responsive) de las imágenes de img/.
// Uso: npm install && npm run imagenes
// Para una foto nueva: agregala a la lista y vuelve a correr el script.
import sharp from "sharp";
import { stat } from "node:fs/promises";

// anchos: tamaños a generar (nunca se agranda la imagen original)
const imagenes = [
  { archivo: "hero-building.jpg", anchos: [1360] },
  { archivo: "card-property-management.jpg", anchos: [400, 800] },
  { archivo: "card-commercial.jpg", anchos: [400, 800] },
  { archivo: "card-residential.jpg", anchos: [600, 1200] },
  { archivo: "service-painting.jpg", anchos: [480, 800, 1400] },
  { archivo: "service-resurfacing.jpg", anchos: [480, 800, 1400] },
  { archivo: "service-cabinet.jpg", anchos: [480, 800, 1400] },
  { archivo: "service-trash-out.jpg", anchos: [480, 800, 1400] },
  { archivo: "service-ozone.jpg", anchos: [480, 800, 1400] },
  { archivo: "logo-gf.png", anchos: [200, 400, 600] },
  { archivo: "sello-gf.png", anchos: [150, 300] },
];

const kb = async (ruta) => ((await stat(ruta)).size / 1024).toFixed(1) + " KB";

for (const { archivo, anchos } of imagenes) {
  const origen = `img/${archivo}`;
  const nombre = archivo.replace(/\.\w+$/, "");
  const { width } = await sharp(origen).metadata();

  for (const ancho of anchos.filter((a) => a <= width)) {
    const base = sharp(origen).resize({ width: ancho });
    const avif = `img/${nombre}-${ancho}.avif`;
    const webp = `img/${nombre}-${ancho}.webp`;
    await base.clone().avif({ quality: 55, effort: 6 }).toFile(avif);
    await base.clone().webp({ quality: 78, effort: 6 }).toFile(webp);
    console.log(`${origen} -> ${ancho}px  avif ${await kb(avif)}  webp ${await kb(webp)}`);
  }
}

// El brillo de fondo se dibuja con blur(292px): una versión diminuta se ve igual.
await sharp("img/glow-original.png").resize({ width: 160 }).png({ compressionLevel: 9, palette: true }).toFile("img/glow.png");
console.log(`img/glow.png ${await kb("img/glow.png")}`);
