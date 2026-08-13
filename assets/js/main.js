/* Kairo — main.js */

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

// Theme toggle (light/dark), defaults to dark, persisted in localStorage
const THEME_KEY = 'kairo-theme';
const toggles = document.querySelectorAll('.theme-toggle');

function syncToggles(theme) {
  toggles.forEach(t => t.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false'));
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
  syncToggles(theme);
}

syncToggles(document.documentElement.getAttribute('data-theme') || 'dark');

toggles.forEach(t => t.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  setTheme(current === 'dark' ? 'light' : 'dark');
}));

// Ambient background glow — fades in once per section as it scrolls into view
const atmosObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('is-on');
      atmosObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.atmos').forEach(el => atmosObserver.observe(el));

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

// Mobile hero lead form (logo/headline/form-only first fold)
// TODO(Izaiah): paste your GHL inbound webhook URL here before this goes live —
// without it, submissions are not sent anywhere.
const HERO_FORM_WEBHOOK_URL = '';

const heroForm = document.getElementById('heroLeadForm');
if (heroForm) {
  const heroFormNote = document.getElementById('heroFormNote');
  heroForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = heroForm.querySelector('.hero-form__submit');
    const data = Object.fromEntries(new FormData(heroForm).entries());

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    if (HERO_FORM_WEBHOOK_URL) {
      try {
        await fetch(HERO_FORM_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } catch (err) {
        console.error('Hero form submission failed:', err);
      }
    } else {
      console.warn('HERO_FORM_WEBHOOK_URL is not set — hero form submission was not sent anywhere.', data);
    }

    heroForm.reset();
    submitBtn.disabled = false;
    submitBtn.textContent = "We'll be in touch shortly";
    if (heroFormNote) heroFormNote.textContent = "Thanks — we'll text or call you within 24 hours.";
  });
}
