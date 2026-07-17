/* ZScaledIt — fixed stone-graph backdrop + grand-opening intro + interaction
   A faceted-crystal ascending "scaling graph," fixed behind the whole
   page. Plays a draw-in animation behind an ink curtain on every full
   page load/refresh, then settles into place as the permanent backdrop.
   On desktop pointers, stones tilt toward the cursor when it passes
   near, and spin on click/tap (works on touch too). Respects
   prefers-reduced-motion (shows final state instantly, no interaction). */
(function () {
  const STONE_SVG = `
<svg viewBox="0 0 1180 720" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <g class="stone-graph__stone" style="--stone-i:0">
    <g class="stone-graph__tilt">
    <path d="M90.0,640.0 L135.7,634.0 L117.6,670.7 Z" fill="#794eda"/>
    <path d="M90.0,640.0 L117.6,670.7 L85.5,677.8 Z" fill="#2d1a5b"/>
    <path d="M90.0,640.0 L85.5,677.8 L61.5,659.7 Z" fill="#14121b"/>
    <path d="M90.0,640.0 L61.5,659.7 L43.6,638.2 Z" fill="#21163d"/>
    <path d="M90.0,640.0 L43.6,638.2 L55.6,614.4 Z" fill="#5935a6"/>
    <path d="M90.0,640.0 L55.6,614.4 L92.3,605.8 Z" fill="#976ef7"/>
    <path d="M90.0,640.0 L92.3,605.8 L119.4,618.4 Z" fill="#cbb9fc"/>
    <path d="M90.0,640.0 L119.4,618.4 L135.7,634.0 Z" fill="#1d1531"/>
    </g>
  </g>
  <g class="stone-graph__stone" style="--stone-i:1">
    <g class="stone-graph__tilt">
    <path d="M260.0,548.0 L318.6,548.7 L294.3,576.7 Z" fill="#784dd8"/>
    <path d="M260.0,548.0 L294.3,576.7 L261.7,595.3 Z" fill="#38216e"/>
    <path d="M260.0,548.0 L261.7,595.3 L238.0,596.1 Z" fill="#1b142c"/>
    <path d="M260.0,548.0 L238.0,596.1 L201.7,558.8 Z" fill="#16121f"/>
    <path d="M260.0,548.0 L201.7,558.8 L216.3,529.1 Z" fill="#40267b"/>
    <path d="M260.0,548.0 L216.3,529.1 L230.2,509.7 Z" fill="#744ad1"/>
    <path d="M260.0,548.0 L230.2,509.7 L267.5,511.1 Z" fill="#a886f9"/>
    <path d="M260.0,548.0 L267.5,511.1 L311.7,517.2 Z" fill="#ccbbfc"/>
    <path d="M260.0,548.0 L311.7,517.2 L318.6,548.7 Z" fill="#22173f"/>
    </g>
  </g>
  <g class="stone-graph__stone" style="--stone-i:2">
    <g class="stone-graph__tilt">
    <path d="M430.0,456.0 L500.8,451.7 L482.5,493.5 Z" fill="#7e52e2"/>
    <path d="M430.0,456.0 L482.5,493.5 L437.9,515.6 Z" fill="#3f2579"/>
    <path d="M430.0,456.0 L437.9,515.6 L393.6,499.5 Z" fill="#181326"/>
    <path d="M430.0,456.0 L393.6,499.5 L361.3,487.8 Z" fill="#15121d"/>
    <path d="M430.0,456.0 L361.3,487.8 L360.4,437.3 Z" fill="#2d1a59"/>
    <path d="M430.0,456.0 L360.4,437.3 L390.0,402.6 Z" fill="#6e45c8"/>
    <path d="M430.0,456.0 L390.0,402.6 L445.3,395.2 Z" fill="#aa8af9"/>
    <path d="M430.0,456.0 L445.3,395.2 L480.8,432.4 Z" fill="#ccbbfc"/>
    <path d="M430.0,456.0 L480.8,432.4 L500.8,451.7 Z" fill="#231740"/>
    </g>
  </g>
  <g class="stone-graph__stone" style="--stone-i:3">
    <g class="stone-graph__tilt">
    <path d="M600.0,364.0 L671.5,356.4 L662.1,416.2 Z" fill="#7d51e1"/>
    <path d="M600.0,364.0 L662.1,416.2 L586.8,435.8 Z" fill="#311d61"/>
    <path d="M600.0,364.0 L586.8,435.8 L526.6,405.6 Z" fill="#14121a"/>
    <path d="M600.0,364.0 L526.6,405.6 L519.7,366.6 Z" fill="#21163d"/>
    <path d="M600.0,364.0 L519.7,366.6 L540.0,314.4 Z" fill="#5734a3"/>
    <path d="M600.0,364.0 L540.0,314.4 L599.4,302.9 Z" fill="#966df7"/>
    <path d="M600.0,364.0 L599.4,302.9 L667.8,307.6 Z" fill="#c9b7fc"/>
    <path d="M600.0,364.0 L667.8,307.6 L671.5,356.4 Z" fill="#1c142f"/>
    </g>
  </g>
  <g class="stone-graph__stone" style="--stone-i:4">
    <g class="stone-graph__tilt">
    <path d="M770.0,272.0 L853.9,277.7 L819.7,331.4 Z" fill="#6f46c9"/>
    <path d="M770.0,272.0 L819.7,331.4 L750.4,337.8 Z" fill="#291950"/>
    <path d="M770.0,272.0 L750.4,337.8 L690.6,290.5 Z" fill="#14121c"/>
    <path d="M770.0,272.0 L690.6,290.5 L692.1,229.4 Z" fill="#42277e"/>
    <path d="M770.0,272.0 L692.1,229.4 L732.9,187.0 Z" fill="#8053e5"/>
    <path d="M770.0,272.0 L732.9,187.0 L825.8,218.6 Z" fill="#c2acfb"/>
    <path d="M770.0,272.0 L825.8,218.6 L853.9,277.7 Z" fill="#1f1536"/>
    </g>
  </g>
  <g class="stone-graph__stone" style="--stone-i:5">
    <g class="stone-graph__tilt">
    <path d="M940.0,180.0 L1067.6,171.8 L1000.6,238.1 Z" fill="#794eda"/>
    <path d="M940.0,180.0 L1000.6,238.1 L897.1,272.1 Z" fill="#28194f"/>
    <path d="M940.0,180.0 L897.1,272.1 L820.7,211.6 Z" fill="#15121d"/>
    <path d="M940.0,180.0 L820.7,211.6 L827.6,126.8 Z" fill="#3d2477"/>
    <path d="M940.0,180.0 L827.6,126.8 L902.0,91.2 Z" fill="#7e52e1"/>
    <path d="M940.0,180.0 L902.0,91.2 L1021.5,121.2 Z" fill="#c5b1fc"/>
    <path d="M940.0,180.0 L1021.5,121.2 L1067.6,171.8 Z" fill="#1e1535"/>
    </g>
  </g>
  <polyline class="stone-graph__line" points="90.0,605.8 260.0,509.7 430.0,395.2 600.0,302.9 770.0,187.0 940.0,91.2" fill="none" />
  <path class="stone-graph__arrow" d="M974.0,45.2 L946.0,85.2 L980.0,87.2 Z" />
</svg>`;

  const bg = document.createElement('div');
  bg.className = 'stone-graph-bg';
  bg.innerHTML = STONE_SVG;
  document.body.insertBefore(bg, document.body.firstChild);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced) {
    bg.classList.add('is-in');
    return;
  }

  const curtain = document.createElement('div');
  curtain.className = 'intro-curtain';
  document.body.appendChild(curtain);

  requestAnimationFrame(() => {
    bg.classList.add('is-in');
    setTimeout(() => curtain.classList.add('is-out'), 520);
    setTimeout(() => curtain.remove(), 950);
  });

  /* ── Interaction: magnetic tilt on hover (desktop), spin on click/tap (everywhere) ── */
  const tilts = Array.from(bg.querySelectorAll('.stone-graph__tilt'));
  const RADIUS = 260;
  const MAX_TILT = 22;

  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  let paused = new Set();
  let rafQueued = false;
  let lastX = -9999, lastY = -9999;

  function applyTilt() {
    rafQueued = false;
    tilts.forEach((t) => {
      if (paused.has(t)) return;
      const rect = t.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = lastX - cx, dy = lastY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < RADIUS) {
        const strength = 1 - dist / RADIUS;
        const rotY = (dx / RADIUS) * MAX_TILT * strength;
        const rotX = -(dy / RADIUS) * MAX_TILT * strength;
        t.style.transform = `perspective(500px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale(${(1 + strength * 0.08).toFixed(3)})`;
      } else {
        t.style.transform = '';
      }
    });
  }

  if (canHover) {
    window.addEventListener('mousemove', (e) => {
      lastX = e.clientX; lastY = e.clientY;
      if (!rafQueued) { rafQueued = true; requestAnimationFrame(applyTilt); }
    });
    window.addEventListener('mouseleave', () => {
      tilts.forEach((t) => { if (!paused.has(t)) t.style.transform = ''; });
    });
  }

  function spin(t) {
    paused.add(t);
    t.style.transform = '';
    t.classList.remove('is-spinning');
    void t.getBoundingClientRect(); // force reflow so the animation restarts cleanly
    t.classList.add('is-spinning');
    const onEnd = () => {
      t.classList.remove('is-spinning');
      paused.delete(t);
      t.removeEventListener('animationend', onEnd);
    };
    t.addEventListener('animationend', onEnd);
  }

  document.addEventListener('click', (e) => {
    const cx = e.clientX, cy = e.clientY;
    let nearest = null, nearestDist = 140; // click-target radius
    tilts.forEach((t) => {
      const rect = t.getBoundingClientRect();
      const dx = cx - (rect.left + rect.width / 2);
      const dy = cy - (rect.top + rect.height / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < nearestDist) { nearestDist = dist; nearest = t; }
    });
    if (nearest) spin(nearest);
  });
})();
