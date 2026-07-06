const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const navLinks = document.getElementById("navLinks");
const year = document.getElementById("year");
const filterButtons = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".project-card");
const modal = document.getElementById("projectModal");
const modalTitle = document.getElementById("modalTitle");
const modalDescription = document.getElementById("modalDescription");
const modalTools = document.getElementById("modalTools");
const modalTriggers = document.querySelectorAll(".modal-trigger");
const closeModalButtons = document.querySelectorAll("[data-close-modal]");
const contactForm = document.getElementById("contactForm");
const toast = document.getElementById("toast");

const savedTheme = localStorage.getItem("portfolio-theme");

if (savedTheme) {
  root.setAttribute("data-theme", savedTheme);
} else {
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  root.setAttribute("data-theme", prefersLight ? "light" : "dark");
}

updateThemeIcon();

if (year) {
  year.textContent = new Date().getFullYear();
}

themeToggle?.addEventListener("click", () => {
  const currentTheme = root.getAttribute("data-theme");
  const nextTheme = currentTheme === "dark" ? "light" : "dark";

  root.setAttribute("data-theme", nextTheme);
  localStorage.setItem("portfolio-theme", nextTheme);
  updateThemeIcon();
});

function updateThemeIcon() {
  const currentTheme = root.getAttribute("data-theme");
  if (themeIcon) {
    themeIcon.textContent = currentTheme === "dark" ? "☾" : "☀";
  }
}

mobileMenuBtn?.addEventListener("click", () => {
  navLinks?.classList.toggle("open");
});

navLinks?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
  });
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    projectCards.forEach((card) => {
      const category = card.dataset.category;
      const shouldShow = filter === "all" || category === filter;

      card.classList.toggle("hidden", !shouldShow);
    });
  });
});

modalTriggers.forEach((button) => {
  button.addEventListener("click", () => {
    openModal({
      title: button.dataset.title,
      description: button.dataset.description,
      tools: button.dataset.tools,
    });
  });
});

closeModalButtons.forEach((button) => {
  button.addEventListener("click", closeModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
});

function openModal(project) {
  if (!modal) return;

  modalTitle.textContent = project.title || "Project Details";
  modalDescription.textContent =
    project.description || "Add your project description here.";
  modalTools.textContent = project.tools || "Tools not listed yet.";

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  if (!modal) return;

  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(contactForm);
  const name = formData.get("name");
  const email = formData.get("email");
  const message = formData.get("message");

  const subject = encodeURIComponent(`Portfolio message from ${name}`);
  const body = encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
  );

  window.location.href = `mailto:your.email@example.com?subject=${subject}&body=${body}`;

  showToast("Email draft created. Replace the email address in script.js.");
  contactForm.reset();
});

function showToast(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  window.setTimeout(() => {
    toast.classList.remove("show");
  }, 3500);
}

const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
  }
);

revealElements.forEach((element) => {
  revealObserver.observe(element);
});
