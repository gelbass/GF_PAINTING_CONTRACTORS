// ===== CONFIGURACION EMAILJS =====
// Reemplazar con los datos de la cuenta de EmailJS del cliente.
const EMAILJS_PUBLIC_KEY = "TU_PUBLIC_KEY"; //Remplazar
const serviceID = "TU_SERVICE_ID"; //Remplazar
const templateID = "TU_TEMPLATE_ID"; //Remplazar

// ===== ANIMACIONES =====
AOS.init({ duration: 700, once: true, offset: 80 });

document.getElementById("year").textContent = new Date().getFullYear();

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
// La seccion queda fija mientras cada tarjeta sube sobre la anterior; las de
// atras se achican y oscurecen. scrub suaviza el movimiento de la rueda del raton.
const stack = document.getElementById("servicesAccordion");
const stackCards = [...document.querySelectorAll(".accordion-gf__item")];
let STACK_STEP = 14; // franja visible de cada tarjeta apilada

const sizeStack = () => {
  stackCards.forEach((card) => (card.style.minHeight = ""));
  const tallest = Math.max(...stackCards.map((card) => card.offsetHeight));
  stackCards.forEach((card) => (card.style.minHeight = `${tallest}px`));
  stack.style.setProperty("--stack-height", `${tallest + (stackCards.length - 1) * STACK_STEP}px`);
};

const buildStack = (pinTarget, start, step) => {
  STACK_STEP = step;
  stack.classList.add("is-stacking");
  sizeStack();
  ScrollTrigger.addEventListener("refreshInit", sizeStack);

  const timeline = gsap.timeline({
    defaults: { ease: "power2.out" },
    scrollTrigger: {
      trigger: pinTarget,
      pin: true,
      start,
      end: () => `+=${(stackCards.length - 1) * window.innerHeight * 0.6}`,
      scrub: 1,
      invalidateOnRefresh: true,
    },
  });

  stackCards.forEach((card, index) => {
    if (index === 0) return;
    timeline.fromTo(card, { y: () => window.innerHeight }, { y: index * STACK_STEP }, index - 1);
    stackCards.slice(0, index).forEach((behind, behindIndex) => {
      const depth = index - behindIndex;
      timeline.to(behind, { scale: 1 - depth * 0.05, "--dim": Math.min(depth * 0.12, 0.5) }, index - 1);
    });
  });
  timeline.to({}, { duration: 0.4 }); // pausa breve con todas apiladas

  return () => {
    ScrollTrigger.removeEventListener("refreshInit", sizeStack);
    stack.classList.remove("is-stacking");
    stack.style.removeProperty("--stack-height");
    stackCards.forEach((card) => (card.style.minHeight = ""));
  };
};

if (stack && window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  // Se fija toda la seccion, asi el texto de Our Services no se mueve.
  // Escritorio: centrada en pantalla (un poco mas abajo por el menu). Tablet y movil:
  // alineada abajo para que las tarjetas, que van debajo del texto, queden a la vista.
  media.add("(min-width: 861px) and (prefers-reduced-motion: no-preference)", () =>
    buildStack("#services", "center center+=40", 14) // +40: deja espacio para el menu fijo
  );
  // Si la seccion no entra en pantalla (telefonos bajos) se prioriza que las
  // tarjetas queden enteras justo debajo del menu, aunque el texto quede arriba.
  const mobileStart = () => {
    const section = document.getElementById("services");
    const menuBottom = document.querySelector(".container__header").getBoundingClientRect().bottom;
    const stackOffset = stack.getBoundingClientRect().top - section.getBoundingClientRect().top;
    const bottomAligned = section.offsetHeight - window.innerHeight;
    return `top+=${Math.min(bottomAligned, stackOffset - menuBottom - 12)} top`;
  };
  media.add("(max-width: 860px) and (prefers-reduced-motion: no-preference)", () =>
    buildStack("#services", mobileStart, 10)
  );
  // El pin agrega espacio a la pagina: AOS debe recalcular sus posiciones
  ScrollTrigger.addEventListener("refresh", () => AOS.refresh());
}

// ===== CARRUSEL OUR WORK =====
const track = document.getElementById("workTrack");
const scrollBySlide = (direction) => {
  const slide = track.querySelector(".carousel-gf__slide");
  const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
  track.scrollBy({ left: direction * (slide.offsetWidth + gap), behavior: "smooth" });
};
document.querySelector(".carousel-gf__prev").addEventListener("click", () => scrollBySlide(-1));
document.querySelector(".carousel-gf__next").addEventListener("click", () => scrollBySlide(1));

// ===== FORMULARIO DE CONTACTO =====
const form = document.getElementById("formContact");
const btn = document.getElementById("sendEmail");
const btnText = btn.textContent;

if (EMAILJS_PUBLIC_KEY !== "TU_PUBLIC_KEY") {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

form.addEventListener("submit", function (event) {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.classList.add("was-validated");
    form.querySelector(":invalid").focus();
    return;
  }

  btn.disabled = true;
  btn.textContent = "Sending...";

  emailjs.sendForm(serviceID, templateID, this).then(
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
