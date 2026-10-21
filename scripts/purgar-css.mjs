// Genera css/vendor/vendor.min.css: Bootstrap + AOS solo con las reglas que usa la web.
// Los CSS completos (bootstrap.min.css, aos.css) bloquean el primer pintado y el 97% no se usa.
// Uso: npm install && npm run css-vendor
// Volver a correrlo si se agregan clases de Bootstrap o animaciones de AOS nuevas en index.html.
import { PurgeCSS } from "purgecss";
import { writeFile } from "node:fs/promises";

const resultados = await new PurgeCSS().purge({
  content: [
    "index.html",
    "js/script.js",
    // Atributos que AOS pone en <body> al iniciar (ver AOS.init en js/script.js)
    { raw: '<body data-aos-easing="ease" data-aos-duration="700" data-aos-delay="0">', extension: "html" },
  ],
  css: ["css/vendor/bootstrap.min.css", "css/vendor/aos.css"],
  safelist: {
    // Clases que agrega el JS de Bootstrap (menu colapsable) y de AOS
    standard: ["show", "collapsing", "collapsed", "aos-init", "aos-animate"],
  },
});

// Un solo archivo para hacer una peticion menos; sin comentarios ni @charset repetidos
const css = resultados
  .map(({ css }) => css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/@charset "UTF-8";/g, "").trim())
  .join("\n");
await writeFile("css/vendor/vendor.min.css", `@charset "UTF-8";${css}\n`);
console.log(`css/vendor/vendor.min.css: ${(css.length / 1024).toFixed(1)} KB`);
