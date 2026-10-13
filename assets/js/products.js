/*
 * A kínálat adatai – az egész oldal innen dolgozik (Termékeink, Főoldal kiemelt és szezonális blokkja).
 *
 * A lista a feltöltött termékfotók és fajtanevek alapján készült.
 *
 * Mezők:
 *   id         – egyedi azonosító, ékezet nélkül (ez kerül a linkbe: termekeink.html#alma)
 *   name       – megjelenő név
 *   category   – "almafele" | "citrus" | "bogyos" | "egyeb"
 *   keywords   – (opcionális) további keresőszavak, pl. népies nevek: ['szamoca']
 *   short      – 1–2 mondat a kártyára
 *   long       – részletesebb leírás a felugró ablakba
 *   variety    – fajta (pl. "Jonagold"); null, ha nincs megadott adat → nem jelenik meg
 *   origin     – származás (pl. "Szabolcs-Szatmár-Bereg"); null, ha nincs adat → nem jelenik meg
 *   price      – ár forintban (szám), null, ha nincs adat
 *   unit       – mértékegység (pl. "kg", "db", "doboz")
 *   priceDate  – az ár érvényességének napja "ÉÉÉÉ-HH-NN" formában.
 *                Az ár CSAK akkor jelenik meg, ha price, unit és priceDate is ki van töltve,
 *                és a priceDate legfeljebb PRICE_MAX_AGE_DAYS napos. Így elavult ár nem kerülhet ki.
 *   season     – a gyümölcs jellemző hazai idényének hónapjai (1–12). Üres tömb = nincs kifejezett idény.
 *                Általános tájékoztatás, nem a termék származására vonatkozik.
 *                A „Szezonális” címke automatikusan megjelenik, ha az aktuális hónap benne van.
 *   isNew      – true esetén „Új a kínálatban” címke jelenik meg
 *   featured   – true esetén a főoldali „Kiemelt gyümölcsök” között is szerepel (4 javasolt)
 *   image, alt – kép útvonala és leíró képszöveg. Ha még nincs saját fotó: image: null (semleges „Fotó hamarosan” mező jelenik meg).
 *                Csak saját vagy engedéllyel használt fotót tegyél ide.
 *   storage    – tárolási javaslat (általános tudnivaló)
 */

window.PRICE_MAX_AGE_DAYS = 30;

window.CATEGORIES = [
  { id: 'osszes', label: 'Összes' },
  { id: 'almafele', label: 'Almafélék' },
  { id: 'citrus', label: 'Citrusfélék' },
  { id: 'bogyos', label: 'Bogyós gyümölcsök' },
  { id: 'egyeb', label: 'Egyéb gyümölcsök' },
];

window.PRODUCTS = [
  // --- Almafélék ---------------------------------------------------------
  {
    id: 'alma',
    name: 'Alma',
    category: 'almafele',
    short: 'Ropogós, lédús, egyszerre édes és savanykás. Nyersen és sütve is sokoldalúan felhasználható.',
    long: 'Az alma a gyümölcsöstál alapja: fajtától függően lehet mézédes, savanykás, ropogós vagy omlósabb. Nyersen, salátába reszelve, rétesben vagy sült almaként egyaránt remek. Ha bizonytalan vagy, melyik fajtát válaszd, szívesen segítünk.',
    variety: 'Jonagored',
    origin: null,
    price: null,
    unit: null,
    priceDate: null,
    season: [8, 9, 10, 11],
    isNew: false,
    featured: true,
    image: 'assets/img/products/alma.webp',
    alt: 'Piros Jonagored almák az ágon',
    storage: 'Hűtőben vagy hűvös kamrában hetekig eláll. Tartsd külön a többi gyümölcstől, mert érlelőgázt bocsát ki, ami gyorsítja a mellette lévők érését.',
  },
  {
    id: 'korte',
    name: 'Körte',
    category: 'almafele',
    short: 'Illatos, lédús gyümölcs, érett állapotban puha, vajas állagú.',
    long: 'A körte akkor a legfinomabb, amikor a szár körüli része enyhén engedni kezd az ujjad alatt. Önmagában, sajttal, diós salátában vagy pitében is kiváló. Keményebb darabokból kompót vagy sült körte készíthető.',
    variety: 'Vilmos',
    origin: null,
    price: null,
    unit: null,
    priceDate: null,
    season: [8, 9, 10],
    isNew: false,
    featured: true,
    image: 'assets/img/products/korte.webp',
    alt: 'Két sárgászöld Vilmos körte az ágon, levelek között',
    storage: 'Szobahőmérsékleten néhány nap alatt beérik. Ha már puha, tedd hűtőbe, és 2–3 napon belül fogyaszd el.',
  },
  {
    id: 'birs',
    keywords: ['birs'],
    name: 'Birsalma',
    category: 'almafele',
    short: 'Illatos őszi gyümölcs, főzve és sütve a legízletesebb.',
    long: 'A birsalma nyersen kemény és fanyar, de hőkezelve csodás illatot és mély, mézes ízt kap. Birsalmasajtnak, lekvárnak, kompótnak vagy húsételek mellé sütve is kiváló. Már pár darab is betölti illatával a konyhát.',
    variety: 'Bereczki bőtermő',
    origin: null,
    price: null,
    unit: null,
    priceDate: null,
    season: [10, 11],
    isNew: false,
    featured: false,
    image: 'assets/img/products/birs.webp',
    alt: 'Sárga birsalmák a fán, zöld levelek között',
    storage: 'Hűvös, száraz helyen több hétig is eláll. Erős illata átjárhatja a többi gyümölcsöt, ezért tartsd külön.',
  },


  // --- Egyéb gyümölcsök ---------------------------------------------------
  {
    id: 'oszibarack',
    keywords: ['barack'],
    name: 'Őszibarack',
    category: 'egyeb',
    short: 'Bársonyos héjú, édes és lédús nyári gyümölcs.',
    long: 'Az érett őszibarack illatos, lédús és édes. Magában, gyümölcssalátában, pitében vagy grillezve is kiváló. Az érett gyümölcs enyhe nyomásra kissé enged.',
    variety: 'Dixired',
    origin: null,
    price: null,
    unit: null,
    priceDate: null,
    season: [7, 8],
    isNew: false,
    featured: true,
    image: 'assets/img/products/oszibarack.webp',
    alt: 'Érett, pirosas Dixired őszibarackok a fán',
    storage: 'Szobahőmérsékleten érik be. Az érett gyümölcsöt hűtőben tárold, és 1–2 napon belül fogyaszd el.',
  },
  {
    id: 'sargabarack',
    keywords: ['kajszi', 'kajszibarack', 'barack'],
    name: 'Sárgabarack',
    category: 'egyeb',
    short: 'Illatos, édes-savanykás barack, lekvárhoz és gombóchoz is kiváló.',
    long: 'A sárgabarack nyersen is finom, de igazán lekvárban, gombócban, pitében vagy befőttként mutatja meg magát. Az érett gyümölcs mélyen narancssárga és illatos.',
    variety: 'Harcot',
    origin: null,
    price: null,
    unit: null,
    priceDate: null,
    season: [6, 7],
    isNew: false,
    featured: false,
    image: 'assets/img/products/sargabarack.webp',
    alt: 'Narancssárga Harcot kajszibarackok az ágon',
    storage: 'Szobahőmérsékleten érlelheted. Az érett gyümölcsöt hűtőben tárold, és pár napon belül fogyaszd el.',
  },
  {
    id: 'szilva',
    name: 'Szilva',
    category: 'egyeb',
    short: 'Lédús, édes-fanyar gyümölcs gombóchoz, lekvárhoz, süteményhez.',
    long: 'A szilva nyersen is finom, de sütve, főzve igazán sokoldalú: szilvás gombóc, pite, lekvár vagy kompót is készülhet belőle. A héján lévő hamvas, fehéres bevonat természetes.',
    variety: 'Debreceni muskotály',
    origin: null,
    price: null,
    unit: null,
    priceDate: null,
    season: [7, 8, 9],
    isNew: false,
    featured: false,
    image: null,
    alt: '',
    storage: 'Szobahőmérsékleten beérik. Az érett szilvát hűtőben tárold, és néhány napon belül fogyaszd el.',
  },
  {
    id: 'cseresznye',
    name: 'Cseresznye',
    category: 'egyeb',
    short: 'Ropogós, édes, sötétpiros szemek a kora nyári idényből.',
    long: 'A cseresznye az elsők között jelzi a nyarat. Ropogós, édes szemei magukban is elfogynak, de clafoutis-ban, süteményben vagy befőttként is remekek. Válassz fényes, feszes szemeket zöld szárral.',
    variety: 'Katalin',
    origin: null,
    price: null,
    unit: null,
    priceDate: null,
    season: [5, 6],
    isNew: false,
    featured: true,
    image: 'assets/img/products/cseresznye.webp',
    alt: 'Sötétpiros Katalin cseresznyék fürtben az ágon',
    storage: 'Mosatlanul, szárával együtt tárold a hűtőben, és néhány napon belül fogyaszd el.',
  },
  {
    id: 'meggy',
    keywords: ['meggy'],
    name: 'Meggy',
    category: 'egyeb',
    short: 'Sötétpiros, savanykás-édes gyümölcs befőttnek, süteménynek, levesnek.',
    long: 'A meggy savanykásabb, mint a cseresznye, ezért konyhai felhasználásra különösen alkalmas: meggyleves, rétes, pite, befőtt vagy lekvár is készülhet belőle. Az érett szem sötétpiros, fényes és lédús.',
    variety: 'Érdi nagygyümölcsű',
    origin: null,
    price: null,
    unit: null,
    priceDate: null,
    season: [6, 7],
    isNew: false,
    featured: false,
    image: 'assets/img/products/meggy.webp',
    alt: 'Sötétpiros Érdi nagygyümölcsű meggyszemek fürtben az ágon',
    storage: 'Mosatlanul, szárával együtt tárold a hűtőben, és 2–3 napon belül fogyaszd el vagy dolgozd fel.',
  },
  {
    id: 'dio',
    keywords: ['dio', 'hejas'],
    name: 'Dió',
    category: 'egyeb',
    short: 'Testes, olajos bél süteményekhez, salátákhoz és önmagában is.',
    long: 'A dió az ősz egyik legsokoldalúbb terméke: süteményekbe, bejglibe, salátákba, müzlibe vagy önmagában is kiváló. A friss dió héja ép, a bél világos és kellemes illatú.',
    variety: 'Chandler',
    origin: null,
    price: null,
    unit: null,
    priceDate: null,
    season: [9, 10],
    isNew: false,
    featured: false,
    image: 'assets/img/products/dio.webp',
    alt: 'Feltört Chandler dió világos béllel, egész diók között',
    storage: 'Héjában hűvös, száraz, szellős helyen hónapokig eláll. A kibontott diót légmentesen zárva, hűtőben tárold, hogy ne avasodjon.',
  },
];
