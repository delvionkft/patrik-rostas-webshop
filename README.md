# Csodakert – gyümölcsfa-csemeték weboldala

Magyar nyelvű, statikus termékbemutató oldal gyümölcsfa-csemetékhez. A képeken a fák termése látható. Van kosár és rendelési űrlap, de nincs online fizetés, és nincs build-lépés: sima HTML, CSS és JavaScript, bármilyen statikus tárhelyen fut (Netlify, GitHub Pages, cPanel stb.).

| Oldal | Fájl |
| --- | --- |
| Főoldal | `index.html` |
| Termékeink | `termekeink.html` (kereső, kategóriaszűrő; a kártyára kattintva a gyümölcs aloldala nyílik meg) |
| Gyümölcs aloldal | `gyumolcs.html#korte` (a gyümölcs összes fajtája képpel, leírás, idény, tárolási javaslat) |
| Rólunk | `rolunk.html` |
| Kapcsolat | `kapcsolat.html` (kérdések: telefon, e-mail, kérdező űrlap) |
| Rendelés | `rendeles.html` (a kosár tartalma kitöltve + név, telefonszám, e-mail; online fizetés nincs) |
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
| `[Székhely címe]` és a többi impresszumadat | csak a `jogi.html` impresszumában (online értékesítésnél kötelező) | – |
| `[Domain]` | a weboldal domainje, `https://` nélkül | rostasgyumolcs.hu |
| Rólunk-szövegek, képaláírások, impresszum, adatkezelési tájékoztató | valós tartalom | – |

A név (Csodakert), a logó, a telefonszám (06 30 627 5512) és az e-mail-cím (kerteszet1993@gmail.com) már be van írva. Cím és nyitvatartás nem szerepel az oldalon, mert a vásárlás online történik.

Tömeges csere, például:

```bash
sed -i 's/\[Domain\]/csodakert.hu/g' *.html
```

Utána keresd meg, mi maradt: `grep -o '\[[^]]*\]' *.html | sort | uniq -c`

### 2. Fotók

Jelenleg **helyőrző illusztrációk** vannak az oldalon (jobb alsó sarkukban „Helyőrző illusztráció” felirat), mert valódi fotó nem állt rendelkezésre. Stockfotót ne használj a bemutatkozó képekhez: idegen gyümölcsös vagy csapat képe a megbízhatóságot rombolja, nem építi.

| Kép | Hol van | Javasolt méret |
| --- | --- | --- |
| Nyitókép (hero) | `index.html`, `assets/img/hero/oszibarack.webp` (a jobb szélig érő fotó; jelenleg egy fajtafotó) | legalább 1600×1200 px (fekvő), a téma a kép jobb oldalán legyen |
| Fotók rólatok (3 db: gyümölcsös, válogatás/csomagolás, csapat) | `rolunk.html`, `index.html`; jelenleg fajtafotók állnak a helyükön | 1600×1200 px (4:3) |
| Termékfotók | `assets/js/products.js` → `image` mező | 1200×900 px (4:3). A dizájn sötét, stúdiófényes háttérre épül: egységes sötét háttér előtt, oldalfénnyel fotózd a gyümölcsöt |
| Megosztási kép | `assets/img/og-image.jpg` (kész: logó + saját termékfotók) | 1200×630 px |

Fotócsere után **az `alt` szöveget is írd át**, hogy azt írja le, ami a képen valóban látszik. A fotókat WebP vagy JPG formátumban, kb. 80%-os minőséggel töltsd fel (egy termékfotó legfeljebb ~150 KB legyen).

### 3. Kínálat (`assets/js/products.js`)

Az egész oldal ebből az egy fájlból dolgozik: Termékeink, valamint a főoldali „Kiemelt gyümölcsök” blokk és az idénynaptár. A gyümölcslista **mintalista**, a valós kínálathoz kell igazítani. A mezők leírása a fájl elején van. A fontosabb szabályok:

- **Ár:** minden csemete 3000 Ft (`price: 3000`, `unit: 'csemete'`, `priceDate: null`). Fix listaárnál a `priceDate` null, így az ár mindig látszik: a kártyán, a gyümölcs aloldalán, minden fajtakártyán és a fajtaleírásban. Egy fajta saját árat kaphat (`{ name, price: 3500, ... }`). Ha valaha időszakos árat adsz meg dátummal, az csak 30 napig látszik (`PRICE_MAX_AGE_DAYS`), utána magától eltűnik.
- **Fajták:** a `varieties` listába kerül minden fajta névvel és képpel (`assets/img/varieties/`). Opcionálisan `intro` (rövid bemutatás) és `facts` (pl. érés, íz, porzás) is megadható: ilyenkor a fajtakártyára kattintva leírásablak nyílik. A gyümölcs aloldalán betűrendben jelennek meg, a kereső fajtanévre is talál.
- **Kategóriák:** `gyumolcsfa` (szabadgyökeres gyümölcsfa-oltványok, gyümölcsönként egy tétel), `szolo` (két tétel: „Magyar szőlőskertek legendái” és „Különleges csemegeszőlők”), `rozsa` (magastörzsű rózsafák). A szőlő- és rózsafajtákat a megfelelő tétel `varieties` listájába kell felvenni, ugyanúgy, mint a gyümölcsfáknál; amíg üres, a tétel „Fajták hamarosan” jelzéssel jelenik meg, ár nélkül.
- **MI-vel generált / illusztratív képek:** a fajtánál `ai: true`, a borítónál `imageAi: true`. Ilyenkor a képen „Illusztráció” jelölés látszik, a fotómozaikban pedig a felirat mellett „· illusztráció”. Jelenleg ilyen: Andosa, Redhaven, Dixired (őszibarack), Bigarreau Burlat (cseresznye), Debreceni bőtermő (meggy), Stanley (szilva) és mind a 9 rózsa (a feltöltött plakátok feliratmentes kivágása). Valódi fotóra cserélve a jelölést töröld.
- **Idegen vízjeles kép:** a Debreceni muskotály (szilva) képe idegen weboldal vízjelét viseli (a megrendelő kérésére került fel). Élesítés előtt cseréld saját vagy engedéllyel használt fotóra.
- **Saját fotó nélküli termék:** `image: null`, ilyenkor semleges „Fotó hamarosan” mező jelenik meg. Stock- vagy idegen fotót ne tegyél be.
- **Üres kategória** szűrőgombja automatikusan elrejtődik.
- **Fajta, származás** csak kitöltve jelenik meg. Ne írj be olyat, amit nem tudsz biztosan (pl. „hazai”, „bio”, „termelőtől”).
- **Idény (`season`)**: a szedési idő hónapjai, kizárólag a fajták leírásában megadott érési idők alapján (pl. alma: a Fehér Klára júliustól a Fuji és a Pónyik októberig → július–október). Tárolt áru eladhatóságát nem jelöli. Ha nincs forrás, a lista üres (`[]`), és a gyümölcs nem jelenik meg az idénynaptárban. Ebből jelenik meg a „Szezonális” címke, a főoldali „Most van idénye” blokk és az idénynaptár. Ha egy hónapban semminek nincs szedési ideje, a blokk a következő idényt mutatja.
- **„Új a kínálatban”**: `isNew: true`.
- **Kiemelt a főoldalon**: `featured: true` (4 darab javasolt).

### 4. Kosár és rendelés

- **Kosárba tétel:** minden fajtakártyán és a fajtaleírás-ablakban „Kosárba” gomb. A fejlécben a kosár gomb mutatja a darabszámot; rákattintva oldalt nyílik a kosár (mennyiség +/−, beírható 1–999, törlés, összesen).
- **Tovább a rendeléshez** → `rendeles.html`: a tételek és mennyiségek kitöltve (itt is módosíthatók), kötelező a név, a telefonszám, az e-mail-cím, a szállítási cím (irányítószám, település, utca, házszám; GLS házhozszállítás) és az adatkezelési hozzájárulás; a megjegyzés nem kötelező. Fizetés utánvéttel. Üres kosárral nem küldhető.
- A kosár a látogató böngészőjében marad (localStorage), oldalváltáskor és újratöltéskor is megmarad. Ha a böngésző tárolója tiltott (pl. privát mód), az oldalon belül akkor is működik.
- **Küldés:** ugyanúgy, mint a kérdező űrlapnál: a `rendeles.html` `data-endpoint` attribútumába írt űrlapkezelőre (pl. Formspree), vagy ha az üres, a látogató levelezőprogramját nyitja meg a kitöltött rendeléssel. **Rendeléshez az űrlapkezelő erősen ajánlott:** a levelezőprogramos megoldásnál nem tudjuk, hogy a látogató végül elküldte-e a levelet, és sok telefonon nincs is beállított levelezőprogram. Sikeres küldés után a kosár kiürül; hiba esetén megmarad.
- Az űrlapkezelő a rendelést a `rendeles` mezőben kapja szövegesen (pl. `3 × Körte – Kieffer (3000 Ft/csemete) = 9000 Ft`, a végén az összesen).
- A kérdező űrlap a Kapcsolat oldalon változatlanul megmaradt.

### 5. Kapcsolatfelvételi (kérdező) űrlap

Alapból az űrlap a látogató levelezőprogramját nyitja meg kitöltött levéllel. Ez megbízhatatlan (sok telefonon nincs beállított levelezőprogram). **Élesítéshez állíts be űrlapkezelőt**, pl. [Formspree](https://formspree.io): a `kapcsolat.html` fájlban a `data-endpoint=""` attribútumba írd a kapott végpontot (`https://formspree.io/f/xxxx`). Az űrlapban van spamcsapda mező (`_gotcha`) és kötelező adatkezelési hozzájárulás.

### 6. Jogi szövegek

A `jogi.html` impresszuma és adatkezelési tájékoztatója helyőrző. Az űrlap személyes adatot gyűjt, ezért a tájékoztató nem hagyható ki. Érdemes szakemberrel összeállíttatni.

## Szerkezet

```
assets/
  css/style.css         – minden stílus, színek a :root változókban
  js/products.js        – a kínálat adatai
  js/shop.js            – termékkártyák, kereső, szűrők, részletek ablak, idénynaptár
  js/main.js            – menü, űrlapok közös része (ellenőrzés, küldés), helyőrző-kiemelés
  js/cart.js            – kosár, kosárpanel, rendelési űrlap
  fonts/                – Archivo (változtatható szélesség) + IBM Plex Mono, saját tárhelyről, OFL licenc; nincs Google Fonts hívás
  img/products/         – termékfotók (WebP, 4:3)
  img/logo.webp         – logó a fejlécben; logo-light.webp a sötét láblécben (fehér felirattal)
  img/logo.png          – logó a keresőknek (JSON-LD); logo-eredeti.png a feltöltött, teljes felbontású eredeti
  img/placeholder/      – nyitókép- és üzletfotó-helyőrzők
favicon.png, apple-touch-icon.png – böngészőikon a logó virágából
scripts/generate-placeholders.mjs – a nyitókép- és üzletfotó-helyőrzők generátora (node scripts/generate-placeholders.mjs)
```

A fejléc és a lábléc minden HTML-fájlban szerepel, egy menüpont módosítását mind a hat fájlban el kell végezni.

## Ellenőrizve

- HTML-validálás (html-validate, ajánlott szabálykészlet): hibamentes.
- Akadálymentesség (axe-core, WCAG 2.1 AA és best practice, asztali és mobil nézetben, minden oldalon): 0 hiba.
- A tartalom JavaScript-animáció nélkül, betöltéskor azonnal teljesen látható.
- Nincs vízszintes görgetés 320, 360, 768 és 1024 px szélességen.
- Automatizált böngészőtesztek: mobilmenü, kereső (ékezetek nélkül is: „korte” → Körte), kategóriaszűrők, üres találat, termékablak (megnyitás, bezárás, Vissza gomb, megosztható link), friss és elavult ár kezelése, idénynaptár (sorok, aktuális hónap), űrlap-validálás és előtöltés, képek betöltődése, JS-hibák hiánya.
