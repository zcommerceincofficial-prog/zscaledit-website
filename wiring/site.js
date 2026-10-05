/*
  wiring/site.js
  The three motion moments and the two small behaviours from the Claude Design export,
  rebuilt without the React runtime so every page ships as finished HTML.

  The HTML already shows the END state of every moment (all dots lit, all steps shown),
  so a visitor with JavaScript blocked or reduced motion turned on sees a complete page.
  This script only adds the motion on top, and it is a no-op under prefers-reduced-motion.

  1. Map: plotter head sweeps left to right, each dot lights as it passes, then the first
     metro is selected. Tap, focus or hover a dot to select it.
  2. How it works: the five steps tick on as status lines when the list scrolls into view.
  3. Primary buttons: a bar fills along the bottom edge, then the page navigates.
  4. Book: "You're booked" line when the URL has ?booked=1 or the calendar posts a booking.
  5. Referrals: the form sends with fetch and says so in place; without JavaScript it posts
     normally and /api/referral sends the visitor back with ?sent=1 or ?error=1.
  Copied untouched into dist/ by scripts/kairo-build.mjs. Never edit dist/wiring/site.js.
*/
(function () {
  'use strict';
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function onVisible(el, threshold, fn) {
    if (!el) return;
    if (!('IntersectionObserver' in window)) { fn(); return; }
    var io = new IntersectionObserver(function (es) {
      for (var i = 0; i < es.length; i++) if (es[i].isIntersecting) { io.disconnect(); fn(); return; }
    }, { threshold: threshold });
    io.observe(el);
  }

  // time fraction at which the shared easing curve cubic-bezier(0.16,1,0.3,1) reaches progress p
  var lut = null;
  function inv(p) {
    if (!lut) {
      lut = [];
      var bz = function (t, a, b) { return 3 * a * t * (1 - t) * (1 - t) + 3 * b * t * t * (1 - t) + t * t * t; };
      for (var i = 0; i <= 200; i++) { var t = i / 200; lut.push([bz(t, 0.16, 0.3), bz(t, 1, 1)]); }
    }
    for (var j = 0; j < lut.length; j++) if (lut[j][1] >= p) return lut[j][0];
    return 1;
  }

  // ---------------------------------------------------------------- 1. map
  function wireMap(map) {
    var box = map.parentElement;
    var head = map.previousElementSibling;
    var buttons = Array.prototype.slice.call(map.querySelectorAll('button[data-metro]'));
    var section = map.closest('section');
    var live = section ? section.querySelector('p[aria-live]') : null;
    var nameTpl = live && live.children[0] ? live.children[0].cloneNode(false) : null;
    var msgTpl = live && live.children[1] ? live.children[1].cloneNode(true) : null;

    function select(name) {
      buttons.forEach(function (b) {
        var on = b.getAttribute('data-metro') === name;
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        var dot = b.firstElementChild;
        if (dot) dot.style.transform = on ? 'scale(1.9)' : 'scale(1)';
      });
      if (live && nameTpl && msgTpl) {
        var n = nameTpl.cloneNode(false);
        n.textContent = name;
        live.innerHTML = '';
        live.appendChild(n);
        live.appendChild(msgTpl.cloneNode(true));
      }
    }
    buttons.forEach(function (b) {
      var pick = function () { select(b.getAttribute('data-metro')); };
      b.addEventListener('click', pick);
      b.addEventListener('focus', pick);
      b.addEventListener('mouseenter', pick);
    });

    if (reduced || !buttons.length) return;

    // start from the dark state, then sweep
    buttons.forEach(function (b) {
      var dot = b.firstElementChild;
      b.setAttribute('aria-pressed', 'false');
      dot.style.transition = 'none';
      dot.style.opacity = '0';
      dot.style.transform = 'scale(0.2)';
    });
    if (live) live.innerHTML = '';
    if (head) { head.style.transition = 'none'; head.style.transform = 'translateX(0)'; head.style.opacity = '0'; }
    void map.offsetWidth;

    onVisible(box, 0.3, function () {
      if (head) {
        head.style.transition = 'transform 1200ms cubic-bezier(0.16,1,0.3,1), opacity 220ms cubic-bezier(0.16,1,0.3,1)';
        head.style.opacity = '1';
        head.style.transform = 'translateX(100%)';
      }
      buttons.forEach(function (b) {
        var dot = b.firstElementChild;
        var x = parseFloat(b.style.left) || 0;
        var d = Math.round(inv(Math.min(1, Math.max(0, x / 100))) * 1200) + 'ms';
        dot.style.transition = 'opacity 600ms cubic-bezier(0.16,1,0.3,1) ' + d + ', transform 220ms cubic-bezier(0.16,1,0.3,1) ' + d;
        dot.style.opacity = '1';
        dot.style.transform = 'scale(1)';
      });
      setTimeout(function () {
        if (head) head.style.opacity = '0';
        buttons.forEach(function (b) {
          b.firstElementChild.style.transition = 'opacity 600ms cubic-bezier(0.16,1,0.3,1), transform 220ms cubic-bezier(0.16,1,0.3,1)';
        });
        if (!buttons.some(function (b) { return b.getAttribute('aria-pressed') === 'true'; })) {
          select(buttons[0].getAttribute('data-metro'));
        }
      }, 1700);
    });
  }

  // ---------------------------------------------------------------- 2. steps
  function wireSteps(list) {
    if (reduced) return;
    var items = Array.prototype.slice.call(list.children);
    var saved = items.map(function (li) {
      var led = li.querySelector('span[aria-hidden]');
      var s = { li: li, led: led, t: li.style.transition, lt: led ? led.style.transition : '' };
      li.style.transition = 'none';
      li.style.opacity = '0';
      li.style.transform = 'translateX(-16px)';
      if (led) { led.style.transition = 'none'; led.style.transform = 'scale(0)'; }
      return s;
    });
    void list.offsetWidth;
    onVisible(list, 0.2, function () {
      saved.forEach(function (s, i) {
        s.li.style.transition = 'opacity 600ms cubic-bezier(0.16,1,0.3,1) ' + (i * 150) + 'ms, transform 600ms cubic-bezier(0.16,1,0.3,1) ' + (i * 150) + 'ms';
        s.li.style.opacity = '1';
        s.li.style.transform = 'translateX(0)';
        if (s.led) {
          s.led.style.transition = 'transform 220ms cubic-bezier(0.16,1,0.3,1) ' + (220 + i * 150) + 'ms';
          s.led.style.transform = 'scale(1)';
        }
      });
    });
  }

  // ---------------------------------------------------------------- 3. button press
  function wirePress(a) {
    var bar = a.lastElementChild;
    if (!bar || bar.tagName !== 'SPAN') return;
    a.addEventListener('click', function (e) {
      if (reduced || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      var href = a.getAttribute('href');
      e.preventDefault();
      bar.style.transform = 'scaleX(1)';
      a.setAttribute('aria-busy', 'true');
      setTimeout(function () {
        window.location.href = href;
        if (href.charAt(0) === '#') { bar.style.transform = 'scaleX(0)'; a.setAttribute('aria-busy', 'false'); }
      }, 380);
    });
    window.addEventListener('pageshow', function () { bar.style.transform = 'scaleX(0)'; a.setAttribute('aria-busy', 'false'); });
  }

  // ---------------------------------------------------------------- 4. booked line
  function wireBooked(widget) {
    var section = widget.closest('section');
    var line = section ? section.querySelector('p[aria-live]') : null;
    if (!line) return;
    var text = line.getAttribute('data-booked-text') || '';
    var show = function () { line.textContent = text; };
    if (/[?&]booked=1/.test(window.location.search)) show();
    window.addEventListener('message', function (e) {
      var s = '';
      try { s = typeof e.data === 'string' ? e.data : JSON.stringify(e.data); } catch (err) { return; }
      if (/(appointment|booking)[^a-z]{0,24}(booked|confirmed|created|success)/i.test(s)) show();
    });
  }

  // ---------------------------------------------------------------- 5. referral form
  function wireReferral(form) {
    var status = form.querySelector('.ref-status');
    var button = form.querySelector('button[type="submit"]');
    var say = function (key) { status.textContent = status.getAttribute('data-' + key + '-text') || ''; };
    // if the send fails, nothing is lost: a mailto with every field already typed in
    var fallback = form.querySelector('.ref-fallback');
    var offerEmail = function () {
      var lines = [];
      Array.prototype.forEach.call(form.querySelectorAll('input, select, textarea'), function (el) {
        if (el.name === 'company_website' || !el.value) return;
        var label = el.closest('label');
        var name = label ? (label.firstElementChild && label.firstElementChild.tagName === 'SPAN' ? label.firstElementChild.textContent : label.firstChild.textContent) : el.name;
        lines.push(name.replace(/\(optional\)/, '').trim() + ': ' + el.value);
      });
      var a = fallback.querySelector('a');
      a.href = 'mailto:izaiah@torqcrm.com?subject=' + encodeURIComponent('Referral') + '&body=' + encodeURIComponent(lines.join('\n'));
      fallback.hidden = false;
    };
    if (/[?&]sent=1/.test(window.location.search)) say('sent');
    if (/[?&]error=1/.test(window.location.search)) say('error');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = [];
      Array.prototype.forEach.call(form.querySelectorAll('input, select, textarea'), function (el) {
        if (el.name === 'company_website') return;
        var ok = el.checkValidity();
        el.setAttribute('aria-invalid', ok ? 'false' : 'true');
        if (!ok) bad.push(el);
      });
      if (bad.length) { say('invalid'); bad[0].focus(); return; }

      button.disabled = true;
      button.setAttribute('aria-busy', 'true');
      status.textContent = '';
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) { return r.ok ? r.json() : { ok: false }; })
        .catch(function () { return { ok: false }; })
        .then(function (res) {
          button.disabled = false;
          button.setAttribute('aria-busy', 'false');
          if (res && res.ok) { form.reset(); fallback.hidden = true; say('sent'); }
          else { say('error'); offerEmail(); }
        });
    });
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('#market-map'), wireMap);
    var steps = document.querySelector('section[data-screen-label="02 Five steps"] ol');
    if (steps) wireSteps(steps);
    Array.prototype.forEach.call(document.querySelectorAll('a[aria-busy]'), wirePress);
    var widget = document.getElementById('booking-widget');
    if (widget) wireBooked(widget);
    var referral = document.getElementById('referral-form');
    if (referral) wireReferral(referral);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
