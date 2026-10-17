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
js/script.js        Menú, acordeón de servicios, carrusel y envío del formulario con EmailJS
img/                Imágenes e iconos exportados de Figma
```

Librerías por CDN: Bootstrap 5.3.3, AOS 2.3.1, EmailJS 3 y SweetAlert2 11.

## Compilar estilos

Con la extensión Live Sass Compiler de VS Code, o con:

```
npx sass --no-source-map scss/styles.scss css/styles.css
```

## Pendiente

- Rellenar `EMAILJS_PUBLIC_KEY`, `serviceID` y `templateID` en `js/script.js` con la cuenta de EmailJS del cliente.
- Reemplazar el dominio `https://www.Mi_Pagina.com/` en las etiquetas canonical y Open Graph de `index.html`.
- Confirmar el nombre de la empresa: el diseño dice "GF Painting Contractors".
- Sustituir las fotos de ejemplo por fotos reales de trabajos.
