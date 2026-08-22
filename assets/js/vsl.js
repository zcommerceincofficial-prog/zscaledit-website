/* Kairo — VSL page JS */

// Ambient background glow — fades in once as it scrolls into view
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

// Qualifying form
// TODO(Izaiah): paste your GHL inbound webhook URL here before this goes live —
// without it, submissions are not sent anywhere.
const QUALIFY_FORM_WEBHOOK_URL = '';

const qualifyForm = document.getElementById('qualifyForm');
if (qualifyForm) {
  qualifyForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = qualifyForm.querySelector('.qform__submit');
    const data = Object.fromEntries(new FormData(qualifyForm).entries());

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    if (QUALIFY_FORM_WEBHOOK_URL) {
      try {
        await fetch(QUALIFY_FORM_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } catch (err) {
        console.error('Qualify form submission failed:', err);
      }
    } else {
      console.warn('QUALIFY_FORM_WEBHOOK_URL is not set — form submission was not sent anywhere.', data);
    }

    const section = document.getElementById('qformSection');
    section.innerHTML = `
      <div class="qform__success">
        <h3>Got it — thank you.</h3>
        <p>I'll personally review this and follow up within 24 hours.</p>
      </div>`;
  });
}
