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
     Űrlapok közös része: mezőnkénti ellenőrzés, hibaüzenetek, állapotsor,
     küldés űrlapkezelőre (data-endpoint) vagy levelezőprogrammal (data-mailto).
     A kapcsolati és a rendelési űrlap is ezt használja.
     --------------------------------------------------------------------- */
  /* EmailJS: az űrlapok ezen keresztül küldenek e-mailt (https://www.emailjs.com).
     Űrlaponként külön sablon: az űrlap data-emailjs attribútuma választ (contact = kérdező, order = rendelés).
     Sablonváltozók: {{title}}, {{name}}, {{email}},
     {{phone}}, {{message}}, {{time}}; rendelésnél még {{rendeles}}, {{zip}}, {{city}}, {{address}}, {{note}}.
     A nyilvános kulcs (public key) böngészőben látható, ez így rendben van; visszaélés ellen az EmailJS
     felületén állítsd be az engedélyezett domaint. Ha egy űrlapon data-endpoint is meg van adva, az élvez elsőbbséget. */
  var EMAILJS = {
    url: 'https://api.emailjs.com/api/v1.0/email/send',
    service: 'service_o4wjpwh',
    templates: {
      contact: 'template_lbru1pf', // Kapcsolat oldal: kérdező űrlap
      order: 'template_vj6x0e5', // Rendelés oldal: rendelési űrlap
    },
    publicKey: 'Q3ihGKO1QuYf_RcRi',
  };

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var PHONE_RE = /^[+()\d\s\/-]{6,20}$/;

  function bindForm(form, rules) {
    var status = form.querySelector('.form-status');

    function validateField(name) {
      var el = form.elements[name];
      var error = rules[name](el ? el.value : '', el);
      var out = document.getElementById(name + '-error');
      if (el && el.setAttribute) el.setAttribute('aria-invalid', error ? 'true' : 'false');
      if (out) out.textContent = error;
      return !error;
    }

    Object.keys(rules).forEach(function (name) {
      var el = form.elements[name];
      if (!el || !el.addEventListener) return;
      el.addEventListener('blur', function () {
        if (el.value || el.type === 'checkbox') validateField(name);
      });
      ['input', 'change'].forEach(function (type) {
        el.addEventListener(type, function () {
          if (el.getAttribute('aria-invalid') === 'true') validateField(name);
        });
      });
    });

    return {
      validateField: validateField,
      // Igaz, ha minden mező rendben van; különben az első hibás mezőre ugrik.
      validateAll: function () {
        var first = null;
        Object.keys(rules).forEach(function (name) {
          if (!validateField(name) && !first) first = form.elements[name] || document.getElementById(name + '-error');
        });
        if (first) {
          if (first.focus && first.tagName !== 'SPAN') first.focus();
          else if (first.scrollIntoView) first.scrollIntoView({ block: 'center' });
        }
        return !first;
      },
      isSpam: function () {
        return !!(form.elements._gotcha && form.elements._gotcha.value);
      },
      setStatus: function (type, text) {
        status.className = 'form-status' + (type ? ' is-' + type : '');
        status.textContent = text;
      },
      endpoint: function () {
        return (form.getAttribute('data-endpoint') || '').trim();
      },
      mailto: function (subject, body) {
        var to = form.getAttribute('data-mailto') || '';
        window.location.href =
          'mailto:' + encodeURIComponent(to).replace(/%40/g, '@') +
          '?subject=' + encodeURIComponent(subject) +
          '&body=' + encodeURIComponent(body);
        return to;
      },
      // Van-e beállított küldési mód (űrlapkezelő vagy EmailJS)? Ha nincs, marad a levelezőprogram.
      template: function () {
        return EMAILJS.templates[form.getAttribute('data-emailjs')] || '';
      },
      canSend: function () {
        return !!(this.endpoint() || (EMAILJS.service && this.template() && EMAILJS.publicKey));
      },
      send: function (params, busyLabel) {
        var submit = form.querySelector('[type="submit"]');
        var label = submit.innerHTML;
        submit.disabled = true;
        submit.textContent = busyLabel || 'Küldés…';
        params.time = new Date().toLocaleString('hu-HU');
        var endpoint = this.endpoint();
        var request = endpoint
          ? fetch(endpoint, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) })
          : fetch(EMAILJS.url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                service_id: EMAILJS.service,
                template_id: this.template(),
                user_id: EMAILJS.publicKey,
                template_params: params,
              }),
            });
        return request
          .then(function (res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
          })
          .finally(function () {
            submit.disabled = false;
            submit.innerHTML = label;
          });
      },
    };
  }

  window.SiteForm = {
    bind: bindForm,
    rules: {
      required: function (msg) {
        return function (v) {
          return v.trim() ? '' : msg;
        };
      },
      email: function (v) {
        if (!v.trim()) return 'Kérlek, add meg az e-mail-címed.';
        return EMAIL_RE.test(v.trim()) ? '' : 'Ez nem tűnik érvényes e-mail-címnek.';
      },
      phone: function (required) {
        return function (v) {
          if (!v.trim()) return required ? 'Kérlek, add meg a telefonszámod.' : '';
          return PHONE_RE.test(v.trim()) && v.replace(/\D/g, '').length >= 6 ? '' : 'Ellenőrizd a telefonszámot (pl. +36 30 123 4567).';
        };
      },
      consent: function (v, el) {
        return el && el.checked ? '' : 'Az elküldéshez fogadd el az adatkezelési tájékoztatót.';
      },
    },
  };

  /* ---------------------------------------------------------------------
     Kapcsolatfelvételi űrlap (kérdés, érdeklődés)
     --------------------------------------------------------------------- */
  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var message = form.elements.message;

    // Előtöltés a „Érdeklődöm” gombokról érkezve (kapcsolat.html?erdeklodes=...)
    var params = new URLSearchParams(window.location.search);
    var topic = params.get('erdeklodes');
    if (topic && message && !message.value) {
      topic = topic.slice(0, 60);
      message.value =
        topic === 'kinalat'
          ? 'Érdeklődnék az aktuális kínálatról: '
          : 'Érdeklődnék a következő iránt: ' + topic + '. ';
    }

    var R = window.SiteForm.rules;
    var f = bindForm(form, {
      name: R.required('Kérlek, add meg a neved.'),
      email: function (v) {
        return v.trim() ? R.email(v) : 'Kérlek, add meg az e-mail-címed, hogy válaszolni tudjunk.';
      },
      phone: R.phone(false),
      message: function (v) {
        return v.trim().length >= 5 ? '' : 'Írd meg röviden, miben segíthetünk.';
      },
      consent: R.consent,
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      f.setStatus('', '');
      if (!f.validateAll()) return;

      // Csapda a spamrobotoknak: ember nem tölti ki ezt a mezőt.
      if (f.isSpam()) {
        form.reset();
        f.setStatus('success', 'Köszönjük, megkaptuk az üzeneted!');
        return;
      }

      var data = {
        name: form.elements.name.value.trim(),
        email: form.elements.email.value.trim(),
        phone: form.elements.phone.value.trim(),
        message: form.elements.message.value.trim(),
      };

      if (!f.canSend()) {
        // Nincs beállított küldési mód: a látogató levelezőprogramját nyitjuk meg kitöltve.
        var to = f.mailto(
          'Érdeklődés a weboldalról',
          data.message + '\n\n—\nNév: ' + data.name + '\nE-mail: ' + data.email + (data.phone ? '\nTelefon: ' + data.phone : '')
        );
        f.setStatus(
          'success',
          'Megnyitottuk a levelezőprogramodat a kitöltött üzenettel – már csak el kell küldened. Ha nem nyílt meg, írj nekünk közvetlenül: ' + to
        );
        return;
      }

      f.send({
        title: 'Érdeklődés a weboldalról',
        name: data.name,
        email: data.email,
        phone: data.phone || '–',
        message: data.message,
      })
        .then(function () {
          form.reset();
          f.setStatus('success', 'Köszönjük, megkaptuk az üzeneted! Hamarosan válaszolunk.');
        })
        .catch(function () {
          f.setStatus('error', 'Az üzenetet nem sikerült elküldeni. Kérjük, próbáld újra, vagy hívj minket telefonon.');
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
