/* ZScaledIt — precision-targeting reticle cursor (signature element)
   Desktop pointer only; no-op under touch or prefers-reduced-motion (handled in CSS + here). */
(function () {
  const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!mq.matches || reduced) return;

  document.body.classList.add('reticle-on');

  const el = document.createElement('div');
  el.className = 'reticle';
  el.innerHTML = '<div class="reticle__ring"></div><div class="reticle__label">target</div>';
  document.body.appendChild(el);

  let x = 0, y = 0, drawnX = 0, drawnY = 0;
  const EASE = 0.32;

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
    el.style.transform = `translate(${drawnX}px, ${drawnY}px) translate(-50%,-50%)`;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
