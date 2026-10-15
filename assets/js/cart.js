/* Kosár és rendelés: a kiválasztott oltványok a látogató böngészőjében maradnak (localStorage),
   a rendelés az űrlapon megy el. Online fizetés nincs: GLS házhozszállítás, utánvét. */
(function () {
  'use strict';

  var KEY = 'csodakert-kosar';
  var MAX_QTY = 999;
  var memory = []; // ha a böngésző tárolója nem elérhető (privát mód), legalább az oldalon belül működjön

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function money(n) {
    return new Intl.NumberFormat('hu-HU').format(n) + ' Ft';
  }

  function clampQty(n) {
    n = Math.floor(Number(n));
    if (!isFinite(n) || n < 1) return 1;
    return Math.min(n, MAX_QTY);
  }

  /* ---------------------------------------------------------------------
     Tároló
     --------------------------------------------------------------------- */
  function read() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (raw === null) return memory.slice();
      var list = JSON.parse(raw);
      return Array.isArray(list)
        ? list.filter(function (i) {
            return i && typeof i.fruit === 'string' && typeof i.variety === 'string';
          })
        : [];
    } catch (e) {
      return memory.slice();
    }
  }

  function write(list) {
    memory = list.slice();
    try {
      window.localStorage.setItem(KEY, JSON.stringify(list));
    } catch (e) {
      /* privát mód, letiltott tároló – a memóriában marad */
    }
    render();
  }

  function keyOf(i) {
    return i.fruit + '|' + i.variety;
  }

  // A termékadatokból (ha az oldalon be vannak töltve) frissítjük a nevet, árat és képet.
  function lookup(fruitId, varietyName) {
    var products = window.PRODUCTS || [];
    for (var i = 0; i < products.length; i++) {
      if (products[i].id !== fruitId) continue;
      var p = products[i];
      var vs = p.varieties || [];
      for (var j = 0; j < vs.length; j++) {
        if (vs[j].name === varietyName) return { p: p, v: vs[j] };
      }
    }
    return null;
  }

  function fromData(fruitId, varietyName, qty) {
    var hit = lookup(fruitId, varietyName);
    if (!hit) return null;
    var shop = window.Shop;
    return {
      fruit: fruitId,
      variety: varietyName,
      fruitName: hit.p.name,
      price: shop ? shop.priceOf(hit.p, hit.v) : null,
      unit: shop ? shop.unitOf(hit.p, hit.v) : '',
      image: hit.v.image || hit.p.image || '',
      qty: clampQty(qty),
    };
  }

  function refresh() {
    if (!window.PRODUCTS) return;
    var changed = false;
    var list = read().map(function (i) {
      var fresh = fromData(i.fruit, i.variety, i.qty);
      if (!fresh) return i;
      if (fresh.price !== i.price || fresh.image !== i.image || fresh.fruitName !== i.fruitName) changed = true;
      return fresh;
    });
    if (changed) write(list);
  }

  var Cart = {
    items: read,
    count: function () {
      return read().reduce(function (s, i) {
        return s + clampQty(i.qty);
      }, 0);
    },
    total: function () {
      return read().reduce(function (s, i) {
        return s + (typeof i.price === 'number' ? i.price * clampQty(i.qty) : 0);
      }, 0);
    },
    hasUnpriced: function () {
      return read().some(function (i) {
        return typeof i.price !== 'number';
      });
    },
    add: function (fruitId, varietyName, qty) {
      var item = fromData(fruitId, varietyName, qty || 1);
      if (!item) return null;
      var list = read();
      var found = false;
      list.forEach(function (i) {
        if (keyOf(i) === keyOf(item)) {
          i.qty = clampQty(clampQty(i.qty) + item.qty);
          found = true;
        }
      });
      if (!found) list.push(item);
      write(list);
      return item;
    },
    setQty: function (key, qty) {
      write(
        read().map(function (i) {
          if (keyOf(i) === key) i.qty = clampQty(qty);
          return i;
        })
      );
    },
    remove: function (key) {
      write(
        read().filter(function (i) {
          return keyOf(i) !== key;
        })
      );
    },
    clear: function () {
      write([]);
    },
    // Szöveges összesítő a rendeléshez (levél, űrlapkezelő).
    summary: function () {
      var lines = read().map(function (i) {
        var q = clampQty(i.qty);
        return (
          q + ' × ' + i.fruitName + ' – ' + i.variety +
          (typeof i.price === 'number' ? ' (' + money(i.price) + '/' + (i.unit || 'db') + ') = ' + money(i.price * q) : ' (ár egyeztetés szerint)')
        );
      });
      lines.push('Összesen: ' + money(Cart.total()) + (Cart.hasUnpriced() ? ' + egyeztetés szerinti tételek' : ''));
      return lines.join('\n');
    },
  };
  window.Cart = Cart;

  /* ---------------------------------------------------------------------
     Megjelenítés: fejléc-számláló, kosárpanel, rendelési lista
     --------------------------------------------------------------------- */
  function itemsHtml(list) {
    return (
      '<ul class="cart-items">' +
      list
        .map(function (i) {
          var key = esc(keyOf(i));
          var label = esc(i.fruitName + ' – ' + i.variety);
          var q = clampQty(i.qty);
          return (
            '<li class="cart-item" data-key="' + key + '">' +
            (i.image
              ? '<img class="cart-item__img" src="' + esc(i.image) + '" alt="" width="64" height="48" loading="lazy">'
              : '<span class="cart-item__img cart-item__img--none" aria-hidden="true"></span>') +
            '<div class="cart-item__info">' +
            '<p class="cart-item__name">' + esc(i.variety) + '</p>' +
            '<p class="cart-item__meta">' + esc(i.fruitName) +
            (typeof i.price === 'number' ? ' · ' + esc(money(i.price)) + ' / ' + esc(i.unit || 'db') : ' · ár egyeztetés szerint') +
            '</p>' +
            '</div>' +
            '<div class="qty">' +
            '<button type="button" class="qty__btn" data-qty="-1" aria-label="Eggyel kevesebb: ' + label + '"' + (q <= 1 ? ' disabled' : '') + '>−</button>' +
            '<input class="qty__input" type="number" inputmode="numeric" min="1" max="' + MAX_QTY + '" value="' + q + '" aria-label="Mennyiség: ' + label + '">' +
            '<button type="button" class="qty__btn" data-qty="1" aria-label="Eggyel több: ' + label + '"' + (q >= MAX_QTY ? ' disabled' : '') + '>+</button>' +
            '</div>' +
            '<strong class="cart-item__sum">' + (typeof i.price === 'number' ? esc(money(i.price * q)) : '–') + '</strong>' +
            '<button type="button" class="cart-item__remove" data-remove aria-label="Törlés a kosárból: ' + label + '">' +
            '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button>' +
            '</li>'
          );
        })
        .join('') +
      '</ul>'
    );
  }

  var EMPTY =
    '<div class="cart-empty"><p><strong>A kosarad üres.</strong></p>' +
    '<p>Válassz fajtát a kínálatból, és tedd kosárba a „Kosárba” gombbal.</p>' +
    '<a class="btn btn--secondary" href="termekeink.html">Megnézem a kínálatot</a></div>';

  function render() {
    var list = read();
    var count = Cart.count();
    var total = money(Cart.total()) + (Cart.hasUnpriced() ? ' + egyeztetés' : '');

    Array.prototype.forEach.call(document.querySelectorAll('[data-cart-count]'), function (el) {
      el.textContent = String(count);
      el.hidden = count === 0;
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-cart-open]'), function (el) {
      el.setAttribute('aria-label', count ? 'Kosár, ' + count + ' oltvány' : 'Kosár (üres)');
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-cart-list], [data-order-list]'), function (el) {
      // A fókuszt megtartjuk, ha épp egy mennyiségmezőben gépel a látogató.
      var active = document.activeElement;
      var activeKey = active && el.contains(active) && active.closest('.cart-item') ? active.closest('.cart-item').getAttribute('data-key') : null;
      var activeSel = active && active.classList ? (active.classList.contains('qty__input') ? '.qty__input' : active.getAttribute('data-qty') ? '[data-qty="' + active.getAttribute('data-qty') + '"]' : null) : null;
      el.innerHTML = list.length ? itemsHtml(list) : EMPTY;
      if (activeKey && activeSel) {
        var row = el.querySelector('.cart-item[data-key="' + activeKey.replace(/"/g, '\\"') + '"]');
        var target = row && row.querySelector(activeSel);
        if (target && !target.disabled) target.focus();
      }
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-cart-total], [data-order-total]'), function (el) {
      el.textContent = total;
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-cart-filled]'), function (el) {
      el.hidden = !list.length;
    });
  }

  // Mennyiség és törlés: a kosárpanelen és a rendelési oldalon is.
  function bindList(root) {
    root.addEventListener('click', function (e) {
      var row = e.target.closest('.cart-item');
      if (!row) return;
      var key = row.getAttribute('data-key');
      var step = e.target.closest('[data-qty]');
      if (step) {
        var input = row.querySelector('.qty__input');
        Cart.setQty(key, clampQty(input.value) + Number(step.getAttribute('data-qty')));
        return;
      }
      if (e.target.closest('[data-remove]')) {
        var next = row.nextElementSibling || row.previousElementSibling;
        var nextKey = next ? next.getAttribute('data-key') : null;
        Cart.remove(key);
        // A fókusz ne vesszen el: a következő tétel törlés gombjára, vagy a lista elejére.
        var target = nextKey && root.querySelector('.cart-item[data-key="' + nextKey.replace(/"/g, '\\"') + '"] [data-remove]');
        (target || root.querySelector('a, button') || root).focus();
      }
    });
    root.addEventListener('change', function (e) {
      if (!e.target.classList.contains('qty__input')) return;
      Cart.setQty(e.target.closest('.cart-item').getAttribute('data-key'), e.target.value);
    });
  }

  /* ---------------------------------------------------------------------
     Kosárpanel (oldalról becsúszó ablak) és visszajelzés kosárba tételkor
     --------------------------------------------------------------------- */
  function initPanel() {
    var dialog = document.getElementById('cart-dialog');
    if (!dialog || typeof dialog.showModal !== 'function') return;
    var opener = null;

    function open(from) {
      opener = from || document.activeElement;
      render();
      dialog.showModal();
      document.body.classList.add('is-locked');
    }
    Cart.open = open;

    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-cart-open]');
      if (trigger) {
        e.preventDefault();
        open(trigger);
      }
    });
    Array.prototype.forEach.call(dialog.querySelectorAll('[data-cart-close]'), function (b) {
      b.addEventListener('click', function () {
        dialog.close();
      });
    });
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) dialog.close(); // kattintás a sötét háttérre
    });
    dialog.addEventListener('close', function () {
      document.body.classList.remove('is-locked');
      if (opener && opener.focus && document.contains(opener)) opener.focus();
    });
    bindList(dialog.querySelector('[data-cart-list]'));
  }

  function initAddButtons() {
    var toast = document.querySelector('[data-cart-toast]');
    var timer = null;
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-add-fruit]');
      if (!btn) return;
      var item = Cart.add(btn.getAttribute('data-add-fruit'), btn.getAttribute('data-add-variety'), 1);
      if (!item) return;
      btn.classList.add('is-added');
      setTimeout(function () {
        btn.classList.remove('is-added');
      }, 1200);
      if (toast) {
        var inCart = 0;
        read().forEach(function (i) {
          if (keyOf(i) === keyOf(item)) inCart = clampQty(i.qty);
        });
        toast.innerHTML =
          '<span>Kosárba tetted: <strong>' + esc(item.fruitName + ' – ' + item.variety) + '</strong>' +
          (inCart > 1 ? ' (' + inCart + ' db)' : '') + '</span>' +
          '<button type="button" class="toast__btn" data-cart-open>Kosár megnyitása</button>';
        toast.classList.add('is-visible');
        clearTimeout(timer);
        timer = setTimeout(function () {
          toast.classList.remove('is-visible');
        }, 5000);
      }
    });
  }

  /* ---------------------------------------------------------------------
     Rendelési űrlap (rendeles.html)
     --------------------------------------------------------------------- */
  function initOrderForm() {
    var form = document.getElementById('order-form');
    if (!form || !window.SiteForm) return;
    bindList(form.querySelector('[data-order-list]'));

    var R = window.SiteForm.rules;
    var f = window.SiteForm.bind(form, {
      items: function () {
        return read().length ? '' : 'A kosarad üres. Előbb tegyél kosárba legalább egy oltványt.';
      },
      name: R.required('Kérlek, add meg a neved.'),
      phone: R.phone(true),
      email: R.email,
      zip: function (v) {
        if (!v.trim()) return 'Kérlek, add meg az irányítószámot.';
        return /^\d{4}$/.test(v.trim()) ? '' : 'Az irányítószám 4 számjegy.';
      },
      city: R.required('Kérlek, add meg a települést.'),
      address: R.required('Kérlek, add meg az utcát és a házszámot.'),
      consent: R.consent,
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      f.setStatus('', '');
      if (!f.validateAll()) return;

      if (f.isSpam()) {
        form.reset();
        f.setStatus('success', 'Köszönjük, megkaptuk a rendelésed!');
        return;
      }

      var data = {
        name: form.elements.name.value.trim(),
        phone: form.elements.phone.value.trim(),
        email: form.elements.email.value.trim(),
        address: form.elements.zip.value.trim() + ' ' + form.elements.city.value.trim() + ', ' + form.elements.address.value.trim(),
        note: form.elements.note.value.trim(),
      };
      var summary = Cart.summary();
      form.elements.rendeles.value = summary;

      if (!f.endpoint()) {
        var to = f.mailto(
          'Rendelés a weboldalról – ' + data.name,
          'Rendelés\n\n' + summary +
            '\n\n—\nNév: ' + data.name + '\nTelefon: ' + data.phone + '\nE-mail: ' + data.email +
            '\nSzállítási cím (GLS): ' + data.address + '\nFizetés: utánvéttel' +
            (data.note ? '\nMegjegyzés: ' + data.note : '')
        );
        f.setStatus(
          'success',
          'Megnyitottuk a levelezőprogramodat a kitöltött rendeléssel – már csak el kell küldened. ' +
            'Ha nem nyílt meg, hívj minket, vagy írj ide: ' + to + '. A kosarad tartalma addig megmarad.'
        );
        return;
      }

      f.post('Rendelés küldése…')
        .then(function () {
          Cart.clear();
          form.reset();
          f.setStatus('success', 'Köszönjük, megkaptuk a rendelésed! Hamarosan felvesszük veled a kapcsolatot.');
        })
        .catch(function () {
          f.setStatus('error', 'A rendelést nem sikerült elküldeni. Kérjük, próbáld újra, vagy hívj minket telefonon: 06 30 627 5512.');
        });
    });
  }

  function init() {
    refresh();
    render();
    initPanel();
    initAddButtons();
    initOrderForm();
    // Másik lapon módosított kosár
    window.addEventListener('storage', function (e) {
      if (e.key === KEY) render();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
