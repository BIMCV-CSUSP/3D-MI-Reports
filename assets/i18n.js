/*
 * MI_LANG — tiny bilingual helper shared by all pages (es / en).
 *
 * Language resolution: ?lang=xx  >  localStorage  >  browser  >  'es'.
 * Pages mark translatable nodes with data-i18n="key" (text) and
 * data-i18n-title="key" (title attribute); MI_LANG.apply(dict) fills them.
 */
(function (global) {
  'use strict';

  var SUPPORTED = ['es', 'en'];
  var KEY = 'mi-reports-lang';

  function resolve() {
    var m = /[?&]lang=(es|en)\b/.exec(location.search);
    if (m) return m[1];
    try { var s = localStorage.getItem(KEY); if (SUPPORTED.indexOf(s) >= 0) return s; } catch (e) {}
    var nav = (navigator.language || 'es').slice(0, 2).toLowerCase();
    return SUPPORTED.indexOf(nav) >= 0 ? nav : 'es';
  }

  var current = resolve();
  var listeners = [];

  function t(value) {
    // value may be a plain string or {es:'…', en:'…'}
    if (value == null) return '';
    if (typeof value === 'string') return value;
    return value[current] || value.en || value.es || '';
  }

  function apply(dict, root) {
    root = root || document;
    var nodes = root.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var v = dict[nodes[i].getAttribute('data-i18n')];
      if (v !== undefined) nodes[i].innerHTML = t(v);
    }
    nodes = root.querySelectorAll('[data-i18n-title]');
    for (i = 0; i < nodes.length; i++) {
      v = dict[nodes[i].getAttribute('data-i18n-title')];
      if (v !== undefined) nodes[i].title = t(v);
    }
    nodes = root.querySelectorAll('[data-i18n-alt]');
    for (i = 0; i < nodes.length; i++) {
      v = dict[nodes[i].getAttribute('data-i18n-alt')];
      if (v !== undefined) nodes[i].alt = t(v);
    }
    document.documentElement.lang = current;
  }

  function set(lang) {
    if (SUPPORTED.indexOf(lang) < 0 || lang === current) return;
    current = lang;
    try { localStorage.setItem(KEY, lang); } catch (e) {}
    listeners.forEach(function (fn) { fn(lang); });
  }

  /* Small ES | EN switch. */
  function toggle(el) {
    el.className += ' lang-switch';
    el.setAttribute('role', 'group');
    el.setAttribute('aria-label', 'Idioma / Language');
    function render() {
      el.innerHTML = '';
      SUPPORTED.forEach(function (l) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = l.toUpperCase();
        b.className = 'lang-btn' + (l === current ? ' is-active' : '');
        b.setAttribute('aria-pressed', String(l === current));
        b.setAttribute('lang', l);
        b.addEventListener('click', function () { set(l); });
        el.appendChild(b);
      });
    }
    render();
    listeners.push(render);
  }

  global.MI_LANG = {
    get current() { return current; },
    t: t, apply: apply, set: set, toggle: toggle,
    onChange: function (fn) { listeners.push(fn); }
  };
})(window);
