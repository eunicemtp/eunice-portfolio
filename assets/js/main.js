/* =============================================
   EUNICE MUTOPE — Portfolio
   main.js
   ============================================= */

// === CUSTOM CURSOR ===
const cur  = document.getElementById('cur');
const cur2 = document.getElementById('cur2');

if (cur && cur2 && window.matchMedia('(pointer: fine)').matches) {
  let mx = 0, my = 0, x = 0, y = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cur.style.left = mx + 'px';
    cur.style.top  = my + 'px';
  });

  (function loop() {
    x += (mx - x) * 0.14;
    y += (my - y) * 0.14;
    cur2.style.left = x + 'px';
    cur2.style.top  = y + 'px';
    requestAnimationFrame(loop);
  })();
}

// === MOBILE NAV TOGGLE ===
const toggle  = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (toggle && navMenu) {
  toggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
  });

  // Close on link click
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navMenu.classList.remove('open'));
  });
}

// === NAV SCROLL HIDE/SHOW ===
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const current = window.scrollY;
  // Show nav when at top
  if (current <= 60) {
    navbar.style.transform = 'translateY(0)';
  }
  lastScroll = current;
}, { passive: true });

// === SCROLL REVEAL ===
const revealEls = document.querySelectorAll(
  '.sv-card, .ab-stat, .proj-item, .hero-pill, h1, .hero-tagline, .hero-bottom'
);

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => {
  el.classList.add('reveal');
  observer.observe(el);
});

// === ACTIVE NAV LINK ON SCROLL ===
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-r a[href^="#"]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + entry.target.id) {
          link.classList.add('active');
        }
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

// === YEAR IN FOOTER ===
const ftYear = document.querySelector('.ft-l');
if (ftYear) {
  ftYear.textContent = ftYear.textContent.replace('2025', new Date().getFullYear());
}
