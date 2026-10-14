/* Kínálat megjelenítése: főoldali blokkok és a Termékeink oldal (kereső, szűrők, részletek). */
(function () {
  'use strict';

  var PRODUCTS = window.PRODUCTS || [];
  var CATEGORIES = window.CATEGORIES || [];
  var MAX_AGE = window.PRICE_MAX_AGE_DAYS || 30;

  var MONTHS = [
    'január', 'február', 'március', 'április', 'május', 'június',
    'július', 'augusztus', 'szeptember', 'október', 'november', 'december',
  ];

  var MONTHS_SHORT = ['jan', 'feb', 'márc', 'ápr', 'máj', 'jún', 'júl', 'aug', 'szept', 'okt', 'nov', 'dec'];

  var now = new Date();
  var currentMonth = now.getMonth() + 1;

  /* ---------------------------------------------------------------------
     Segédfüggvények
     --------------------------------------------------------------------- */
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .trim();
  }

  function categoryLabel(id) {
    for (var i = 0; i < CATEGORIES.length; i++) if (CATEGORIES[i].id === id) return CATEGORIES[i].label;
    return '';
  }

  function inSeason(p) {
    return Array.isArray(p.season) && p.season.length > 0 && p.season.length < 12 && p.season.indexOf(currentMonth) !== -1;
  }

  // Összefüggő hónapsávok szövegesen, évhatáron átnyúlva is (pl. „november–március”).
  function seasonText(p, short) {
    var names = short ? MONTHS_SHORT : MONTHS;
    var months = Array.isArray(p.season) ? p.season.slice() : [];
    if (!months.length || months.length >= 12) return '';
    var has = function (m) {
      return months.indexOf(m) !== -1;
    };
    var prev = function (m) {
      return m === 1 ? 12 : m - 1;
    };
    var next = function (m) {
      return m === 12 ? 1 : m + 1;
    };
    var ranges = [];
    months
      .slice()
      .sort(function (a, b) {
        return a - b;
      })
      .forEach(function (m) {
        if (has(prev(m))) return;
        var end = m;
        while (has(next(end)) && next(end) !== m) end = next(end);
        ranges.push(m === end ? names[m - 1] : names[m - 1] + '–' + names[end - 1]);
      });
    return ranges.join(', ');
  }

  // Ár csak akkor jelenik meg, ha ár és egység is meg van adva. Ha van priceDate (napi ár),
  // akkor csak friss lehet; fix (listaárnál) a priceDate null. Lásd products.js.
  // A fajta saját ára (v.price) felülírja a gyümölcsét.
  function priceInfo(p, v) {
    var price = v && typeof v.price === 'number' ? v.price : p.price;
    var unit = (v && v.unit) || p.unit;
    if (typeof price !== 'number' || !(price > 0) || !unit) return null;
    if (p.priceDate) {
      var date = new Date(p.priceDate + 'T00:00:00');
      if (isNaN(date.getTime())) return null;
      var age = (now - date) / 86400000;
      if (age < -1 || age > MAX_AGE) return null;
    }
    return {
      text: new Intl.NumberFormat('hu-HU').format(price) + ' Ft',
      unit: '/ ' + unit,
    };
  }

  function tagsHtml(p) {
    var out = '';
    if (inSeason(p)) out += '<span class="tag tag--seasonal">Most érik</span>';
    if (p.isNew) out += '<span class="tag tag--new">Új a kínálatban</span>';
    return out;
  }

  var ARROW =
    '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  function slug(t) {
    return normalize(t).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function fruitUrl(p) {
    return 'gyumolcs.html#' + encodeURIComponent(p.id);
  }

  function varieties(p) {
    return (Array.isArray(p.varieties) ? p.varieties.slice() : []).sort(function (a, b) {
      return a.name.localeCompare(b.name, 'hu');
    });
  }

  function varietyMeta(p) {
    var list = varieties(p);
    if (!list.length) return '';
    if (list.length === 1) return '<div><dt>Fajta:</dt><dd>' + esc(list[0].name) + '</dd></div>';
    return '<div><dt>Fajták:</dt><dd>' + list.length + ' fajta</dd></div>';
  }

  function cardHtml(p) {
    var price = priceInfo(p);
    var meta = '';
    meta += varietyMeta(p);
    if (p.origin) meta += '<div><dt>Származás:</dt><dd>' + esc(p.origin) + '</dd></div>';

    var title = '<a class="product-card__link" href="' + fruitUrl(p) + '">' + esc(p.name) + '</a>';

    return (
      '<article class="product-card">' +
      '<div class="product-card__media">' +
      (p.image
        ? '<img src="' + esc(p.image) + '" alt="' + esc(p.alt) + '" width="800" height="600" loading="lazy" decoding="async">'
        : '<div class="noimg" aria-hidden="true"><strong>' + esc(p.name) + '</strong><span>Fotó hamarosan</span></div>') +
      (tagsHtml(p) ? '<div class="product-card__tags">' + tagsHtml(p) + '</div>' : '') +
      '</div>' +
      '<div class="product-card__body">' +
      '<h3 class="product-card__title">' + title + '</h3>' +
      '<p class="product-card__text">' + esc(p.short) + '</p>' +
      (meta ? '<dl class="product-card__meta">' + meta + '</dl>' : '') +
      '<div class="product-card__footer">' +
      (price
        ? '<span class="price">' + esc(price.text) + ' <small>' + esc(price.unit) + '</small></span>'
        : '<span>' + esc(seasonText(p, true) ? 'Érés: ' + seasonText(p, true) : categoryLabel(p.category)) + '</span>') +
      '<span class="more" aria-hidden="true">' + ARROW + '</span>' +
      '</div>' +
      '</div>' +
      '</article>'
    );
  }

  /* ---------------------------------------------------------------------
     Főoldal: nyitó (mi van most idényben)
     --------------------------------------------------------------------- */
  var MONTHS_IN = [
    'Januárban', 'Februárban', 'Márciusban', 'Áprilisban', 'Májusban', 'Júniusban',
    'Júliusban', 'Augusztusban', 'Szeptemberben', 'Októberben', 'Novemberben', 'Decemberben',
  ];

  function initHero() {
    var nowBox = document.querySelector('[data-hero-now]');
    if (!nowBox) return;
    var names = PRODUCTS.filter(inSeason).map(function (p) {
      return p.name;
    });
    if (!names.length) return;
    nowBox.querySelector('[data-hero-now-text]').textContent =
      MONTHS_IN[currentMonth - 1] + ' érik: ' + names.join(' · ');
    nowBox.hidden = false;
  }

  /* ---------------------------------------------------------------------
     Főoldal: kiemelt gyümölcsök
     --------------------------------------------------------------------- */
  function renderFeatured() {
    var list = document.querySelector('[data-featured]');
    if (!list) return;
    var items = PRODUCTS.filter(function (p) {
      return p.featured;
    }).slice(0, 4);
    if (!items.length) return;
    list.innerHTML = items
      .map(function (p) {
        return '<li>' + cardHtml(p) + '</li>';
      })
      .join('');
  }

  /* ---------------------------------------------------------------------
     Főoldal: ami most szezonban van
     --------------------------------------------------------------------- */
  function seasonName(m) {
    if (m === 12 || m <= 2) return 'Tél';
    if (m <= 5) return 'Tavasz';
    if (m <= 8) return 'Nyár';
    return 'Ősz';
  }

  function renderSeason() {
    var label = document.querySelector('[data-season-label]');
    if (label) label.textContent = seasonName(currentMonth) + ' · ' + MONTHS[currentMonth - 1];

    var list = document.querySelector('[data-season-list]');
    if (list) {
      var items = PRODUCTS.filter(inSeason);
      if (!items.length) {
        // Nincs szedési idő ebben a hónapban: a következő hónapot mutatjuk, amelyikben van.
        var title = document.querySelector('[data-season-title]');
        var intro = document.querySelector('[data-season-intro]');
        for (var k = 1; k < 12; k++) {
          var m = ((currentMonth - 1 + k) % 12) + 1;
          var next = PRODUCTS.filter(function (p) {
            return Array.isArray(p.season) && p.season.length < 12 && p.season.indexOf(m) !== -1;
          });
          if (next.length) {
            if (title) title.textContent = 'Következő érés';
            if (intro) intro.textContent = MONTHS_IN[currentMonth - 1] + ' egyik gyümölcs sem érik. A legközelebbi szedés ' +
              MONTHS_IN[m - 1].toLowerCase() + ' kezdődik.';
            items = next;
            break;
          }
        }
      }
      if (items.length) {
        list.innerHTML = items
          .map(function (p) {
            return (
              '<li><a href="' + fruitUrl(p) + '">' +
              '<strong>' + esc(p.name) + '</strong><span>' + esc(seasonText(p, true)) + '</span>' +
              '</a></li>'
            );
          })
          .join('');
      }
    }

    // Idénynaptár: hónaponként, az aktuális hónap kiemelve.
    var body = document.querySelector('[data-season-calendar]');
    if (!body) return;
    var table = body.closest('table');
    var heads = table ? table.querySelectorAll('thead th[data-month]') : [];
    Array.prototype.forEach.call(heads, function (th) {
      if (Number(th.getAttribute('data-month')) === currentMonth) th.classList.add('is-now');
    });
    var rows = PRODUCTS.filter(function (p) {
      return Array.isArray(p.season) && p.season.length > 0 && p.season.length < 12;
    });
    body.innerHTML = rows
      .map(function (p) {
        var cells = '';
        for (var m = 1; m <= 12; m++) {
          var on = p.season.indexOf(m) !== -1;
          cells +=
            '<td' + (m === currentMonth ? ' class="is-now"' : '') + '>' +
            (on ? '<span class="cal-bar"></span><span class="visually-hidden">' + MONTHS[m - 1] + ': idény</span>' : '') +
            '</td>';
        }
        return (
          '<tr><th scope="row"><a href="' + fruitUrl(p) + '">' + esc(p.name) + '</a></th>' +
          cells +
          '</tr>'
        );
      })
      .join('');
  }

  /* ---------------------------------------------------------------------
     Termékeink oldal
     --------------------------------------------------------------------- */
  function initCatalog() {
    var grid = document.getElementById('product-grid');
    if (!grid) return;

    var searchInput = document.getElementById('product-search');
    var clearBtn = document.querySelector('.search__clear');
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-category]'));
    var countEl = document.getElementById('result-count');
    var resetBtn = document.getElementById('filter-reset');
    var empty = document.getElementById('empty-state');
    var emptyReset = document.getElementById('empty-reset');
    // Régi hivatkozások (termekeink.html#alma) a gyümölcs aloldalára mutassanak.
    var legacy = decodeURIComponent(window.location.hash.slice(1));
    if (legacy && byId(legacy)) {
      window.location.replace(fruitUrl(byId(legacy)));
      return;
    }

    var validCats = CATEGORIES.map(function (c) {
      return c.id;
    });
    var params = new URLSearchParams(window.location.search);
    var state = {
      category: validCats.indexOf(params.get('kategoria')) !== -1 ? params.get('kategoria') : 'osszes',
      query: (params.get('kereses') || '').slice(0, 60),
    };
    searchInput.value = state.query;

    var haystacks = {};
    PRODUCTS.forEach(function (p) {
      haystacks[p.id] = normalize(
        [p.name, p.short, p.origin, categoryLabel(p.category)]
          .concat(p.keywords || [])
          .concat(varieties(p).map(function (v) {
            return v.name;
          }))
          .join(' ')
      );
    });

    function matchesQuery(p, q) {
      if (!q) return true;
      var hay = haystacks[p.id];
      return q.split(/\s+/).every(function (word) {
        return hay.indexOf(word) !== -1;
      });
    }

    function syncUrl() {
      var u = new URLSearchParams();
      if (state.category !== 'osszes') u.set('kategoria', state.category);
      if (state.query) u.set('kereses', state.query);
      var qs = u.toString();
      var url = window.location.pathname + (qs ? '?' + qs : '') + window.location.hash;
      try {
        window.history.replaceState(window.history.state, '', url);
      } catch (e) {
        /* file:// alatt egyes böngészők tiltják – nem gond */
      }
    }

    function render() {
      var q = normalize(state.query);
      var byQuery = PRODUCTS.filter(function (p) {
        return matchesQuery(p, q);
      });
      var visible = byQuery.filter(function (p) {
        return state.category === 'osszes' || p.category === state.category;
      });

      chips.forEach(function (chip) {
        var cat = chip.getAttribute('data-category');
        chip.setAttribute('aria-pressed', String(cat === state.category));
        var n = cat === 'osszes' ? byQuery.length : byQuery.filter(function (p) {
          return p.category === cat;
        }).length;
        var c = chip.querySelector('.chip__count');
        if (c) c.textContent = String(n);
        // Üres kategória (nincs ilyen termék a kínálatban) gombja ne látsszon.
        chip.hidden = cat !== 'osszes' && !PRODUCTS.some(function (p) {
          return p.category === cat;
        });
      });

      grid.innerHTML = visible
        .map(function (p) {
          return '<li>' + cardHtml(p) + '</li>';
        })
        .join('');

      var filtered = state.category !== 'osszes' || !!state.query;
      countEl.textContent = visible.length
        ? visible.length + ' gyümölcs' + (filtered ? ' a szűrésnek megfelelően' : ' a kínálatban')
        : 'Nincs találat';
      resetBtn.hidden = !filtered;
      clearBtn.hidden = !state.query;
      empty.hidden = visible.length > 0;
      grid.hidden = visible.length === 0;
      syncUrl();
    }

    var debounce;
    searchInput.addEventListener('input', function () {
      clearTimeout(debounce);
      debounce = setTimeout(function () {
        state.query = searchInput.value.slice(0, 60);
        render();
      }, 120);
    });

    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && searchInput.value) {
        e.preventDefault();
        searchInput.value = '';
        state.query = '';
        render();
      }
    });

    // Az Enter ne küldje el (és ne töltse újra) az oldalt.
    var searchForm = searchInput.form;
    if (searchForm) {
      searchForm.addEventListener('submit', function (e) {
        e.preventDefault();
        clearTimeout(debounce);
        state.query = searchInput.value.slice(0, 60);
        render();
        searchInput.blur();
      });
    }

    clearBtn.addEventListener('click', function () {
      searchInput.value = '';
      state.query = '';
      render();
      searchInput.focus();
    });

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        state.category = chip.getAttribute('data-category');
        render();
      });
    });

    function resetAll() {
      state.category = 'osszes';
      state.query = '';
      searchInput.value = '';
      render();
    }
    resetBtn.addEventListener('click', resetAll);
    emptyReset.addEventListener('click', function () {
      resetAll();
      searchInput.focus();
    });

    render();
  }

  function byId(id) {
    for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i];
    return null;
  }

  /* ---------------------------------------------------------------------
     Gyümölcs aloldal: gyumolcs.html#korte – az összes fajta képpel
     --------------------------------------------------------------------- */
  function initFruitPage() {
    var root = document.querySelector('[data-fruit-page]');
    if (!root) return;
    var q = function (k) {
      return root.querySelector('[data-f="' + k + '"]');
    };
    var baseTitle = document.title;
    var siteName = baseTitle.indexOf(' – ') !== -1 ? baseTitle.split(' – ').slice(1).join(' – ') : baseTitle;

    function render() {
      var p = byId(decodeURIComponent(window.location.hash.slice(1)));
      q('content').hidden = !p;
      q('missing').hidden = !!p;
      if (!p) {
        document.title = baseTitle;
        return;
      }
      var list = varieties(p);
      document.title = p.name + ' – ' + siteName;
      q('crumb').textContent = p.name;
      q('name').textContent = p.name;
      q('name').style.setProperty('--len', String(Math.max(p.name.length, 4)));
      q('tags').innerHTML = tagsHtml(p);
      q('desc').textContent = p.long || p.short;

      // Adatsáv: fajták száma, kategória, 12 hónapos idénysáv
      q('count-big').textContent = String(list.length);
      var pr = priceInfo(p);
      q('price-big').textContent = pr ? pr.text : '–';
      q('price-unit').textContent = pr ? pr.unit : '';
      q('price-text').textContent = pr ? pr.text : 'kérésre';
      var st = seasonText(p, true);
      q('season-text').textContent = st ? '· ' + st : '';
      var months = Array.isArray(p.season) ? p.season : [];
      var strip = '';
      for (var m = 1; m <= 12; m++) {
        strip +=
          '<li class="' + (months.indexOf(m) !== -1 ? 'is-on' : '') + (m === currentMonth ? ' is-now' : '') + '">' +
          '<span>' + MONTHS_SHORT[m - 1].charAt(0).toUpperCase() + '</span></li>';
      }
      q('months').innerHTML = strip;

      // Fotómozaik: kiemelt képek (hero mező), különben a borítókép és a fajták képei
      var pics = [];
      var seen = {};
      var add = function (src, label, alt) {
        if (src && !seen[src] && pics.length < 4) {
          seen[src] = 1;
          pics.push({ src: src, label: label, alt: alt });
        }
      };
      (p.hero || []).forEach(function (name) {
        list.forEach(function (v) {
          if (v.name === name) add(v.image, v.name, v.alt);
        });
      });
      list.forEach(function (v) {
        if (v.image === p.image) add(v.image, v.name, v.alt);
      });
      list.forEach(function (v) {
        add(v.image, v.name, v.alt);
      });
      var mosaic = q('mosaic');
      mosaic.className = 'mosaic mosaic--' + Math.max(pics.length, 1);
      mosaic.innerHTML = pics.length
        ? pics
            .map(function (x, i) {
              return (
                '<figure class="mosaic__item">' +
                '<img src="' + esc(x.src) + '" alt="' + esc(x.alt || x.label) + '" width="800" height="600"' + (i ? ' loading="lazy"' : ' fetchpriority="high"') + ' decoding="async">' +
                '<figcaption>' + esc(x.label) + '</figcaption>' +
                '</figure>'
              );
            })
            .join('')
        : '<div class="mosaic__item noimg"><strong>' + esc(p.name) + '</strong><span>Fotó hamarosan</span></div>';

      q('count').textContent =
        list.length > 1 ? list.length + ' fajta, betűrendben.' : 'Jelenleg egy fajta szerepel a kínálatban.';
      q('varieties').innerHTML = list
        .map(function (v, i) {
          var media = v.image
            ? '<img src="' + esc(v.image) + '" alt="' + esc(v.alt || v.name) + '" width="800" height="600" loading="lazy" decoding="async">'
            : '<div class="noimg" aria-hidden="true"><strong>' + esc(v.name) + '</strong><span>Fotó hamarosan</span></div>';
          var hasInfo = !!(v.intro || (v.facts && v.facts.length));
          var title = hasInfo
            ? '<button type="button" class="variety-card__link" data-variety="' + i + '" aria-haspopup="dialog">' + esc(v.name) + '</button>'
            : esc(v.name);
          return (
            '<li class="variety-card' + (hasInfo ? ' has-info' : '') + '" id="fajta-' + slug(v.name) + '">' +
            '<div class="product-card__media">' + media + '</div>' +
            '<h3>' + title + '</h3>' +
            '<p>' + esc(v.kind || p.name) + (priceInfo(p, v) ? ' <span class="variety-card__price">' + esc(priceInfo(p, v).text) + '</span>' : '') + '</p>' +
            (v.intro ? '<div class="variety-card__intro">' + esc(v.intro) + '</div>' : '') +
            (hasInfo ? '<span class="variety-card__more" aria-hidden="true">Fajtaleírás ' + ARROW + '</span>' : '') +
            '</li>'
          );
        })
        .join('');
      current = { product: p, list: list };

      // Fajtamutató: gombok, amelyek a fajta kártyájához görgetnek
      // (a cím #-részét a gyümölcs azonosítója foglalja, ezért nem horgonylink).
      q('index').innerHTML =
        list.length > 4
          ? list
              .map(function (v) {
                return '<button type="button" class="variety-chip" data-target="fajta-' + slug(v.name) + '">' + esc(v.name) + '</button>';
              })
              .join('')
          : '';
      q('index').hidden = list.length <= 4;

      var inquire = 'kapcsolat.html?erdeklodes=' + encodeURIComponent(p.name) + '#urlap';
      Array.prototype.forEach.call(root.querySelectorAll('[data-f="inquire"]'), function (a) {
        a.href = inquire;
      });
      window.scrollTo(0, 0);
    }

    var current = null;

    // Fajtaleírás felugró ablakban
    var dialog = document.getElementById('variety-dialog');
    var opener = null;
    function openVariety(idx) {
      if (!dialog || typeof dialog.showModal !== 'function' || !current) return;
      var v = current.list[idx];
      var p = current.product;
      if (!v) return;
      var d = function (k) {
        return dialog.querySelector('[data-v="' + k + '"]');
      };
      // Kis felbontású képet nem nagyítunk a végtelenségig: legfeljebb 1,25×,
      // a maradék helyet ugyanannak a képnek elmosott változata tölti ki.
      var media = d('media');
      media.innerHTML = v.image
        ? '<div class="variety-media__bg" aria-hidden="true" style="background-image:url(\'' + esc(v.image) + '\')"></div>' +
          '<img class="variety-media__img" src="' + esc(v.image) + '" alt="' + esc(v.alt || v.name) + '">'
        : '<div class="noimg" aria-hidden="true"><strong>' + esc(v.name) + '</strong><span>Fotó hamarosan</span></div>';
      var mimg = media.querySelector('.variety-media__img');
      if (mimg) {
        var fit = function () {
          if (mimg.naturalWidth) mimg.style.maxWidth = Math.round(mimg.naturalWidth * 1.25) + 'px';
        };
        if (mimg.complete) fit();
        else mimg.addEventListener('load', fit);
      }
      d('fruit').textContent = v.kind || p.name;
      d('name').textContent = v.name;
      d('intro').textContent = v.intro || '';
      d('intro').hidden = !v.intro;
      d('facts').innerHTML = (v.facts || [])
        .map(function (r) {
          return '<div><dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>';
        })
        .join('');
      var vp = priceInfo(p, v);
      d('price').innerHTML = vp ? 'Ár: <strong>' + esc(vp.text) + '</strong> ' + esc(vp.unit) : '';
      d('price').hidden = !vp;
      d('inquire').href = 'kapcsolat.html?erdeklodes=' + encodeURIComponent(p.name + ' – ' + v.name) + '#urlap';
      opener = document.activeElement;
      dialog.showModal();
      document.body.classList.add('is-locked');
      var inner = dialog.querySelector('.dialog-inner');
      if (inner) inner.scrollTop = 0;
      Array.prototype.forEach.call(dialog.querySelectorAll('.dialog-content, .dialog-body'), function (el) {
        el.scrollTop = 0;
      });
    }
    if (dialog) {
      dialog.querySelector('.dialog-close').addEventListener('click', function () {
        dialog.close();
      });
      dialog.addEventListener('click', function (e) {
        if (e.target === dialog) dialog.close();
      });
      dialog.addEventListener('close', function () {
        document.body.classList.remove('is-locked');
        if (opener && document.contains(opener)) opener.focus();
        opener = null;
      });
    }
    root.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-variety]');
      if (btn) openVariety(Number(btn.getAttribute('data-variety')));
    });
    window.addEventListener('hashchange', function () {
      if (dialog && dialog.open) dialog.close();
    });

    var smooth = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    root.addEventListener('click', function (e) {
      var chip = e.target.closest('[data-target]');
      var toList = e.target.closest('[data-f="to-varieties"]');
      var el = chip ? document.getElementById(chip.getAttribute('data-target')) : toList ? document.getElementById('fajtak-cim') : null;
      if (!el) return;
      el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
      if (toList) el.focus({ preventScroll: true });
    });

    window.addEventListener('hashchange', render);
    render();
  }

  function init() {
    initHero();
    renderFeatured();
    renderSeason();
    initCatalog();
    initFruitPage();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
