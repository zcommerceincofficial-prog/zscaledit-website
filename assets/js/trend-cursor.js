/* ZScaledIt — squiggly uptrend-arrow cursor (signature element, represents scale)
   Desktop pointer only; no-op under touch or prefers-reduced-motion. */
(function () {
  const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!mq.matches || reduced) return;

  document.body.classList.add('trend-cursor-on');

  const el = document.createElement('div');
  el.className = 'trend-cursor';
  el.innerHTML = `
    <span class="trend-cursor__inner">
      <svg viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg">
        <path d="M3,30 C7,26 5,23 9,21 C13,19 11,15 15,13 C19,11 17,8 21,6.5 C24,5.3 25,4.5 27,3.5" />
        <path d="M27,3.5 L27.5,9 M27,3.5 L21.5,4.8" />
      </svg>
    </span>`;
  document.body.appendChild(el);

  let x = 0, y = 0, drawnX = 0, drawnY = 0;
  const EASE = 0.3;

  window.addEventListener('mousemove', (e) => {
    x = e.clientX; y = e.clientY;
    if (el.style.opacity !== '1') el.style.opacity = '1';
  });
  document.addEventListener('mouseleave', () => { el.style.opacity = '0'; });

  const targets = 'a, button, .btn, .block, .svc, .case-card, .preview-card, input, textarea';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(targets)) el.classList.add('is-active');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(targets)) el.classList.remove('is-active');
  });

  function tick() {
    drawnX += (x - drawnX) * EASE;
    drawnY += (y - drawnY) * EASE;
    el.style.transform = `translate(${drawnX - 2}px, ${drawnY - 30}px)`;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
