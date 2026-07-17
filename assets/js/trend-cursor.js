/* ZScaledIt — uptrend-arrow hover effect (signature element, represents scale)
   System cursor stays visible; this graphic only appears while hovering
   an interactive element. Desktop pointer only; no-op under touch or
   prefers-reduced-motion. */
(function () {
  const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!mq.matches || reduced) return;

  const el = document.createElement('div');
  el.className = 'trend-cursor';
  el.innerHTML = `
    <span class="trend-cursor__inner">
      <svg viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg">
        <path d="M4,28 L13,17 L18,21 L27,7" />
        <path d="M27,7 L27,14 M27,7 L20,7" />
      </svg>
    </span>`;
  document.body.appendChild(el);

  let x = 0, y = 0, drawnX = 0, drawnY = 0;
  const EASE = 0.3;

  window.addEventListener('mousemove', (e) => {
    x = e.clientX; y = e.clientY;
  });

  const targets = 'a, button, .btn, .block, .svc, .case-card, .preview-card, input, textarea';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(targets)) el.classList.add('is-active');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(targets)) el.classList.remove('is-active');
  });
  document.addEventListener('mouseleave', () => el.classList.remove('is-active'));

  function tick() {
    drawnX += (x - drawnX) * EASE;
    drawnY += (y - drawnY) * EASE;
    el.style.transform = `translate(${drawnX - 2}px, ${drawnY - 30}px)`;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
