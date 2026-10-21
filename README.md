# GF_PAINTING_CONTRACTORS

Landing page de GF Painting Contractors, construida a partir de la plantilla de landing de Soltecs y del diseño de Figma.

## Estructura

```
index.html          Página única (Hero, Solutions, Services, Our Work, Why Us, Service area, Contact)
scss/               Estilos fuente
  _variables.scss   Colores, tipografía (Plus Jakarta Sans) y breakpoints
  _mixing.scss      Mixins (text, containers, respond-between, respond-below)
  _maquetado.scss   Base, textos, botones y secciones
  _contenedores.scss Menú y cada sección de la página
  _imagenes.scss    Reglas de imágenes
  _media.scss       Responsive (laptop, tablet, teléfono)
css/styles.css      CSS compilado desde scss/styles.scss
css/vendor/         Bootstrap 5.3.3 y AOS 2.3.1 (CSS servido desde la propia web, sin bloquear la carga en otro servidor)
js/script.js        Menú, acordeón de servicios, carrusel y envío del formulario con EmailJS
img/                Imágenes e iconos exportados de Figma (og-image.jpg 1200×630 para redes) y sus versiones AVIF/WebP
scripts/            optimizar-imagenes.mjs: genera las versiones AVIF/WebP
robots.txt          Reglas para buscadores y enlace al sitemap
sitemap.xml         Mapa del sitio para Google Search Console
```

Librerías: el CSS de Bootstrap 5.3.3 y AOS 2.3.1 está en `css/vendor/`; los JS de Bootstrap, AOS, GSAP, EmailJS y SweetAlert2 se cargan por CDN con `defer`.

## Compilar estilos

Con la extensión Live Sass Compiler de VS Code, o con:

```
npx sass --no-source-map scss/styles.scss css/styles.css
```

## Imágenes

Cada foto se sirve con `<picture>`: AVIF, luego WebP y el JPG/PNG original como respaldo, en varios tamaños para que el móvil no descargue la versión de escritorio. Para agregar o cambiar una foto:

1. Copiarla en `img/` (JPG o PNG, al tamaño más grande que se vaya a mostrar: 1400 px de ancho para Services, 1200 px para Our Work). Las fotos de celular conviene pasarlas antes por sharp con `.rotate()` para aplicar la orientación y quitar los datos EXIF/GPS.
2. Agregarla a la lista de `scripts/optimizar-imagenes.mjs` si es nueva.
3. Ejecutar `npm install` (solo la primera vez) y `npm run imagenes`.
4. En `index.html`, copiar el bloque `<picture>` de una foto parecida y cambiar los nombres.

El servidor donde se publique debe comprimir con gzip o brotli (Vercel, Netlify y la mayoría de hostings lo hacen solos).

## Pendiente

- Rellenar `EMAILJS_PUBLIC_KEY`, `serviceID` y `templateID` en `js/script.js` con la cuenta de EmailJS del cliente.
- Reemplazar el dominio `https://www.Mi_Pagina.com/` en las etiquetas canonical y Open Graph de `index.html`.
- Confirmar el nombre de la empresa: el diseño dice "GF Painting Contractors".
- Faltan fotos definitivas para Trash-Out Services y Ozone Treatment (siguen las de ejemplo).

## Antes de publicar

Reemplazar `https://TU-DOMINIO.com` por el dominio definitivo en `index.html` (canonical, Open Graph, Twitter y JSON-LD), `robots.txt` y `sitemap.xml`, y completar teléfono, email y redes en el JSON-LD.
