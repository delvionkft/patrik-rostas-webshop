# Gyümölcsárusító bemutatkozó weboldal

Magyar nyelvű, statikus termékbemutató oldal egy gyümölcsárusító vállalkozásnak. Nincs kosár, nincs online fizetés, és nincs build-lépés: sima HTML, CSS és JavaScript, bármilyen statikus tárhelyen fut (Netlify, GitHub Pages, cPanel stb.).

| Oldal | Fájl |
| --- | --- |
| Főoldal | `index.html` |
| Termékeink | `termekeink.html` (kereső, kategóriaszűrő; a kártyára kattintva a gyümölcs aloldala nyílik meg) |
| Gyümölcs aloldal | `gyumolcs.html#korte` (a gyümölcs összes fajtája képpel, leírás, idény, tárolási javaslat) |
| Rólunk | `rolunk.html` |
| Kapcsolat | `kapcsolat.html` (térkép, űrlap, egy érintéssel hívható telefonszám) |
| Impresszum + adatkezelés | `jogi.html` |
| 404 | `404.html` |

## Helyi futtatás

```bash
python3 -m http.server 8000
# majd: http://localhost:8000
```

Fájlból (`file://`) is megnyitható, de a megosztható termékhivatkozások és a böngészőelőzmények kezelése szerveren működik megbízhatóan.

## Élesítés előtt KÖTELEZŐ

### 1. Helyőrzők cseréje

Minden hiányzó adat szögletes zárójelben szerepel. Ami kitöltetlen maradt, azt az oldal sárgán kiemeli, így semmi nem csúszik ki véletlenül.

| Helyőrző | Mi kerüljön a helyére | Példa |
| --- | --- | --- |
| `[Vállalkozás neve]` | a vállalkozás neve | Rostás Gyümölcs |
| `[Cím]` | teljes cím egy sorban (ebből készül a térkép is) | 1234 Település, Fő utca 1. |
| `[Telefonszám]` | olvasható formában | +36 30 123 4567 |
| `[Telefonszám-link]` | ugyanaz, **szóközök nélkül** (ez kell a hívható linkhez) | +36301234567 |
| `[E-mail-cím]` | e-mail-cím | info@example.hu |
| `[Nyitvatartás H–P]`, `[Nyitvatartás Szo]`, `[Nyitvatartás V]` | nyitvatartás napok szerint | 7:00–18:00 / Zárva |
| `[Domain]` | a weboldal domainje, `https://` nélkül | rostasgyumolcs.hu |
| `[Utca, házszám]`, `[Település]`, `[Irányítószám]`, `[Nyitvatartás schema.org formátumban…]` | csak a főoldal keresőknek szóló adatblokkjában (`index.html`, `application/ld+json`) | Mo-Fr 07:00-18:00, Sa 07:00-12:00 |
| Rólunk-szövegek, képaláírások, impresszum, adatkezelési tájékoztató | valós tartalom | – |

Tömeges csere (először a `-link` változatot cseréld, utána a sima telefonszámot):

```bash
sed -i 's/\[Telefonszám-link\]/+36301234567/g; s/\[Telefonszám\]/+36 30 123 4567/g' *.html
sed -i 's/\[Vállalkozás neve\]/Rostás Gyümölcs/g' *.html
```

Utána keresd meg, mi maradt: `grep -o '\[[^]]*\]' *.html | sort | uniq -c`

### 2. Fotók

Jelenleg **helyőrző illusztrációk** vannak az oldalon (jobb alsó sarkukban „Helyőrző illusztráció” felirat), mert valódi fotó nem állt rendelkezésre. Stockfotót ne használj üzletfotónak: idegen bolt képe a megbízhatóságot rombolja, nem építi.

| Kép | Hol van | Javasolt méret |
| --- | --- | --- |
| Nyitókép (hero) | `index.html`, `assets/img/placeholder/hero.svg` | 1500×1800 px (álló, 4:5), lehetőleg a saját pultotok |
| Üzletfotók (3 db) | `rolunk.html`, `index.html`, `assets/img/placeholder/*.svg` | 1600×1200 px (4:3) |
| Termékfotók | `assets/js/products.js` → `image` mező | 1200×900 px (4:3). A dizájn sötét, stúdiófényes háttérre épül: egységes sötét háttér előtt, oldalfénnyel fotózd a gyümölcsöt |
| Megosztási kép | `assets/img/og-image.png` | 1200×630 px |

Fotócsere után **az `alt` szöveget is írd át**, hogy azt írja le, ami a képen valóban látszik. A fotókat WebP vagy JPG formátumban, kb. 80%-os minőséggel töltsd fel (egy termékfotó legfeljebb ~150 KB legyen).

### 3. Kínálat (`assets/js/products.js`)

Az egész oldal ebből az egy fájlból dolgozik: Termékeink, valamint a főoldali „Kiemelt gyümölcsök” blokk és az idénynaptár. A gyümölcslista **mintalista**, a valós kínálathoz kell igazítani. A mezők leírása a fájl elején van. A fontosabb szabályok:

- **Ár** csak akkor jelenik meg, ha `price`, `unit` és `priceDate` is ki van töltve, és a dátum legfeljebb 30 napos (`PRICE_MAX_AGE_DAYS`). Az elavult ár így magától eltűnik, és nem kerülhet ki rossz ár.
- **Fajták:** a `varieties` listába kerül minden fajta névvel és képpel (`assets/img/varieties/`). A gyümölcs aloldalán betűrendben jelennek meg, a kereső fajtanévre is talál.
- **Saját fotó nélküli termék:** `image: null`, ilyenkor semleges „Fotó hamarosan” mező jelenik meg. Stock- vagy idegen fotót ne tegyél be.
- **Üres kategória** szűrőgombja automatikusan elrejtődik.
- **Fajta, származás** csak kitöltve jelenik meg. Ne írj be olyat, amit nem tudsz biztosan (pl. „hazai”, „bio”, „termelőtől”).
- **„Szezonális” címke** automatikusan jelenik meg, ha az aktuális hónap benne van a `season` listában. A főoldali idénynaptár is ebből a mezőből rajzolódik, az aktuális hónap kiemelésével.
- **„Új a kínálatban”**: `isNew: true`.
- **Kiemelt a főoldalon**: `featured: true` (4 darab javasolt).

### 4. Kapcsolatfelvételi űrlap

Alapból az űrlap a látogató levelezőprogramját nyitja meg kitöltött levéllel. Ez megbízhatatlan (sok telefonon nincs beállított levelezőprogram). **Élesítéshez állíts be űrlapkezelőt**, pl. [Formspree](https://formspree.io): a `kapcsolat.html` fájlban a `data-endpoint=""` attribútumba írd a kapott végpontot (`https://formspree.io/f/xxxx`). Az űrlapban van spamcsapda mező (`_gotcha`) és kötelező adatkezelési hozzájárulás.

### 5. Jogi szövegek

A `jogi.html` impresszuma és adatkezelési tájékoztatója helyőrző. Az űrlap személyes adatot gyűjt, ezért a tájékoztató nem hagyható ki. Érdemes szakemberrel összeállíttatni.

## Térkép

A Google Térkép csak akkor töltődik be, ha a látogató rákattint, mert a Google sütiket helyez el. Amíg a `[Cím]` nincs kitöltve, a gomb le van tiltva. A beágyazás nem igényel API-kulcsot.

## Szerkezet

```
assets/
  css/style.css         – minden stílus, színek a :root változókban
  js/products.js        – a kínálat adatai
  js/shop.js            – termékkártyák, kereső, szűrők, részletek ablak, idénynaptár
  js/main.js            – menü, térkép, űrlap, helyőrző-kiemelés
  fonts/                – Archivo (változtatható szélesség) + IBM Plex Mono, saját tárhelyről, OFL licenc; nincs Google Fonts hívás
  img/products/         – termékfotók (WebP, 4:3)
  img/placeholder/      – nyitókép- és üzletfotó-helyőrzők
scripts/generate-placeholders.mjs – a nyitókép- és üzletfotó-helyőrzők generátora (node scripts/generate-placeholders.mjs)
```

A fejléc és a lábléc minden HTML-fájlban szerepel, egy menüpont módosítását mind a hat fájlban el kell végezni.

## Ellenőrizve

- HTML-validálás (html-validate, ajánlott szabálykészlet): hibamentes.
- Akadálymentesség (axe-core, WCAG 2.1 AA és best practice, asztali és mobil nézetben, minden oldalon): 0 hiba.
- A tartalom JavaScript-animáció nélkül, betöltéskor azonnal teljesen látható.
- Nincs vízszintes görgetés 320, 360, 768 és 1024 px szélességen.
- Automatizált böngészőtesztek: mobilmenü, kereső (ékezetek nélkül is: „korte” → Körte), kategóriaszűrők, üres találat, termékablak (megnyitás, bezárás, Vissza gomb, megosztható link), friss és elavult ár kezelése, idénynaptár (sorok, aktuális hónap), űrlap-validálás és előtöltés, képek betöltődése, JS-hibák hiánya.
