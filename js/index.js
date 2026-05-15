document.addEventListener("DOMContentLoaded", () => {

  const burger = document.getElementById("burgerBtn");
  const menu = document.getElementById("sideMenu");

  if (!burger || !menu) {
    console.error("Burger ou menu introuvable dans le DOM");
    return;
  }

  burger.addEventListener("click", () => {
    menu.classList.toggle("open");
    burger.classList.toggle("active");
  });

  document.querySelectorAll(".side-menu a").forEach(link => {
    link.addEventListener("click", () => {
      menu.classList.remove("open");
      burger.classList.remove("active");
    });
  });

  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  document.querySelectorAll("a[href^='#']").forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

});