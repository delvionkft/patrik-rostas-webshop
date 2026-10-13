/* Általános működés minden oldalon: menü, fejléc, animációk, térkép, űrlap. */
(function () {
  'use strict';

  var doc = document.documentElement;
  doc.classList.add('js');

  function storageGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function storageSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      /* privát mód, letiltott tároló – nem gond */
    }
  }

  /* ---------------------------------------------------------------------
     Mobilmenü
     --------------------------------------------------------------------- */
  function initMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var nav = document.getElementById('site-nav');
    if (!toggle || !nav) return;

    var desktop = window.matchMedia('(min-width: 861px)');

    function setOpen(open, returnFocus) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Menü bezárása' : 'Menü megnyitása');
      nav.classList.toggle('is-open', open);
      if (!open && returnFocus) toggle.focus();
    }

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) setOpen(false, true);
    });

    document.addEventListener('click', function (e) {
      if (!nav.classList.contains('is-open')) return;
      if (nav.contains(e.target) || toggle.contains(e.target)) return;
      setOpen(false);
    });

    var onChange = function () {
      if (desktop.matches) setOpen(false);
    };
    if (desktop.addEventListener) desktop.addEventListener('change', onChange);
    else if (desktop.addListener) desktop.addListener(onChange);
  }

  /* ---------------------------------------------------------------------
     Fejléc árnyék görgetéskor
     --------------------------------------------------------------------- */
  function initHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    var ticking = false;
    function update() {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
      ticking = false;
    }
    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
    update();
  }

  /* ---------------------------------------------------------------------
     Térkép: csak kattintásra töltjük be a Google Térképet,
     mert betöltéskor harmadik fél (Google) sütiket helyezhet el.
     --------------------------------------------------------------------- */
  function initMaps() {
    // Útvonal-linkek: a címet szabályosan kódoljuk (a HTML-ben olvasható formában szerepel).
    document.querySelectorAll('[data-map-open], [data-map-route]').forEach(function (a) {
      try {
        var q = new URL(a.href).searchParams.get('query');
        if (q) a.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);
      } catch (e) {
        /* régi böngésző – marad az eredeti link */
      }
    });

    var maps = document.querySelectorAll('[data-map-query]');
    if (!maps.length) return;
    var remembered = storageGet('mapConsent') === '1';

    maps.forEach(function (map) {
      var query = map.getAttribute('data-map-query') || '';
      var isPlaceholder = /^\s*\[.*\]\s*$/.test(query);

      var button = map.querySelector('[data-map-load]');
      if (!button) return;

      if (isPlaceholder) {
        // Amíg nincs valódi cím, ne töltsünk be értelmetlen térképet.
        button.disabled = true;
        button.textContent = 'A térkép a cím megadása után tölthető be';
        return;
      }

      function load() {
        var iframe = document.createElement('iframe');
        iframe.src = 'https://www.google.com/maps?q=' + encodeURIComponent(query) + '&output=embed';
        iframe.title = 'Térkép: ' + query;
        iframe.loading = 'lazy';
        iframe.referrerPolicy = 'no-referrer-when-downgrade';
        iframe.setAttribute('allowfullscreen', '');
        map.appendChild(iframe);
        var overlay = map.querySelector('.map__overlay');
        if (overlay) overlay.remove();
      }

      button.addEventListener('click', function () {
        storageSet('mapConsent', '1');
        load();
      });

      if (remembered) load();
    });
  }

  /* ---------------------------------------------------------------------
     Kitöltetlen helyőrzők ([...]) kiemelése, hogy semmi ne maradjon le.
     Ha minden adat ki van töltve, ez a rész semmit sem csinál.
     --------------------------------------------------------------------- */
  function highlightPlaceholders() {
    var re = /\[[^\[\]\n]{2,120}\]/g;
    var skip = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, OPTION: 1, NOSCRIPT: 1, TITLE: 1 };
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var parent = node.parentNode;
        if (!parent || skip[parent.nodeName] || parent.closest('mark.ph')) return NodeFilter.FILTER_REJECT;
        re.lastIndex = 0;
        return re.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      var text = node.nodeValue;
      var frag = document.createDocumentFragment();
      var last = 0;
      re.lastIndex = 0;
      var m;
      while ((m = re.exec(text))) {
        if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        var mark = document.createElement('mark');
        mark.className = 'ph';
        mark.title = 'Helyőrző – cseréld valós adatra';
        mark.textContent = m[0];
        frag.appendChild(mark);
        last = m.index + m[0].length;
      }
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      node.parentNode.replaceChild(frag, node);
    });
  }

  /* ---------------------------------------------------------------------
     Kapcsolatfelvételi űrlap
     --------------------------------------------------------------------- */
  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var status = form.querySelector('.form-status');
    var submit = form.querySelector('[type="submit"]');
    var message = form.elements.message;

    // Előtöltés a „Érdeklődöm” gombokról érkezve (kapcsolat.html?erdeklodes=...)
    var params = new URLSearchParams(window.location.search);
    var topic = params.get('erdeklodes');
    if (topic && message && !message.value) {
      topic = topic.slice(0, 60);
      message.value =
        topic === 'kinalat'
          ? 'Érdeklődnék az aktuális kínálatról: '
          : 'Érdeklődnék a következő gyümölcs iránt: ' + topic + '. ';
    }

    var rules = {
      name: function (v) {
        return v.trim() ? '' : 'Kérlek, add meg a neved.';
      },
      email: function (v) {
        if (!v.trim()) return 'Kérlek, add meg az e-mail-címed, hogy válaszolni tudjunk.';
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Ez nem tűnik érvényes e-mail-címnek.';
      },
      phone: function (v) {
        if (!v.trim()) return '';
        return /^[+()\d\s\/-]{6,20}$/.test(v.trim()) ? '' : 'Ellenőrizd a telefonszámot (pl. +36 30 123 4567).';
      },
      message: function (v) {
        return v.trim().length >= 5 ? '' : 'Írd meg röviden, miben segíthetünk.';
      },
      consent: function (v, el) {
        return el.checked ? '' : 'Az elküldéshez fogadd el az adatkezelési tájékoztatót.';
      },
    };

    function validateField(el) {
      var rule = rules[el.name];
      if (!rule) return true;
      var error = rule(el.value, el);
      var out = document.getElementById(el.name + '-error');
      el.setAttribute('aria-invalid', error ? 'true' : 'false');
      if (out) out.textContent = error;
      return !error;
    }

    Object.keys(rules).forEach(function (name) {
      var el = form.elements[name];
      if (!el) return;
      el.addEventListener('blur', function () {
        if (el.value || el.type === 'checkbox') validateField(el);
      });
      el.addEventListener('input', function () {
        if (el.getAttribute('aria-invalid') === 'true') validateField(el);
      });
      el.addEventListener('change', function () {
        if (el.getAttribute('aria-invalid') === 'true') validateField(el);
      });
    });

    function setStatus(type, text) {
      status.className = 'form-status' + (type ? ' is-' + type : '');
      status.textContent = text;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      setStatus('', '');

      var firstInvalid = null;
      Object.keys(rules).forEach(function (name) {
        var el = form.elements[name];
        if (el && !validateField(el) && !firstInvalid) firstInvalid = el;
      });
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      // Csapda a spamrobotoknak: ember nem tölti ki ezt a mezőt.
      if (form.elements._gotcha && form.elements._gotcha.value) {
        form.reset();
        setStatus('success', 'Köszönjük, megkaptuk az üzeneted!');
        return;
      }

      var endpoint = (form.getAttribute('data-endpoint') || '').trim();
      var data = {
        name: form.elements.name.value.trim(),
        email: form.elements.email.value.trim(),
        phone: form.elements.phone.value.trim(),
        message: form.elements.message.value.trim(),
      };

      if (!endpoint) {
        // Nincs beállított űrlapkezelő: a látogató levelezőprogramját nyitjuk meg kitöltve.
        var to = form.getAttribute('data-mailto') || '';
        var body =
          data.message +
          '\n\n—\nNév: ' +
          data.name +
          '\nE-mail: ' +
          data.email +
          (data.phone ? '\nTelefon: ' + data.phone : '');
        window.location.href =
          'mailto:' +
          encodeURIComponent(to).replace(/%40/g, '@') +
          '?subject=' +
          encodeURIComponent('Érdeklődés a weboldalról') +
          '&body=' +
          encodeURIComponent(body);
        setStatus(
          'success',
          'Megnyitottuk a levelezőprogramodat a kitöltött üzenettel – már csak el kell küldened. Ha nem nyílt meg, írj nekünk közvetlenül: ' +
            to
        );
        return;
      }

      submit.disabled = true;
      var label = submit.textContent;
      submit.textContent = 'Küldés…';

      fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          form.reset();
          setStatus('success', 'Köszönjük, megkaptuk az üzeneted! Hamarosan válaszolunk.');
        })
        .catch(function () {
          setStatus(
            'error',
            'Az üzenetet nem sikerült elküldeni. Kérjük, próbáld újra, vagy hívj minket telefonon.'
          );
        })
        .then(function () {
          submit.disabled = false;
          submit.textContent = label;
        });
    });
  }

  function initYear() {
    document.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  function init() {
    initMenu();
    initHeader();
    initMaps();
    initContactForm();
    initYear();
    highlightPlaceholders();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
