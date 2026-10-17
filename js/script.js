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
// El apilado lo hace CSS (position: sticky). Aqui solo se iguala la altura de
// las tarjetas y se reduce la escala de las que quedan cubiertas por las siguientes.
const stackCards = [...document.querySelectorAll(".accordion-gf__item")];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const equalizeStackCards = () => {
  stackCards.forEach((card) => (card.style.minHeight = ""));
  const tallest = Math.max(...stackCards.map((card) => card.offsetHeight));
  stackCards.forEach((card) => (card.style.minHeight = `${tallest}px`));
};

const updateStackCards = () => {
  // Cuanto ha avanzado cada tarjeta sobre la anterior: 0 = abajo, 1 = ya apilada
  const progress = stackCards.map((card) => {
    const stickyTop = parseFloat(getComputedStyle(card).top);
    const distance = card.getBoundingClientRect().top - stickyTop;
    return Math.min(Math.max(1 - distance / card.offsetHeight, 0), 1);
  });
  stackCards.forEach((card, index) => {
    const depth = reduceMotion.matches ? 0 : progress.slice(index + 1).reduce((sum, p) => sum + p, 0);
    card.style.transform = depth ? `scale(${1 - depth * 0.04})` : "";
  });
};

let stackTicking = false;
const requestStackUpdate = () => {
  if (stackTicking) return;
  stackTicking = true;
  requestAnimationFrame(() => {
    updateStackCards();
    stackTicking = false;
  });
};

if (stackCards.length) {
  equalizeStackCards();
  updateStackCards();
  window.addEventListener("scroll", requestStackUpdate, { passive: true });
  window.addEventListener("resize", () => {
    equalizeStackCards();
    requestStackUpdate();
  });
  // Las fotos son lazy: al cargar pueden cambiar la altura de las tarjetas
  window.addEventListener("load", equalizeStackCards);
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
