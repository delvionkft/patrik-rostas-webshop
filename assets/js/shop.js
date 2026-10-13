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

  // Ár csak akkor jelenik meg, ha teljes és friss (lásd products.js).
  function priceInfo(p) {
    if (typeof p.price !== 'number' || !(p.price > 0) || !p.unit || !p.priceDate) return null;
    var date = new Date(p.priceDate + 'T00:00:00');
    if (isNaN(date.getTime())) return null;
    var age = (now - date) / 86400000;
    if (age < -1 || age > MAX_AGE) return null;
    return {
      text: new Intl.NumberFormat('hu-HU').format(p.price) + ' Ft',
      unit: '/ ' + p.unit,
      date: date.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' }),
    };
  }

  function tagsHtml(p) {
    var out = '';
    if (inSeason(p)) out += '<span class="tag tag--seasonal">Szezonális</span>';
    if (p.isNew) out += '<span class="tag tag--new">Új a kínálatban</span>';
    return out;
  }

  var ARROW =
    '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  function cardHtml(p, mode) {
    var price = priceInfo(p);
    var meta = '';
    if (p.variety) meta += '<div><dt>Fajta:</dt><dd>' + esc(p.variety) + '</dd></div>';
    if (p.origin) meta += '<div><dt>Származás:</dt><dd>' + esc(p.origin) + '</dd></div>';

    var title =
      mode === 'link'
        ? '<a class="product-card__link" href="termekeink.html#' + encodeURIComponent(p.id) + '">' + esc(p.name) + '</a>'
        : '<button type="button" class="product-card__link" data-product="' + esc(p.id) + '" aria-haspopup="dialog">' + esc(p.name) + '</button>';

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
        : '<span>' + esc(seasonText(p, true) ? 'Idény: ' + seasonText(p, true) : categoryLabel(p.category)) + '</span>') +
      '<span class="more" aria-hidden="true">' + ARROW + '</span>' +
      '</div>' +
      '</div>' +
      '</article>'
    );
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
        return '<li>' + cardHtml(p, 'link') + '</li>';
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
      var items = PRODUCTS.filter(inSeason).slice(0, 6);
      if (items.length) {
        list.innerHTML = items
          .map(function (p) {
            return (
              '<li><a href="termekeink.html#' + encodeURIComponent(p.id) + '">' +
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
          '<tr><th scope="row"><a href="termekeink.html#' + encodeURIComponent(p.id) + '">' + esc(p.name) + '</a></th>' +
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
    var dialog = document.getElementById('product-dialog');

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
        [p.name, p.short, p.variety, p.origin, categoryLabel(p.category)].concat(p.keywords || []).join(' ')
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
          return '<li>' + cardHtml(p, 'button') + '</li>';
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
    initDialog(dialog, grid);
  }

  /* ---------------------------------------------------------------------
     Termék részletei felugró ablakban (natív <dialog>)
     A link megosztható: termekeink.html#alma; a Vissza gomb bezárja.
     --------------------------------------------------------------------- */
  function initDialog(dialog, grid) {
    if (!dialog || typeof dialog.showModal !== 'function') return;

    var img = dialog.querySelector('[data-d="img"]');
    var tags = dialog.querySelector('[data-d="tags"]');
    var title = dialog.querySelector('[data-d="title"]');
    var desc = dialog.querySelector('[data-d="desc"]');
    var facts = dialog.querySelector('[data-d="facts"]');
    var storage = dialog.querySelector('[data-d="storage"]');
    var inquire = dialog.querySelector('[data-d="inquire"]');
    var closeBtn = dialog.querySelector('.dialog-close');
    var opener = null;

    function byId(id) {
      for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i];
      return null;
    }

    function fill(p) {
      dialog.classList.toggle('no-media', !p.image);
      if (p.image) {
        img.src = p.image;
        img.alt = p.alt;
      }
      tags.innerHTML = tagsHtml(p);
      title.textContent = p.name;
      desc.textContent = p.long || p.short;

      var rows = [['Kategória', categoryLabel(p.category)]];
      if (p.variety) rows.push(['Fajta', p.variety]);
      if (p.origin) rows.push(['Származás', p.origin]);
      var st = seasonText(p);
      if (st) rows.push(['Jellemző idény', st]);
      var price = priceInfo(p);
      if (price) rows.push(['Ár', price.text + ' ' + price.unit + ' (' + price.date + ')']);
      facts.innerHTML = rows
        .map(function (r) {
          return '<div><dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>';
        })
        .join('');

      storage.textContent = p.storage || 'Kérdezz bátran, szívesen adunk tanácsot a tároláshoz.';
      inquire.href = 'kapcsolat.html?erdeklodes=' + encodeURIComponent(p.name) + '#urlap';
    }

    function open(id, push) {
      var p = byId(id);
      if (!p) return false;
      fill(p);
      if (push) {
        try {
          window.history.pushState({ product: id }, '', '#' + encodeURIComponent(id));
        } catch (e) {
          /* file:// – kihagyjuk */
        }
      }
      if (!dialog.open) {
        opener = document.activeElement;
        dialog.showModal();
        document.body.classList.add('is-locked');
      }
      dialog.querySelector('.dialog-inner').scrollTop = 0;
      dialog.querySelector('.dialog-content').scrollTop = 0;
      return true;
    }

    function requestClose() {
      if (dialog.open) dialog.close();
    }

    dialog.addEventListener('close', function () {
      document.body.classList.remove('is-locked');
      if (window.history.state && window.history.state.product) {
        // Mi nyitottuk meg pushState-tel → lépjünk vissza, így a Vissza gomb sem „ragad”.
        window.history.back();
      } else if (window.location.hash) {
        try {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        } catch (e) {
          /* file:// – kihagyjuk */
        }
      }
      if (opener && typeof opener.focus === 'function' && document.contains(opener)) opener.focus();
      opener = null;
    });

    closeBtn.addEventListener('click', requestClose);

    // Kattintás a sötétített háttérre is bezárja.
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) requestClose();
    });

    grid.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-product]');
      if (btn) open(btn.getAttribute('data-product'), true);
    });

    function fromHash() {
      var id = decodeURIComponent(window.location.hash.slice(1));
      if (id && byId(id)) open(id, false);
      else if (dialog.open) {
        // Vissza gombbal léptünk ki a termékből.
        dialog.close();
      }
    }

    window.addEventListener('popstate', fromHash);
    window.addEventListener('hashchange', fromHash);
    fromHash();
  }

  function init() {
    renderFeatured();
    renderSeason();
    initCatalog();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
