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

// Results gallery — arrow buttons + click-drag scroll for desktop, native swipe on mobile
const resultsScroller = document.getElementById('resultsScroller');
if (resultsScroller) {
  const cardGap = 16;
  const scrollByCard = (dir) => {
    const card = resultsScroller.querySelector('.results__card');
    const step = card ? card.offsetWidth + cardGap : 260;
    resultsScroller.scrollBy({ left: dir * step, behavior: 'smooth' });
  };
  document.querySelector('.results__arrow--prev')?.addEventListener('click', () => scrollByCard(-1));
  document.querySelector('.results__arrow--next')?.addEventListener('click', () => scrollByCard(1));

  let isDown = false, startX = 0, startScroll = 0, dragged = false;
  resultsScroller.addEventListener('pointerdown', (e) => {
    isDown = true; dragged = false;
    startX = e.clientX;
    startScroll = resultsScroller.scrollLeft;
    resultsScroller.classList.add('is-dragging');
    resultsScroller.setPointerCapture(e.pointerId);
  });
  resultsScroller.addEventListener('pointermove', (e) => {
    if (!isDown) return;
    const delta = e.clientX - startX;
    if (Math.abs(delta) > 4) dragged = true;
    resultsScroller.scrollLeft = startScroll - delta;
  });
  const endDrag = () => { isDown = false; resultsScroller.classList.remove('is-dragging'); };
  resultsScroller.addEventListener('pointerup', endDrag);
  resultsScroller.addEventListener('pointerleave', endDrag);
  resultsScroller.addEventListener('click', (e) => { if (dragged) e.preventDefault(); }, true);
}

// Qualifying form
const QUALIFY_FORM_WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/5qykfCnwuEcAEMDJIwph/webhook-trigger/5525b602-da7c-4c8c-95df-c9bbdaf09116';

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
