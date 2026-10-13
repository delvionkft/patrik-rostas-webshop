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
 *   varieties  – a gyümölcs fajtái: [{ name, image, alt }]. A gyümölcs aloldalán (gyumolcs.html#id)
 *                mindegyik saját képpel jelenik meg; image: null esetén „Fotó hamarosan” mező.
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
 *   hero       – (opcionális) az aloldal fejlécének fotómozaikja: legfeljebb 4 fajtanév; az első lesz a nagy kép.
 *                Ha nincs megadva, a borítókép és a fajták képei kerülnek bele.
 *   image, alt – a gyümölcs borítóképe a kártyán. Ha még nincs saját fotó: image: null (semleges „Fotó hamarosan” mező jelenik meg).
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
    hero: ['Rubinola', 'Golden Delicious', 'Idared', 'Téli arany parmen'],
    varieties: [
      { name: 'Jonagored', image: 'assets/img/products/alma.webp', alt: 'Piros Jonagored almák az ágon' },
      { name: 'Fehér Klára', image: 'assets/img/varieties/alma-feher-klara.webp', alt: 'Fehér Klára alma az ágon' },
      { name: 'Fuji', image: 'assets/img/varieties/alma-fuji.webp', alt: 'Fuji alma az ágon' },
      { name: 'Galarina', image: 'assets/img/varieties/alma-galarina.webp', alt: 'Galarina alma az ágon' },
      { name: 'Goldcats', image: 'assets/img/varieties/alma-goldcats.webp', alt: 'Goldcats alma az ágon' },
      { name: 'Golden Delicious', image: 'assets/img/varieties/alma-golden-delicious.webp', alt: 'Golden Delicious alma az ágon' },
      { name: 'Idared', image: 'assets/img/varieties/alma-idared.webp', alt: 'Idared alma az ágon' },
      { name: 'Jeromine', image: 'assets/img/varieties/alma-jeromine.webp', alt: 'Jeromine alma az ágon' },
      { name: 'Jonagold', image: 'assets/img/varieties/alma-jonagold.webp', alt: 'Jonagold alma az ágon' },
      { name: 'Jonathan Csány 1', image: 'assets/img/varieties/alma-jonathan-csany-1.webp', alt: 'Jonathan Csány 1 alma az ágon' },
      { name: 'Jonathan M41', image: 'assets/img/varieties/alma-jonathan-m41.webp', alt: 'Jonathan M41 alma az ágon' },
      { name: 'Kecskeméti vajalma', image: 'assets/img/varieties/alma-kecskemeti-vajalma.webp', alt: 'Kecskeméti vajalma alma az ágon' },
      { name: 'London pepin', image: 'assets/img/varieties/alma-london-pepin.webp', alt: 'London pepin alma az ágon' },
      { name: 'Luna', image: 'assets/img/varieties/alma-luna.webp', alt: 'Luna alma az ágon' },
      { name: 'Naményi Jonathán', image: 'assets/img/varieties/alma-namenyi-jonathan.webp', alt: 'Naményi Jonathán alma az ágon' },
      { name: 'Nyári fontos', image: 'assets/img/varieties/alma-nyari-fontos.webp', alt: 'Nyári fontos alma az ágon' },
      { name: 'Pomforyou Lancelot', image: 'assets/img/varieties/alma-pomforyou-lancelot.webp', alt: 'Pomforyou Lancelot alma az ágon' },
      { name: 'Red Idared', image: 'assets/img/varieties/alma-red-idared.webp', alt: 'Red Idared alma az ágon' },
      { name: 'Red Jonaprince', image: 'assets/img/varieties/alma-red-jonaprince.webp', alt: 'Red Jonaprince alma az ágon' },
      { name: 'Rubinola', image: 'assets/img/varieties/alma-rubinola.webp', alt: 'Rubinola alma az ágon' },
      { name: 'Téli arany parmen', image: 'assets/img/varieties/alma-teli-arany-parmen.webp', alt: 'Téli arany parmen alma az ágon' },
      { name: 'Watson Jonathan', image: 'assets/img/varieties/alma-watson-jonathan.webp', alt: 'Watson Jonathan alma az ágon' },
      { name: 'Éva', image: 'assets/img/varieties/alma-eva.webp', alt: 'Éva alma az ágon' },
    ],
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
    hero: ['Piros Vilmos', 'Nyári Kálmán', 'Clapp kedveltje', 'Bosc kobak'],
    varieties: [
      { name: 'Alexander Lucas', image: 'assets/img/varieties/korte-alexander-lucas.webp', alt: 'Alexander Lucas körték az ágon' },
      { name: 'Arabitka', image: 'assets/img/varieties/korte-arabitka.webp', alt: 'Arabitka körték az ágon' },
      { name: 'Avranchesi jó Lujza', image: 'assets/img/varieties/korte-avranchesi-jo-lujza.webp', alt: 'Avranchesi jó Lujza körték az ágon' },
      { name: 'Árpával érő', image: 'assets/img/varieties/korte-arpaval-ero.webp', alt: 'Árpával érő körték az ágon' },
      { name: 'Bosc kobak', image: 'assets/img/varieties/korte-bosc-kobak.webp', alt: 'Bosc kobak körték az ágon' },
      { name: 'Clapp kedveltje', image: 'assets/img/varieties/korte-clapp-kedveltje.webp', alt: 'Clapp kedveltje körték az ágon' },
      { name: 'Conference', image: 'assets/img/varieties/korte-conference.webp', alt: 'Conference körték az ágon' },
      { name: 'Császárkörte', image: 'assets/img/varieties/korte-csaszarkorte.webp', alt: 'Császárkörte gyümölcsök az ágon' },
      { name: 'Diel vajkörte', image: 'assets/img/varieties/korte-diel-vajkorte.webp', alt: 'Diel vajkörte gyümölcsök az ágon' },
      { name: 'Dr. Guyot Gyula', image: 'assets/img/varieties/korte-dr-guyot-gyula.webp', alt: 'Dr. Guyot Gyula körték az ágon' },
      { name: 'Hardenpont téli vajkörte', image: 'assets/img/varieties/korte-hardenpont-teli-vajkorte.webp', alt: 'Hardenpont téli vajkörte gyümölcsök az ágon' },
      { name: 'Ilonka', image: 'assets/img/varieties/korte-ilonka.webp', alt: 'Ilonka körték az ágon' },
      { name: 'Kieffer', image: 'assets/img/varieties/korte-kieffer.webp', alt: 'Kieffer körték az ágon' },
      { name: 'Kornélia', image: 'assets/img/varieties/korte-kornelia.webp', alt: 'Kornélia körték az ágon' },
      { name: 'Nyári Kálmán', image: 'assets/img/varieties/korte-nyari-kalman.webp', alt: 'Nyári Kálmán körték az ágon' },
      { name: 'Piros Vilmos', image: 'assets/img/varieties/korte-piros-vilmos.webp', alt: 'Piros Vilmos körték az ágon' },
      { name: 'Téli esperes', image: 'assets/img/varieties/korte-teli-esperes.webp', alt: 'Téli esperes körték az ágon' },
      { name: 'Vilmos', image: 'assets/img/products/korte.webp', alt: 'Sárgászöld Vilmos körték az ágon' },
    ],
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
    hero: ['Konstantinápolyi', 'Aromatnaja', 'Leskováci', 'Bereczki bőtermő'],
    varieties: [
      { name: 'Bereczki bőtermő', image: 'assets/img/products/birs.webp', alt: 'Sárga Bereczki bőtermő birsalmák a fán, zöld levelek között' },
      { name: 'Aromatnaja', image: 'assets/img/varieties/birs-aromatnaja.webp', alt: 'Aromatnaja birsalma az ágon' },
      { name: 'Champion', image: 'assets/img/varieties/birs-champion.webp', alt: 'Champion birsalma az ágon' },
      { name: 'Konstantinápolyi', image: 'assets/img/varieties/birs-konstantinapolyi.webp', alt: 'Konstantinápolyi birsalma az ágon' },
      { name: 'Leskováci', image: 'assets/img/varieties/birs-leskovaci.webp', alt: 'Leskováci birsalma az ágon' },
      { name: 'Mezőtúri', image: 'assets/img/varieties/birs-mezoturi.webp', alt: 'Mezőtúri birsalma az ágon' },
      { name: 'Vranja', image: 'assets/img/varieties/birs-vranja.webp', alt: 'Vranja birsalma az ágon' },
    ],
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
  {
    id: 'naspolya',
    keywords: ['naspolya', 'lasponya'],
    name: 'Naspolya',
    category: 'almafele',
    short: 'Különleges késő őszi gyümölcs, amely utóérés után válik édessé és krémessé.',
    long: 'A naspolya szedéskor kemény és fanyar. Néhány hét pihentetés (utóérés) vagy az első fagyok után a húsa megbarnul, megpuhul, és édes, enyhén borízű, almaszószra emlékeztető ízt kap. Nyersen kikanalazva, lekvárnak, zselének vagy süteménybe is kiváló.',
    origin: null,
    price: null,
    unit: null,
    priceDate: null,
    season: [10, 11],
    isNew: false,
    featured: false,
    image: 'assets/img/varieties/naspolya-macrocarpa.webp',
    alt: 'Érett, barna Macrocarpa naspolyák az ágon',
    storage: 'Hűvös, szellős helyen, egy rétegben elterítve érleld, amíg a gyümölcs megbarnul és megpuhul. Az érett naspolyát néhány napon belül fogyaszd el vagy dolgozd fel.',
    hero: ['Macrocarpa', 'Royal', 'Nottingham'],
    varieties: [
      { name: 'Macrocarpa', image: 'assets/img/varieties/naspolya-macrocarpa.webp', alt: 'Macrocarpa naspolyák az ágon, levelek között' },
      { name: 'Nottingham', image: 'assets/img/varieties/naspolya-nottingham.webp', alt: 'Nottingham naspolyák az ágon, levelek között' },
      { name: 'Royal', image: 'assets/img/varieties/naspolya-royal.webp', alt: 'Royal naspolyák az ágon, levelek között' },
    ],
  },


  // --- Egyéb gyümölcsök ---------------------------------------------------
  {
    id: 'oszibarack',
    keywords: ['barack'],
    name: 'Őszibarack',
    category: 'egyeb',
    short: 'Bársonyos héjú, édes és lédús nyári gyümölcs.',
    long: 'Az érett őszibarack illatos, lédús és édes. Magában, gyümölcssalátában, pitében vagy grillezve is kiváló. Az érett gyümölcs enyhe nyomásra kissé enged.',
    varieties: [
      { name: 'Dixired', image: 'assets/img/products/oszibarack.webp', alt: 'Érett, pirosas Dixired őszibarackok a fán' },
    ],
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
    varieties: [
      { name: 'Harcot', image: 'assets/img/products/sargabarack.webp', alt: 'Narancssárga Harcot kajszibarackok az ágon' },
    ],
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
    varieties: [
      { name: 'Debreceni muskotály', image: null, alt: '' },
    ],
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
    varieties: [
      { name: 'Katalin', image: 'assets/img/products/cseresznye.webp', alt: 'Sötétpiros Katalin cseresznyék fürtben az ágon' },
    ],
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
    varieties: [
      { name: 'Érdi nagygyümölcsű', image: 'assets/img/products/meggy.webp', alt: 'Sötétpiros Érdi nagygyümölcsű meggyszemek fürtben az ágon' },
    ],
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
    hero: ['Pedro', 'Milotai 10', 'Chandler', 'Fernette'],
    varieties: [
      { name: 'Chandler', image: 'assets/img/products/dio.webp', alt: 'Feltört Chandler dió világos béllel, egész diók között' },
      { name: 'Alsószentiváni 117', image: 'assets/img/varieties/dio-alsoszentivani-117.webp', alt: 'Alsószentiváni 117 dió héjában' },
      { name: 'Fernette', image: 'assets/img/varieties/dio-fernette.webp', alt: 'Fernette dió héjában' },
      { name: 'Milotai 10', image: 'assets/img/varieties/dio-milotai-10.webp', alt: 'Milotai 10 dió héjában' },
      { name: 'Pedro', image: 'assets/img/varieties/dio-pedro.webp', alt: 'Pedro dió héjában' },
      { name: 'Tiszacsécsi 83', image: null, alt: '' },
    ],
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
