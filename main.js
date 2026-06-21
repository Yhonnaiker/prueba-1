/**
 * Optimizaciones Snaiker — Interactividad principal
 * Fondo de estrellas, tabs, contadores, scroll reveal
 */

(function () {
  'use strict';

  // ==========================================
  // CANVAS — Fondo de estrellas animadas
  // ==========================================
  const canvas = document.getElementById('stars-canvas');
  const ctx = canvas.getContext('2d');
  let stars = [];
  let mouseX = 0;
  let mouseY = 0;
  let width, height;

  /** Configuración de estrellas */
  const STAR_COUNT = 220;
  const STAR_LAYERS = 3;

  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  /** Crea una estrella con posición, tamaño y velocidad aleatorios */
  function createStar(layer) {
    const speed = (layer + 1) * 0.15;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * (1.5 - layer * 0.3) + 0.3,
      opacity: Math.random() * 0.6 + 0.2,
      speed,
      layer,
      twinkle: Math.random() * Math.PI * 2,
    };
  }

  function initStars() {
    stars = [];
    for (let l = 0; l < STAR_LAYERS; l++) {
      const count = Math.floor(STAR_COUNT / STAR_LAYERS);
      for (let i = 0; i < count; i++) {
        stars.push(createStar(l));
      }
    }
  }

  /** Dibuja estrellas con parallax según posición del mouse */
  function drawStars() {
    ctx.clearRect(0, 0, width, height);

    stars.forEach((star) => {
      // Parallax suave según capa
      const parallaxX = (mouseX - width / 2) * star.layer * 0.008;
      const parallaxY = (mouseY - height / 2) * star.layer * 0.008;

      star.y += star.speed;
      star.twinkle += 0.02;

      // Reiniciar estrella al salir de pantalla
      if (star.y > height + 5) {
        star.y = -5;
        star.x = Math.random() * width;
      }

      const twinkleOpacity = star.opacity * (0.6 + 0.4 * Math.sin(star.twinkle));
      const drawX = star.x + parallaxX;
      const drawY = star.y + parallaxY;

      ctx.beginPath();
      ctx.arc(drawX, drawY, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(186, 230, 253, ${twinkleOpacity})`;
      ctx.fill();

      // Estrellas grandes con brillo
      if (star.radius > 1) {
        ctx.beginPath();
        ctx.arc(drawX, drawY, star.radius * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${twinkleOpacity * 0.15})`;
        ctx.fill();
      }
    });

    requestAnimationFrame(drawStars);
  }

  window.addEventListener('resize', () => {
    resizeCanvas();
    initStars();
  });

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  resizeCanvas();
  initStars();
  drawStars();

  // ==========================================
  // NAVBAR — Scroll y menú móvil
  // ==========================================
  const navbar = document.getElementById('navbar');
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });

  // ==========================================
  // CONTADORES animados al hacer scroll
  // ==========================================
  function animateCounter(el, target, suffix = '') {
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      el.textContent = current;
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  const statObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
          entry.target.dataset.counted = 'true';
          const target = parseInt(entry.target.dataset.target, 10);
          animateCounter(entry.target, target);
        }
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll('.stat-number').forEach((el) => statObserver.observe(el));

  // ==========================================
  // TABS interactivos
  // ==========================================
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;

      tabBtns.forEach((b) => b.classList.remove('active'));
      tabPanels.forEach((p) => p.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(`tab-${tabId}`).classList.add('active');

      // Animar barras del panel activo
      animatePanelBars(document.getElementById(`tab-${tabId}`));
    });
  });

  function animatePanelBars(panel) {
    panel.querySelectorAll('.bar-fill').forEach((bar) => {
      bar.style.width = '0';
      requestAnimationFrame(() => {
        bar.style.width = (bar.dataset.width || 80) + '%';
      });
    });
  }

  // Animar barra del primer tab al cargar
  animatePanelBars(document.getElementById('tab-privacidad'));

  // ==========================================
  // Hardware chips interactivos
  // ==========================================
  document.querySelectorAll('.hw-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
    });
  });

  // ==========================================
  // ACCORDION FAQ
  // ==========================================
  document.querySelectorAll('.accordion-trigger').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const item = trigger.parentElement;
      const isOpen = item.classList.contains('open');

      // Cerrar todos
      document.querySelectorAll('.accordion-item').forEach((i) => i.classList.remove('open'));

      if (!isOpen) item.classList.add('open');
    });
  });

  // ==========================================
  // SCROLL REVEAL — Elementos al entrar en vista
  // ==========================================
  const revealElements = document.querySelectorAll(
    '.feature-card, .section-header, .benchmark-card, .timeline-item, .accordion-item, .contact-card'
  );

  revealElements.forEach((el) => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), i * 80);
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  // ==========================================
  // BENCHMARK bars al scroll
  // ==========================================
  const benchmarkObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.metric-bar-h .fill').forEach((fill) => {
            const w = fill.style.width;
            fill.style.width = '0';
            requestAnimationFrame(() => {
              fill.style.width = w;
            });
          });
          benchmarkObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  const benchmarkCard = document.querySelector('.benchmark-card');
  if (benchmarkCard) benchmarkObserver.observe(benchmarkCard);

  // ==========================================
  // TILT effect en feature cards
  // ==========================================
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
      card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
      card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // ==========================================
  // Smooth anchor links
  // ==========================================
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

})();
