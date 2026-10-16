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

// ===== ACORDEON DE SERVICIOS =====
const accordionItems = document.querySelectorAll(".accordion-gf__item");
accordionItems.forEach((item) => {
  const header = item.querySelector(".accordion-gf__header");
  const open = () => {
    accordionItems.forEach((other) => {
      other.classList.toggle("is-open", other === item);
      other.querySelector(".accordion-gf__header").setAttribute("aria-expanded", other === item);
    });
  };
  header.addEventListener("click", open);
});

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
