// ===== CONFIGURACION EMAILJS =====
// Reemplazar con los datos de la cuenta de EmailJS del cliente.
const EMAILJS_PUBLIC_KEY = "TU_PUBLIC_KEY"; //Remplazar
const serviceID = "TU_SERVICE_ID"; //Remplazar
const templateID = "TU_TEMPLATE_ID"; //Remplazar

// ===== ANIMACIONES =====
AOS.init({
  duration: 700,
  once: true,
  offset: 80,
  disable: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
});

document.getElementById("year").textContent = new Date().getFullYear();

// ===== HERO: VIDEO DE FONDO =====
// Se descarga cuando la pagina ya termino de cargar, y no se descarga si el usuario pidio
// menos movimiento, ahorro de datos o tiene una conexion muy lenta. Mientras tanto (o si el
// navegador no deja reproducirlo, p. ej. iPhone en modo de bajo consumo) queda la imagen.
const heroVideo = document.querySelector(".hero__video");
const conexion = navigator.connection || {};
const videoPermitido =
  heroVideo &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
  !conexion.saveData &&
  !/2g/.test(conexion.effectiveType || "");

const iniciarHeroVideo = () => {
  // Deja solo la version de este tamano de pantalla (escritorio o movil) aunque el navegador
  // no soporte media en <source>
  heroVideo.querySelectorAll("source[media]").forEach((source) => {
    if (!window.matchMedia(source.media).matches) source.remove();
  });
  heroVideo.muted = true;
  heroVideo.addEventListener("playing", () => heroVideo.classList.add("is-playing"), { once: true });
  heroVideo.load();

  // Solo se reproduce mientras esta en pantalla: ahorra bateria y CPU
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) heroVideo.play().catch(() => {});
    else heroVideo.pause();
  }).observe(heroVideo);
};

if (videoPermitido) {
  if (document.readyState === "complete") iniciarHeroVideo();
  else window.addEventListener("load", iniciarHeroVideo, { once: true });
}

// ===== MENU: cerrar al elegir una opcion en movil =====
const navbarNav = document.getElementById("navbarNav");
navbarNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    if (navbarNav.classList.contains("show")) {
      bootstrap.Collapse.getOrCreateInstance(navbarNav).hide();
    }
  });
});

// ===== MENU: marcar la seccion visible (estado "selected" de Figma) =====
const menuLinks = document.querySelectorAll(".container__menu--item");
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      menuLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
document.querySelectorAll("main section[id]").forEach((section) => sectionObserver.observe(section));

// ===== OUR SERVICES: TARJETAS APILADAS AL HACER SCROLL =====
// Escritorio: la seccion queda fija (GSAP ScrollTrigger) mientras cada tarjeta
// sube sobre la anterior; scrub suaviza la rueda del raton.
// Tablet y movil: position: sticky nativo, que sigue al dedo sin saltos aunque el
// navegador muestre u oculte su barra de direcciones. En ambos casos las tarjetas
// de atras se achican y oscurecen un poco.
const stack = document.getElementById("servicesAccordion");
const stackCards = [...document.querySelectorAll(".accordion-gf__item")];
let stackStep = 14; // franja visible de cada tarjeta apilada

const sizeStack = () => {
  stackCards.forEach((card) => (card.style.minHeight = ""));
  const tallest = Math.max(...stackCards.map((card) => card.offsetHeight));
  stackCards.forEach((card) => (card.style.minHeight = `${tallest}px`));
  stack.style.setProperty("--stack-height", `${tallest + (stackCards.length - 1) * stackStep}px`);
};

const resetStack = (className) => {
  stack.classList.remove(className);
  ["--stack-height", "--stack-top", "--stack-step"].forEach((prop) => stack.style.removeProperty(prop));
  stackCards.forEach((card) => {
    card.style.minHeight = "";
    card.style.transform = "";
    card.style.removeProperty("--dim");
  });
};

// Las tarjetas estan apiladas en el mismo lugar, asi que con loading="lazy" el navegador
// pedia cada foto recien cuando aparecia su tarjeta y se veia cargar. Se piden todas apenas
// termina de cargar la pagina (o antes, si el usuario ya se esta acercando a la seccion).
if (stack) {
  const cargarFotosServicios = () => {
    stack.querySelectorAll('img[loading="lazy"]').forEach((img) => (img.loading = "eager"));
    fotosObserver.disconnect();
  };
  const fotosObserver = new IntersectionObserver(
    ([entry]) => entry.isIntersecting && cargarFotosServicios(),
    { rootMargin: "1500px 0px" }
  );
  fotosObserver.observe(stack);
  if (document.readyState === "complete") cargarFotosServicios();
  else window.addEventListener("load", cargarFotosServicios, { once: true });
}

// Escritorio: seccion fija con GSAP
const buildPinnedStack = () => {
  stackStep = 14;
  stack.classList.add("is-stacking");
  sizeStack();
  ScrollTrigger.addEventListener("refreshInit", sizeStack);

  const timeline = gsap.timeline({
    defaults: { ease: "power2.out" },
    scrollTrigger: {
      trigger: "#services",
      pin: true,
      start: "center center+=40", // +40: deja espacio para el menu fijo
      end: () => `+=${(stackCards.length - 1) * window.innerHeight * 0.6}`,
      scrub: 1,
      invalidateOnRefresh: true,
    },
  });

  stackCards.forEach((card, index) => {
    if (index === 0) return;
    timeline.fromTo(card, { y: () => window.innerHeight }, { y: index * stackStep }, index - 1);
    stackCards.slice(0, index).forEach((behind, behindIndex) => {
      const depth = index - behindIndex;
      timeline.to(behind, { scale: 1 - depth * 0.05, "--dim": Math.min(depth * 0.12, 0.5) }, index - 1);
    });
  });
  timeline.to({}, { duration: 0.4 }); // pausa breve con todas apiladas

  return () => {
    ScrollTrigger.removeEventListener("refreshInit", sizeStack);
    resetStack("is-stacking");
  };
};

// Tablet y movil: tarjetas sticky justo debajo del menu
const buildStickyStack = () => {
  stackStep = 10;
  stack.classList.add("is-sticky-stack");
  stack.style.setProperty("--stack-step", `${stackStep}px`);
  stackCards.forEach((card, index) => card.style.setProperty("--i", index));

  const layout = () => {
    const menuBottom = document.querySelector(".container__header").getBoundingClientRect().bottom;
    stack.style.setProperty("--stack-top", `${Math.round(menuBottom + 12)}px`);
    sizeStack();
  };

  const update = () => {
    // Cuanto ha subido cada tarjeta sobre la anterior: 0 = abajo, 1 = ya apilada
    const progress = stackCards.map((card) => {
      const distance = card.getBoundingClientRect().top - parseFloat(getComputedStyle(card).top);
      return gsap.utils.clamp(0, 1, 1 - distance / card.offsetHeight);
    });
    stackCards.forEach((card, index) => {
      const depth = progress.slice(index + 1).reduce((sum, p) => sum + p, 0);
      card.style.transform = depth ? `scale(${1 - depth * 0.04})` : "";
      card.style.setProperty("--dim", Math.min(depth * 0.12, 0.5));
    });
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      update();
      ticking = false;
    });
  };

  // Solo se recalcula si cambia el ancho: la barra del navegador movil cambia el
  // alto al hacer scroll y no debe mover las tarjetas.
  let lastWidth = window.innerWidth;
  const onResize = () => {
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    layout();
    update();
  };

  layout();
  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);
  window.addEventListener("load", layout);

  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("load", layout);
    stackCards.forEach((card) => card.style.removeProperty("--i"));
    resetStack("is-sticky-stack");
  };
};

if (stack && window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  const media = gsap.matchMedia();
  media.add("(min-width: 861px) and (prefers-reduced-motion: no-preference)", buildPinnedStack);
  media.add("(max-width: 860px) and (prefers-reduced-motion: no-preference)", buildStickyStack);
  // Si la fuente carga tarde cambia la altura del texto: hay que volver a medir
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  // El pin agrega espacio a la pagina: AOS debe recalcular sus posiciones
  ScrollTrigger.addEventListener("refresh", () => AOS.refresh());
}

// ===== CARRUSEL OUR WORK =====
const track = document.getElementById("workTrack");
// En movil (<= 600px) el carrusel es vertical, como en el Figma: avanza hacia abajo
const scrollBySlide = (direction) => {
  const slide = track.querySelector(".carousel-gf__slide");
  const styles = getComputedStyle(track);
  if (styles.gridAutoFlow.startsWith("row")) {
    const gap = parseFloat(styles.rowGap) || 0;
    track.scrollBy({ top: direction * (slide.offsetHeight + gap), behavior: "smooth" });
  } else {
    const gap = parseFloat(styles.columnGap) || 0;
    track.scrollBy({ left: direction * (slide.offsetWidth + gap), behavior: "smooth" });
  }
};
document.querySelector(".carousel-gf__prev").addEventListener("click", () => scrollBySlide(-1));
document.querySelector(".carousel-gf__next").addEventListener("click", () => scrollBySlide(1));

// ===== FORMULARIO DE CONTACTO =====
const form = document.getElementById("formContact");
const btn = document.getElementById("sendEmail");
const btnText = btn.textContent;

// EmailJS y SweetAlert solo se usan al enviar: se descargan cuando el usuario empieza a
// completar el formulario, asi no compiten con la carga inicial de la pagina.
const cargarScript = (src) =>
  new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });
let libreriasFormulario;
const cargarLibreriasFormulario = () =>
  (libreriasFormulario ??= Promise.all([
    cargarScript("./js/vendor/email.min.js"),
    cargarScript("./js/vendor/sweetalert2.all.min.js"),
  ]).then(() => {
    if (EMAILJS_PUBLIC_KEY !== "TU_PUBLIC_KEY") {
      emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    }
  }));
form.addEventListener("focusin", cargarLibreriasFormulario, { once: true });

form.addEventListener("submit", function (event) {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.classList.add("was-validated");
    form.querySelector(":invalid").focus();
    return;
  }

  btn.disabled = true;
  btn.textContent = "Sending...";

  cargarLibreriasFormulario().then(() => emailjs.sendForm(serviceID, templateID, this)).then(
    () => {
      Swal.fire({
        title: "Message sent successfully",
        text: "Our team will contact you shortly",
        icon: "success",
        confirmButtonColor: "#7ca651",
      });
      form.reset();
      form.classList.remove("was-validated");
    },
    () => {
      Swal.fire({
        title: "Message not sent",
        text: "Try again later.",
        icon: "error",
        confirmButtonColor: "#e17438",
      });
    }
  ).finally(() => {
    btn.disabled = false;
    btn.textContent = btnText;
  });
});
