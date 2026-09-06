/* =========================================================================
   Gemeinsames Verhalten: Navigation, Farbschema, Inhaltsverzeichnis.
   Alles progressiv: Ohne JavaScript bleiben sämtliche Inhalte lesbar.
   Keine externen Abhängigkeiten, keine Netzwerk-Requests, kein Tracking.
   ========================================================================= */
(function () {
  'use strict';

  var STORE_KEY = 'issec.theme';

  /* ---- Farbschema ---------------------------------------------------- */
  function readStored() {
    try { return localStorage.getItem(STORE_KEY); } catch (e) { return null; }
  }
  function writeStored(v) {
    try { v ? localStorage.setItem(STORE_KEY, v) : localStorage.removeItem(STORE_KEY); } catch (e) { /* egal */ }
  }
  function effectiveTheme() {
    var set = document.documentElement.getAttribute('data-theme');
    if (set) return set;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function applyTheme(theme) {
    if (theme) document.documentElement.setAttribute('data-theme', theme);
    else document.documentElement.removeAttribute('data-theme');
    syncToggle();
  }
  function syncToggle() {
    var btn = document.querySelector('[data-theme-toggle]');
    if (!btn) return;
    var dark = effectiveTheme() === 'dark';
    btn.setAttribute('aria-pressed', String(dark));
    var label = dark ? 'Helles Farbschema aktivieren' : 'Dunkles Farbschema aktivieren';
    btn.setAttribute('aria-label', label);
    btn.setAttribute('title', label);
    var sun = btn.querySelector('[data-icon="sun"]');
    var moon = btn.querySelector('[data-icon="moon"]');
    if (sun && moon) { sun.hidden = !dark; moon.hidden = dark; }
  }

  // Frühes Anwenden verhindert Aufblitzen (siehe Inline-Skript im <head>).
  var stored = readStored();
  if (stored === 'dark' || stored === 'light') applyTheme(stored);

  document.addEventListener('click', function (ev) {
    var btn = ev.target.closest && ev.target.closest('[data-theme-toggle]');
    if (!btn) return;
    var next = effectiveTheme() === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    writeStored(next);
  });

  /* ---- Mobile Navigation --------------------------------------------- */
  var navToggle = document.querySelector('[data-nav-toggle]');
  var nav = document.getElementById('hauptnavigation');
  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.focus();
      }
    });
    document.addEventListener('click', function (ev) {
      if (!nav.classList.contains('is-open')) return;
      if (nav.contains(ev.target) || navToggle.contains(ev.target)) return;
      nav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  }

  /* ---- Aktive Navigationsseite --------------------------------------- */
  (function markCurrent() {
    var here = location.pathname.replace(/index\.html$/, '').replace(/\/$/, '');
    document.querySelectorAll('.nav__link').forEach(function (a) {
      var target = a.getAttribute('href');
      if (!target || target.charAt(0) === '#') return;
      var path = new URL(a.href).pathname.replace(/index\.html$/, '').replace(/\/$/, '');
      if (path === here) a.setAttribute('aria-current', 'page');
    });
  })();

  /* ---- Inhaltsverzeichnis aus Überschriften -------------------------- */
  var tocHost = document.querySelector('[data-toc]');
  var article = document.querySelector('[data-toc-source]');
  if (tocHost && article) {
    var heads = article.querySelectorAll('h2[id], h3[id]');
    if (heads.length > 2) {
      var ol = document.createElement('ol');
      heads.forEach(function (h) {
        var li = document.createElement('li');
        if (h.tagName === 'H3') li.className = 'toc--h3';
        var a = document.createElement('a');
        a.href = '#' + h.id;
        a.textContent = (h.dataset.tocLabel || h.textContent).trim();
        li.appendChild(a);
        ol.appendChild(li);
      });
      tocHost.appendChild(ol);

      if ('IntersectionObserver' in window) {
        var links = {};
        tocHost.querySelectorAll('a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
        var visible = new Set();
        var obs = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) visible.add(e.target.id); else visible.delete(e.target.id);
          });
          var order = Array.prototype.map.call(heads, function (h) { return h.id; });
          var first = order.find(function (id) { return visible.has(id); });
          Object.keys(links).forEach(function (id) { links[id].classList.toggle('is-active', id === first); });
        }, { rootMargin: '-90px 0px -70% 0px', threshold: 0 });
        heads.forEach(function (h) { obs.observe(h); });
      }
    } else {
      tocHost.closest('.toc') && (tocHost.closest('.toc').hidden = true);
    }
  }

  /* ---- Stand-Datum --------------------------------------------------- */
  document.querySelectorAll('[data-today]').forEach(function (el) {
    el.textContent = new Date().toLocaleDateString('de-AT', { day: '2-digit', month: 'long', year: 'numeric' });
  });

  /* ---- Countdown bis Stichtag ---------------------------------------- */
  document.querySelectorAll('[data-countdown]').forEach(function (el) {
    var target = new Date(el.dataset.countdown + 'T00:00:00+02:00');
    var days = Math.ceil((target - new Date()) / 86400000);
    var out = el.querySelector('[data-countdown-value]');
    var txt = el.querySelector('[data-countdown-text]');
    if (!out) return;
    if (days > 1) { out.textContent = days; if (txt) txt.textContent = 'Tage bis ' + (el.dataset.countdownLabel || 'zum Stichtag'); }
    else if (days === 1) { out.textContent = '1'; if (txt) txt.textContent = 'Tag bis ' + (el.dataset.countdownLabel || 'zum Stichtag'); }
    else if (days === 0) { out.textContent = 'Heute'; if (txt) txt.textContent = (el.dataset.countdownLabel || 'Stichtag') + ' ist heute'; }
    else { out.textContent = Math.abs(days); if (txt) txt.textContent = 'Tage seit ' + (el.dataset.countdownLabel || 'dem Stichtag'); }
  });
})();

/* =========================================================================
   Kleine Helfer, die mehrere Werkzeuge gemeinsam nutzen.
   ========================================================================= */
window.ISSEC = (function () {
  'use strict';

  function download(filename, text, mime) {
    var blob = new Blob([text], { type: (mime || 'text/plain') + ';charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function copy(text, button) {
    function feedback(ok) {
      if (!button) return;
      var original = button.dataset.originalLabel || button.textContent;
      button.dataset.originalLabel = original;
      button.textContent = ok ? 'Kopiert' : 'Kopieren nicht möglich';
      setTimeout(function () { button.textContent = original; }, 2000);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { feedback(true); }, function () { feedback(false); });
      return;
    }
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    feedback(ok);
  }

  function announce(el, message) {
    if (!el) return;
    el.textContent = '';
    setTimeout(function () { el.textContent = message; }, 60);
  }

  function fmtDateTime(d) {
    return d.toLocaleString('de-AT', {
      weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  function loadJSON(url) {
    return fetch(url, { credentials: 'omit' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  return {
    download: download,
    copy: copy,
    announce: announce,
    fmtDateTime: fmtDateTime,
    loadJSON: loadJSON,
    escapeHTML: escapeHTML
  };
})();
