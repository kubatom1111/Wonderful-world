import { StoryNode } from "../types";

// --- OFFLINE STORY ENGINE ---

// Pre-written branching narrative tree
const STORY_TREE: Record<string, StoryNode> = {
  intro: {
    text: "A fékcsikorgás emléke lassan elhalványul. Nem érzel fájdalmat, csak végtelen csendet. Kinyitod a szemed, de nem a kórházi mennyezetet látod, hanem egy örvénylő, sötét csillagködöt. Egyedül vagy a semmiben. A tested súlytalan, mintha vízben lebegnél.",
    choices: [
      { id: "forest_start", text: "Kiáltok a sötétségbe!" },
      { id: "ruins_start", text: "Csendben várok és figyelek." },
    ],
    imagePrompt: "void",
    hpChange: 0,
    manaChange: 0
  },
  
  // Ág A: Erdő (Agresszív kezdés)
  forest_start: {
    text: "A kiáltásod visszhangzik a semmiben, majd hirtelen zuhanni kezdesz. Puffanva érsz földet egy sűrű, ködös erdő aljnövényzetében. A fák feketék és göcsörtösek, az égboltot pedig nem látni a sűrű lombkoronától. Valami mozog a bokrok között.",
    choices: [
      { id: "wolf_encounter", text: "Fegyvert keresek és felkészülök." },
      { id: "climb_tree", text: "Felmászom egy fára biztonságba." }
    ],
    imagePrompt: "forest",
    hpChange: -5,
    manaChange: 0
  },
  wolf_encounter: {
    text: "Egy hatalmas, árnyékból szőtt farkas lép elő a ködből. A szemei vörösen izzanak. Nem támad azonnal, csak morog, mintha tesztelné a bátorságodat. A kezed ügyébe akad egy éles kő.",
    choices: [
      { id: "wolf_fight", text: "Rátámadok a kővel!" },
      { id: "wolf_tame", text: "Próbálom megszelídíteni mágiával." }
    ],
    imagePrompt: "wolf",
    hpChange: 0,
    manaChange: 0
  },
  climb_tree: {
    text: "Felhúzod magad az egyik göcsörtös ágra. A magasból látod, hogy egy farkas szaglássza végig a helyet, ahol az imént voltál, majd elüget. A távolban egy romos torony körvonalai rajzolódnak ki.",
    choices: [
      { id: "tower_approach", text: "Elindulok a torony felé." },
      { id: "forest_sleep", text: "Megpihenek az ágon reggelig." }
    ],
    imagePrompt: "forest",
    hpChange: 0,
    manaChange: 5
  },
  wolf_fight: {
    text: "A farkas gyorsabb nálad. A karmaiba szaladsz, de sikerül megütnöd a fejét a kővel. Az árnyékfenevad üvöltve szertefoszlik fekete füstté, de a karod csúnyán vérzik.",
    choices: [
      { id: "tower_approach", text: "Tovább bicegek a torony felé." },
      { id: "healing_magic", text: "Megpróbálom begyógyítani a sebem." }
    ],
    imagePrompt: "fire",
    hpChange: -20,
    manaChange: 0
  },
  wolf_tame: {
    text: "Kinyújtod a kezed és a belső energiádra koncentrálsz. A farkas megérzi a benned rejlő erőt. Lehajtja a fejét, és hagyja, hogy megérintsd. Egy pillanatra eggyé váltok, majd a farkas eltűnik, de érzed, hogy az ereje egy része beléd szállt.",
    choices: [
      { id: "tower_approach", text: "Megerősödve indulok a torony felé." },
      { id: "forest_explore", text: "Körülnézek az erdő mélyén." }
    ],
    imagePrompt: "wolf",
    hpChange: 5,
    manaChange: -10
  },

  // Ág B: Romok (Passzív kezdés)
  ruins_start: {
    text: "A csendet lassan morajlás váltja fel. Finoman, mint egy tollpihe, ereszkedsz le egy hideg márványpadlóra. Egy ősi, elhagyatott templom romjai között vagy. A levegőben régi tömjén illata száll.",
    choices: [
      { id: "altar_search", text: "Megvizsgálom az oltárt." },
      { id: "ruins_exit", text: "Kimegyek a szabadba." }
    ],
    imagePrompt: "ruins",
    hpChange: 0,
    manaChange: 5
  },
  altar_search: {
    text: "Az oltáron egy poros, de sértetlen kristályüveg hever, benne vöröslő folyadékkal. Mellette egy régi, bőrkötésű könyv, aminek a betűit nem ismered, de furcsa módon mégis érted.",
    choices: [
      { id: "drink_potion", text: "Megiszom a folyadékot." },
      { id: "read_book", text: "Beleolvasok a könyvbe." }
    ],
    imagePrompt: "tavern", // Close enough logic
    hpChange: 0,
    manaChange: 0
  },
  drink_potion: {
    text: "A folyadék édes és égető. Érzed, ahogy az életenergia szétárad az ereidben. A sebeid (ha voltak) begyógyulnak, és az izmaid megtelnek erővel.",
    choices: [
      { id: "ruins_exit", text: "Most már készen állok kimenni." },
      { id: "meditate", text: "Meditálok az új erővel." }
    ],
    imagePrompt: "goddess",
    hpChange: 20,
    manaChange: 0
  },
  read_book: {
    text: "A könyv ősi varázslatokat tartalmaz. Ahogy olvasod, a szavak a fejedbe égnek. Megtanultál egy tűzlabda varázslatot, de a szellemi erőfeszítés kimerített.",
    choices: [
      { id: "ruins_exit", text: "Kipróbálom az erőt odakint." },
      { id: "rest_ruins", text: "Pihenek egyet a kövön." }
    ],
    imagePrompt: "city", // library feel
    hpChange: 0,
    manaChange: 20
  },
  ruins_exit: {
    text: "Kilépsz a romok közül. Előtted egy hatalmas völgy tárul el, a távolban egy lebegő várossal. A naplementében sárkányok sziluettjei köröznek az égen.",
    choices: [
      { id: "city_journey", text: "Elindulok a lebegő város felé." },
      { id: "valley_camp", text: "Tábort verek a völgyben." }
    ],
    imagePrompt: "city",
    hpChange: 0,
    manaChange: 0
  },

  // Konvergencia pontok (egyszerűsített)
  tower_approach: {
    text: "A toronyhoz érve látod, hogy az valójában egy ősi mágus lakhelye volt. Az ajtó nyitva áll.",
    choices: [
      { id: "enter_tower", text: "Belépek." },
      { id: "ruins_exit", text: "Inkább a völgy felé megyek." }
    ],
    imagePrompt: "city",
    hpChange: 0,
    manaChange: 0
  },
  enter_tower: {
    text: "VÉGE A DEMÓNAK. A kalandod itt véget ér ebben a verzióban. Köszönjük a játékot!",
    choices: [
      { id: "intro", text: "Újrakezdés" },
      { id: "intro", text: "Vissza az elejére" }
    ],
    imagePrompt: "void",
    hpChange: 0,
    manaChange: 0,
    gameOver: true
  },
  city_journey: {
    text: "VÉGE A DEMÓNAK. A kalandod itt véget ér ebben a verzióban. Köszönjük a játékot!",
    choices: [
      { id: "intro", text: "Újrakezdés" },
      { id: "intro", text: "Vissza az elejére" }
    ],
    imagePrompt: "void",
    hpChange: 0,
    manaChange: 0,
    gameOver: true
  },
  // Fallbacks
  forest_explore: { text: "Eltévedtél az erdőben...", choices: [{id: "forest_start", text: "Vissza"}], imagePrompt: "forest", hpChange: -5 },
  forest_sleep: { text: "Kipihenten ébredsz.", choices: [{id: "tower_approach", text: "Tovább"}], imagePrompt: "forest", hpChange: 10, manaChange: 10 },
  healing_magic: { text: "Sikerült begyógyítani a sebet.", choices: [{id: "tower_approach", text: "Tovább"}], imagePrompt: "goddess", hpChange: 10, manaChange: -10 },
  meditate: { text: "A meditáció feltölti a manádat.", choices: [{id: "ruins_exit", text: "Tovább"}], imagePrompt: "void", manaChange: 30 },
  rest_ruins: { text: "A hideg kövön alvás nem túl pihentető, de túlélted.", choices: [{id: "ruins_exit", text: "Tovább"}], imagePrompt: "ruins", hpChange: 5 }
};

export const getStoryNode = (nodeId: string): StoryNode => {
  const node = STORY_TREE[nodeId];
  if (!node) {
    // Fallback if ID is missing (should not happen in static tree)
    return {
      text: "A sors fonalai összekuszálódtak. (Hiba: Ismeretlen történet-szál)",
      choices: [{ id: "intro", text: "Visszatérés a kezdetekhez" }],
      imagePrompt: "void",
      hpChange: 0,
      manaChange: 0
    };
  }
  return node;
};

// --- CURATED IMAGE LIBRARY (NO AI GENERATION) ---
// High-quality Unsplash IDs to ensure consistent Dark Fantasy aesthetic
const IMAGE_LIBRARY: Record<string, string[]> = {
  void: [
    "photo-1534796636912-3b95b3ab5980", // Nebula
    "photo-1419242902214-272b3f66ee7a", // Dark Sky
    "photo-1610296669228-602fa827fc1f", // Galaxy
  ],
  forest: [
    "photo-1511497584788-876760111969", // Dark Forest
    "photo-1542273917363-3b1817f69a2d", // Foggy Woods
    "photo-1473448912268-2022ce9509d8", // Ancient Trees
  ],
  cave: [
    "photo-1504333638930-c8787321eee0", // Dark Cave
    "photo-1516934024742-b461fba47600", // Cave Light
    "photo-1596328906963-c35477c98030", // Dungeon feel
  ],
  city: [
    "photo-1599707367072-cd6ad66aa5a8", // Gothic Castle
    "photo-1533929736458-ca588d080e81", // Dark Alley
    "photo-1519074069444-1ba4fff66d16", // Fantasy City feel
  ],
  tavern: [
    "photo-1510812431401-41d2bd2722f3", // Wine/Dark
    "photo-1605218427368-35b861280387", // Candlelight
    "photo-1574096079513-d82599602956", // Inn atmosphere
  ],
  ruins: [
    "photo-1518709268805-4e9042af9f23", // Stone Ruins
    "photo-1461360228754-6e81c478b882", // Ancient Columns
  ],
  fire: [
    "photo-1486162928267-e6274cb310d7", // Bonfire
    "photo-1520186994231-6ea0019d8db2", // Dark Ember
  ],
  water: [
    "photo-1468581356527-ae0168019672", // Dark Ocean
    "photo-1551288049-bebda4e38f71", // Stormy Sea
  ],
  mountain: [
    "photo-1464822759023-fed622ff2c3b", // Dark Mountains
    "photo-1519681393784-d120267933ba", // Snowy Peaks
  ],
  wolf: [
    "photo-1589656966895-2f33e7653819", // Wolf eyes
    "photo-1474511320723-9a56873867b5", // Wolf in forest
  ],
  goddess: [
    "photo-1500964757637-c85e8a162699", // Mystic Landscape
  ]
};

const DEFAULT_IMAGES = [
  "photo-1500964757637-c85e8a162699", // Abstract Landscape
  "photo-1518066000714-58c45f1a2c0a", // Mist
];

export const generateSceneImage = async (prompt: string): Promise<string> => {
  const p = prompt.toLowerCase();
  
  // Find category based on keyword
  let category = 'default';
  if (p.includes('void') || p.includes('space') || p.includes('star')) category = 'void';
  else if (p.includes('forest') || p.includes('tree') || p.includes('wood')) category = 'forest';
  else if (p.includes('cave') || p.includes('dungeon') || p.includes('under')) category = 'cave';
  else if (p.includes('city') || p.includes('castle') || p.includes('town')) category = 'city';
  else if (p.includes('tavern') || p.includes('inn') || p.includes('bar')) category = 'tavern';
  else if (p.includes('ruin') || p.includes('ancient')) category = 'ruins';
  else if (p.includes('fire') || p.includes('burn') || p.includes('hell')) category = 'fire';
  else if (p.includes('water') || p.includes('sea') || p.includes('lake')) category = 'water';
  else if (p.includes('mountain') || p.includes('hill')) category = 'mountain';
  else if (p.includes('wolf') || p.includes('beast')) category = 'wolf';
  else if (p.includes('goddess') || p.includes('divine')) category = 'goddess';

  const collection = IMAGE_LIBRARY[category] || DEFAULT_IMAGES;
  
  // Pick a random image from the collection
  const imageId = collection[Math.floor(Math.random() * collection.length)];
  
  // Return optimized Unsplash URL
  return `https://images.unsplash.com/${imageId}?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80`;
};