
    // MENU BURGER
    const burgerBtn = document.getElementById("burgerBtn");
    const sideMenu = document.getElementById("sideMenu");

    burgerBtn.addEventListener("click", () => {
      burgerBtn.classList.toggle("active");
      sideMenu.classList.toggle("open");
    });

    // Fermer le menu quand on clique sur un lien
    document.querySelectorAll(".side-menu a").forEach((link) => {
      link.addEventListener("click", () => {
        burgerBtn.classList.remove("active");
        sideMenu.classList.remove("open");
      });
    });

    // Année automatique
    document.getElementById("year").textContent = new Date().getFullYear();
  