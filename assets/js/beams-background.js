/* ZScaledIt — animated beams hero background
   Vanilla-canvas port (no React/framer-motion dependency) tuned to the
   site's existing purple/black theme. Pauses when off-screen or when the
   user prefers reduced motion. */
(function () {
  const canvas = document.getElementById('heroBeams');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Theme hues: brand purple (#8B5CF6) sits at ~hue 258. Keep beams in a
  // narrow band around it so the effect reads as "the site's purple", not
  // a generic rainbow.
  const HUE_MIN = 248;
  const HUE_MAX = 276;

  const MINIMUM_BEAMS = 14;
  let beams = [];
  let rafId = null;
  let running = false;

  function createBeam(width, height) {
    const angle = -35 + Math.random() * 10;
    return {
      x: Math.random() * width * 1.5 - width * 0.25,
      y: Math.random() * height * 1.5 - height * 0.25,
      width: 30 + Math.random() * 60,
      length: height * 2.5,
      angle: angle,
      speed: 0.6 + Math.random() * 1.2,
      opacity: 0.12 + Math.random() * 0.16,
      hue: HUE_MIN + Math.random() * (HUE_MAX - HUE_MIN),
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.03,
    };
  }

  function resetBeam(beam, index, total) {
    const column = index % 3;
    const spacing = canvas.width / 3;
    beam.y = canvas.height + 100;
    beam.x = column * spacing + spacing / 2 + (Math.random() - 0.5) * spacing * 0.5;
    beam.width = 100 + Math.random() * 100;
    beam.speed = 0.5 + Math.random() * 0.4;
    beam.hue = HUE_MIN + (index * (HUE_MAX - HUE_MIN)) / total;
    beam.opacity = 0.2 + Math.random() * 0.1;
    return beam;
  }

  function drawBeam(beam) {
    ctx.save();
    ctx.translate(beam.x, beam.y);
    ctx.rotate((beam.angle * Math.PI) / 180);

    const pulsingOpacity = beam.opacity * (0.8 + Math.sin(beam.pulse) * 0.2);

    const gradient = ctx.createLinearGradient(0, 0, 0, beam.length);
    gradient.addColorStop(0, `hsla(${beam.hue}, 80%, 65%, 0)`);
    gradient.addColorStop(0.1, `hsla(${beam.hue}, 80%, 65%, ${pulsingOpacity * 0.5})`);
    gradient.addColorStop(0.4, `hsla(${beam.hue}, 80%, 65%, ${pulsingOpacity})`);
    gradient.addColorStop(0.6, `hsla(${beam.hue}, 80%, 65%, ${pulsingOpacity})`);
    gradient.addColorStop(0.9, `hsla(${beam.hue}, 80%, 65%, ${pulsingOpacity * 0.5})`);
    gradient.addColorStop(1, `hsla(${beam.hue}, 80%, 65%, 0)`);

    ctx.fillStyle = gradient;
    ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
    ctx.restore();
  }

  function updateCanvasSize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    const total = Math.round(MINIMUM_BEAMS * 1.5);
    beams = Array.from({ length: total }, () => createBeam(canvas.width, canvas.height));
  }

  function animate() {
    if (!running) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.filter = 'blur(35px)';

    const total = beams.length;
    beams.forEach((beam, i) => {
      beam.y -= beam.speed;
      beam.pulse += beam.pulseSpeed;
      if (beam.y + beam.length < -100) resetBeam(beam, i, total);
      drawBeam(beam);
    });

    rafId = requestAnimationFrame(animate);
  }

  function start() {
    if (running) return;
    running = true;
    rafId = requestAnimationFrame(animate);
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  updateCanvasSize();
  window.addEventListener('resize', updateCanvasSize, { passive: true });

  if (prefersReducedMotion) {
    // Draw a single static frame instead of animating.
    ctx.filter = 'blur(35px)';
    beams.forEach(drawBeam);
  } else {
    // Pause the animation when the hero is off-screen or the tab is hidden.
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => (entry.isIntersecting ? start() : stop()));
    }, { threshold: 0 });
    observer.observe(canvas.parentElement);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else if (canvas.parentElement.getBoundingClientRect().bottom > 0) start();
    });
  }
})();
