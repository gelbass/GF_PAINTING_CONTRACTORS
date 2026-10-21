// Genera las versiones AVIF y WebP (y tamaños responsive) de las imágenes de img/.
// Uso: npm install && npm run imagenes
// Para una foto nueva: agregala a la lista y vuelve a correr el script.
import sharp from "sharp";
import { stat } from "node:fs/promises";

// anchos: tamaños a generar (nunca se agranda la imagen original: si un ancho la supera, se usa el
// ancho original, p. ej. service-painting-1264)
// fondo: genera tambien img/<nombre>-fondo.webp, una version diminuta y desenfocada que rellena el
// espacio sobrante cuando la foto se muestra entera dentro de la tarjeta (clase .foto-completa)
const imagenes = [
  { archivo: "hero-video-desktop.jpg", anchos: [864] },
  { archivo: "hero-video-mobile.jpg", anchos: [1080] },
  { archivo: "card-property-management.jpg", anchos: [400, 800] },
  { archivo: "card-commercial.jpg", anchos: [400, 800] },
  { archivo: "card-residential.jpg", anchos: [600, 1200] },
  { archivo: "service-painting.jpg", anchos: [480, 800, 1400], fondo: true },
  { archivo: "service-drywall.jpg", anchos: [480, 800, 1400], fondo: true },
  { archivo: "service-cabinet.jpg", anchos: [480, 800, 1400], fondo: true },
  { archivo: "service-resurfacing.jpg", anchos: [480, 800, 1400], fondo: true },
  { archivo: "service-pressure-washing.jpg", anchos: [480, 800, 1400], fondo: true },
  { archivo: "service-trash-out.jpg", anchos: [480, 800, 1400] },
  { archivo: "service-ozone.jpg", anchos: [480, 800, 1400] },
  // Our Work: fotos reales de trabajos (antes / despues), recortadas a 1154x740: la proporcion de
  // la tarjeta del Figma (577x370), al doble para pantallas retina
  { archivo: "work-ceiling-leak-before.jpg", anchos: [480, 800, 1154], fondo: true },
  { archivo: "work-ceiling-leak-after.jpg", anchos: [480, 800, 1154], fondo: true },
  { archivo: "work-shower-wall-before.jpg", anchos: [480, 800, 1154], fondo: true },
  { archivo: "work-shower-wall-after.jpg", anchos: [480, 800, 1154], fondo: true },
  { archivo: "work-drywall-corner-before.jpg", anchos: [480, 800, 1154], fondo: true },
  { archivo: "work-drywall-corner-after.jpg", anchos: [480, 800, 1154], fondo: true },
  { archivo: "work-closet-ceiling-before.jpg", anchos: [480, 800, 1154], fondo: true },
  { archivo: "work-closet-ceiling-after.jpg", anchos: [480, 800, 1154], fondo: true },
  { archivo: "work-hallway-ceiling-before.jpg", anchos: [480, 800, 1154], fondo: true },
  { archivo: "work-hallway-ceiling-after.jpg", anchos: [480, 800, 1154], fondo: true },
  { archivo: "work-bathroom-ceiling.jpg", anchos: [480, 800, 1154], fondo: true },
  { archivo: "work-ceiling-opening-before.jpg", anchos: [480, 800, 1154], fondo: true },
  { archivo: "work-ceiling-opening-joists.jpg", anchos: [480, 800, 1154], fondo: true },
  { archivo: "work-ceiling-opening-after.jpg", anchos: [480, 800, 1154], fondo: true },
  { archivo: "work-siding-repair.jpg", anchos: [480, 800, 1154], fondo: true },
  { archivo: "work-siding-exterior.jpg", anchos: [480, 800, 1154], fondo: true },
  { archivo: "logo-gf.png", anchos: [200, 400, 600] },
  { archivo: "sello-gf.png", anchos: [150, 300] },
];

const kb = async (ruta) => ((await stat(ruta)).size / 1024).toFixed(1) + " KB";

for (const { archivo, anchos, fondo } of imagenes) {
  const origen = `img/${archivo}`;
  const nombre = archivo.replace(/\.\w+$/, "");
  const { width } = await sharp(origen).metadata();

  for (const ancho of new Set(anchos.map((a) => Math.min(a, width)))) {
    const base = sharp(origen).resize({ width: ancho });
    const avif = `img/${nombre}-${ancho}.avif`;
    const webp = `img/${nombre}-${ancho}.webp`;
    await base.clone().avif({ quality: 55, effort: 6 }).toFile(avif);
    await base.clone().webp({ quality: 78, effort: 6 }).toFile(webp);
    console.log(`${origen} -> ${ancho}px  avif ${await kb(avif)}  webp ${await kb(webp)}`);
  }

  if (fondo) {
    const ruta = `img/${nombre}-fondo.webp`;
    await sharp(origen).resize({ width: 64 }).blur(3).modulate({ brightness: 0.7 }).webp({ quality: 60 }).toFile(ruta);
    console.log(`${ruta} ${await kb(ruta)}`);
  }
}

// El brillo de fondo se dibuja con blur(292px): una versión diminuta se ve igual.
await sharp("img/glow-original.png").resize({ width: 160 }).png({ compressionLevel: 9, palette: true }).toFile("img/glow.png");
console.log(`img/glow.png ${await kb("img/glow.png")}`);
