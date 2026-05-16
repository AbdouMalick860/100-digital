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
function openModal(src, type) {
  const modal = document.getElementById("modal");
  const content = document.getElementById("modalContent");

  modal.style.display = "flex";

  if (type === "image") {
    content.innerHTML = `<img src="${src}" style="max-width:90%; max-height:85%; border-radius:10px;">`;
  }

  if (type === "video") {
    content.innerHTML = `
      <video controls autoplay playsinline style="max-width:90%; max-height:85%; border-radius:10px;">
        <source src="${src}" type="video/mp4">
      </video>
    `;
  }
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
  document.getElementById("modalContent").innerHTML = "";
}

/* ESC */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

/* click outside modal */
window.addEventListener("click", (e) => {
  if (e.target.id === "modal") {
    closeModal();
  }
});
});