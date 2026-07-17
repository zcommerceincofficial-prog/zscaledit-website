/* ZScaledIt — main.js */

// Mobile rail panel
const topToggle = document.getElementById('railToggle');
const railPanel = document.getElementById('railPanel');
const railClose = document.getElementById('railClose');

function openRail() {
  railPanel.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeRail() {
  railPanel.classList.remove('open');
  document.body.style.overflow = '';
}

if (topToggle) topToggle.addEventListener('click', openRail);
if (railClose) railClose.addEventListener('click', closeRail);
if (railPanel) {
  railPanel.querySelectorAll('a').forEach(a => a.addEventListener('click', closeRail));
}

// Mark active nav link (rail + mobile panel)
const path = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.rail__nav a, .rail__mobile-panel a').forEach(a => {
  const href = a.getAttribute('href');
  if (href === path || (path === '' && href === 'index.html')) {
    a.classList.add('active');
  }
});

// Theme toggle (light/dark), defaults to light, persisted in localStorage
const THEME_KEY = 'zs-theme';
const toggles = document.querySelectorAll('.theme-toggle');

function syncToggles(theme) {
  toggles.forEach(t => t.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false'));
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
  syncToggles(theme);
}

syncToggles(document.documentElement.getAttribute('data-theme') || 'light');

toggles.forEach(t => t.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  setTheme(current === 'dark' ? 'light' : 'dark');
}));

// Fade-in on scroll
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.08 });
document.querySelectorAll('.fade').forEach(el => fadeObserver.observe(el));

// Animated number counters (rail ticker + any [data-n] element)
function countUp(el, target, suffix) {
  const dur = 1100;
  const start = performance.now();
  const update = (now) => {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(eased * target) + suffix;
    if (p < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting && !e.target.dataset.done) {
      e.target.dataset.done = '1';
      countUp(e.target, +e.target.dataset.n, e.target.dataset.s || '');
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-n]').forEach(el => counterObserver.observe(el));
