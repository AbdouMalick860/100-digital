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

      // Animation au scroll
      const scrollContainer = document.querySelector('.fullscreen-scroll-container');
      const observerOptions = { 
        threshold: 0.1, 
        rootMargin: "0px 0px -50px 0px",
        root: scrollContainer ? scrollContainer : null
      };
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // on ajoute la classe visible
            if (entry.target.classList.contains("fs-section")) {
               entry.target.classList.add("visible");
            } else {
               entry.target.classList.add("visible");
            }
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      document.querySelectorAll(".fade-up, .fade-right, .card, .service-card, .stat-card, .fs-section").forEach(el => {
        if (!el.classList.contains("fs-section")) {
          el.classList.add("hidden-elem");
        }
        observer.observe(el);
      });

      // Bouton Admin Flottant
      if (localStorage.getItem('token')) {
        const adminBtn = document.createElement('a');
        adminBtn.href = 'admin.html';
        adminBtn.innerHTML = '<i class="fa-solid fa-gear"></i> Admin';
        adminBtn.style.cssText = `
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: #00e5ff;
          color: #000;
          padding: 10px 20px;
          border-radius: 50px;
          font-weight: bold;
          text-decoration: none;
          z-index: 99999;
          box-shadow: 0 4px 15px rgba(0,229,255,0.4);
          transition: 0.3s;
        `;
        adminBtn.onmouseover = () => adminBtn.style.transform = 'scale(1.1)';
        adminBtn.onmouseout = () => adminBtn.style.transform = 'scale(1)';
        document.body.appendChild(adminBtn);
      }
});

// GLOBAL FUNCTIONS
window.openModal = function(src, type) {
  const modal = document.getElementById("modal");
  const content = document.getElementById("modalContent");
  if (!modal) return;

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
  
  if (type === "gallery") {
    const mediaArray = [
      { type: 'image', src: 'img/11.png' },
      { type: 'image', src: 'img/2.png' },
      { type: 'image', src: 'img/3.png' },
      { type: 'video', src: 'img/vid1.mp4' },
      { type: 'video', src: 'img/vid2.mp4' },
      { type: 'image', src: 'img/11.png' }
    ];

    let gridHtml = '<div class="insta-gallery">';
    mediaArray.forEach(media => {
      if(media.type === 'image') {
        gridHtml += `<div class="insta-item" onclick="openModal('${media.src}', 'image')">
          <img src="${media.src}" alt="Gallery item">
        </div>`;
      } else {
        gridHtml += `<div class="insta-item video-item" onclick="openModal('${media.src}', 'video')">
          <i class="fa-solid fa-play play-icon"></i>
          <video src="${media.src}" muted loop playsinline onmouseover="this.play()" onmouseout="this.pause()"></video>
        </div>`;
      }
    });
    gridHtml += '</div>';

    content.innerHTML = gridHtml;
  }
};

window.closeModal = function() {
  const modal = document.getElementById("modal");
  if (modal) modal.style.display = "none";
  const content = document.getElementById("modalContent");
  if (content) content.innerHTML = "";
};

window.handleSubmit = async function(event) {
  event.preventDefault();
  const btn = event.target.querySelector('button[type="submit"]');
  const name = event.target.querySelector('input[placeholder="Votre Nom"]').value;
  const email = event.target.querySelector('input[type="email"]').value;
  const message = event.target.querySelector('textarea').value;

  if (btn) {
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Envoi en cours... <i class="fa-solid fa-spinner fa-spin"></i>';

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });
      const data = await response.json();

      if(data.success) {
        btn.innerHTML = 'Message envoyé <i class="fa-solid fa-check"></i>';
        btn.style.background = '#28a745';
        btn.style.color = '#fff';
        event.target.reset();
      } else {
        btn.innerHTML = 'Erreur <i class="fa-solid fa-xmark"></i>';
        btn.style.background = '#dc3545';
      }
    } catch (error) {
      btn.innerHTML = 'Erreur <i class="fa-solid fa-xmark"></i>';
      btn.style.background = '#dc3545';
    }

    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.background = '';
      btn.style.color = '';
    }, 4000);
  }
};

/* ESC */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") window.closeModal();
});

/* click outside modal */
window.addEventListener("click", (e) => {
  if (e.target.id === "modal") {
    window.closeModal();
  }
});