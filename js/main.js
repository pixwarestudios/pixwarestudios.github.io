function getBasePath() {
  const path = window.location.pathname;
  if (path.includes('/news/')) return '../';
  return '';
}

function initMobileNav() {
  const toggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('nav-mobile');
  if (!toggle || !mobileNav) return;

  toggle.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });

  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

function setActiveNav() {
  const page = document.body.dataset.page;
  if (!page) return;
  document.querySelectorAll('[data-nav]').forEach((link) => {
    link.classList.toggle('active', link.getAttribute('data-nav') === page);
  });
}

function initFooterYear() {
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));
}

function initModal() {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  const closeBtn = overlay.querySelector('.modal-close');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

function openModal(title, html) {
  const overlay = document.getElementById('modal-overlay');
  const body = document.getElementById('modal-body');
  const titleEl = document.getElementById('modal-title');
  if (!overlay || !body) return;
  if (titleEl) titleEl.textContent = title;
  body.innerHTML = html;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

window.openModal = openModal;
window.closeModal = closeModal;

async function initApp() {
  // Dynamically load i18n helper (optional) and initialize
  await new Promise((resolve) => {
    if (window.i18n) { resolve(); return; }
    const s = document.createElement('script');
    const base = getBasePath();
    s.src = base + 'js/i18n.js';
    s.onload = () => resolve();
    s.onerror = () => resolve();
    document.head.appendChild(s);
  });
  if (window.i18n && typeof window.i18n.init === 'function') window.i18n.init();
  // Load layout after i18n is ready so lang switcher works
  if (typeof injectLayout === 'function') {
    await injectLayout();
    // Re-init i18n after partial injection so lang switcher buttons work
    if (window.i18n && typeof window.i18n.init === 'function') window.i18n.init();
  }
  initMobileNav();
  setActiveNav();
  initFooterYear();
  initModal();

  if (typeof onPageReady === 'function') {
    await onPageReady();
  }

  initScrollAnimations();
}

document.addEventListener('DOMContentLoaded', initApp);
