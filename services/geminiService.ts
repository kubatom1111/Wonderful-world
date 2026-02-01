import { StoryNode, Item, StatusEffect } from "../types";

// --- ITEM DATABASE ---
export const ITEM_REGISTRY: Record<string, Item> = {
  'rusty_dagger': {
    id: 'rusty_dagger',
    name: 'Rozsdás Tőr',
    type: 'weapon',
    description: 'Régi, de éles. Jobb, mint a puszta kéz.',
    icon: '🗡️'
  },
  'hunting_bow': {
    id: 'hunting_bow',
    name: 'Vadászíj',
    type: 'weapon',
    description: 'Rugalmas tiszafa, ideális csendes vadászathoz.',
    icon: '🏹'
  },
  'magic_wand': {
    id: 'magic_wand',
    name: 'Tanonc Pálca',
    type: 'weapon',
    description: 'Recsegő fából készült, de van benne mana.',
    icon: '🪄'
  },
  'health_potion': {
    id: 'health_potion',
    name: 'Gyógyfőzet',
    type: 'consumable',
    description: 'Pirosas folyadék, kámfor illatú.',
    icon: '🍷'
  },
  'ancient_shield': {
    id: 'ancient_shield',
    name: 'Lovagi Pajzs',
    type: 'armor',
    description: 'A birodalom címerét viseli, bár kopott.',
    icon: '🛡️'
  },
  'shadow_cloak': {
    id: 'shadow_cloak',
    name: 'Árnyköpeny',
    type: 'armor',
    description: 'Segít beleolvadni a környezetedbe.',
    icon: '🧥'
  },
  'dragon_scale': {
    id: 'dragon_scale',
    name: 'Sárkánypikkely',
    type: 'key',
    description: 'Izzik a melegségtől. Hatalmas varázserő.',
    icon: '🐲'
  },
  'map': {
    id: 'map',
    name: 'Titkos Térkép',
    type: 'key',
    description: 'Az Alváros járatait mutatja.',
    icon: '🗺️'
  }
};

export const getItem = (id: string): Item | undefined => ITEM_REGISTRY[id];

// --- STATUS EFFECT DATABASE ---
export const EFFECT_REGISTRY: Record<string, StatusEffect> = {
  'bleeding': {
    id: 'bleeding',
    name: 'Vérzés',
    type: 'debuff',
    description: 'A nyílt seb folyamatosan gyengít.',
    icon: '🩸',
    duration: 3,
    hpPerTurn: -8
  },
  'regeneration': {
    id: 'regeneration',
    name: 'Regeneráció',
    type: 'buff',
    description: 'A szent víz gyógyítja a sebeidet.',
    icon: '🌿',
    duration: 4,
    hpPerTurn: 10
  },
  'curse': {
    id: 'curse',
    name: 'Átok',
    type: 'debuff',
    description: 'A sötét mágia elszívja az erődet.',
    icon: '☠️',
    duration: 5,
    manaPerTurn: -10
  },
  'clarity': {
    id: 'clarity',
    name: 'Tisztánlátás',
    type: 'buff',
    description: 'Az elme éles, a mana gyorsan visszatér.',
    icon: '✨',
    duration: 5,
    manaPerTurn: 10
  }
};

export const getEffect = (id: string): StatusEffect | undefined => {
    const effect = EFFECT_REGISTRY[id];
    return effect ? { ...effect } : undefined; // Return copy to avoid mutating base registry
};


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
    text: "A kiáltásod visszhangzik a semmiben, majd hirtelen zuhanni kezdesz. Puffanva érsz földet egy sűrű, ködös erdő aljnövényzetében. A fák feketék és göcsörtösek. A lábad előtt megcsillan valami a sárban: egy elhagyott tőr.",
    choices: [
      { id: "wolf_encounter", text: "Felveszem és körülnézek." },
      { id: "climb_tree", text: "Hagyom a fegyvert, felmászom egy fára." }
    ],
    imagePrompt: "forest",
    hpChange: -5,
    manaChange: 0,
    loot: ['rusty_dagger'] 
  },
  wolf_encounter: {
    text: "Egy hatalmas, árnyékból szőtt farkas lép elő a ködből. A szemei vörösen izzanak. Nem támad azonnal, csak morog, mintha tesztelné a bátorságodat.",
    choices: [
      { id: "wolf_fight", text: "Rátámadok a fegyverrel!" },
      { id: "wolf_tame", text: "Próbálom megszelídíteni mágiával." }
    ],
    imagePrompt: "wolf",
    hpChange: 0,
    manaChange: 0
  },
  climb_tree: {
    text: "Felhúzod magad az egyik göcsörtös ágra. A magasból látod, hogy egy farkas szaglássza végig a helyet. A lombok között, egy elhagyott vadászles maradványain találsz egy íjat.",
    choices: [
      { id: "tower_approach", text: "Elindulok a torony felé." },
      { id: "forest_sleep", text: "Megpihenek az ágon reggelig." }
    ],
    imagePrompt: "forest",
    hpChange: 0,
    manaChange: 5,
    loot: ['hunting_bow']
  },
  wolf_fight: {
    text: "A farkas gyorsabb nálad. A karmaiba szaladsz, de sikerül megütnöd a fejét. Az árnyékfenevad üvöltve szertefoszlik fekete füstté, de a karod csúnyán vérzik. Érzed, hogy a seb nem akar begyógyulni.",
    choices: [
      { id: "tower_approach", text: "Tovább bicegek a torony felé." },
      { id: "healing_magic", text: "Megpróbálom begyógyítani a sebem." }
    ],
    imagePrompt: "fire",
    hpChange: -10,
    manaChange: 0,
    addEffects: ['bleeding'] // Adds bleed effect
  },
  wolf_tame: {
    text: "Kinyújtod a kezed és a belső energiádra koncentrálsz. A farkas megérzi a benned rejlő erőt. Lehajtja a fejét, és hagyja, hogy megérintsd. Egy pillanatra eggyé váltok, majd a farkas eltűnik, de érzed, hogy az ereje egy része beléd szállt.",
    choices: [
      { id: "tower_approach", text: "Megerősödve indulok a torony felé." },
      { id: "forest_explore", text: "Körülnézek az erdő mélyén." }
    ],
    imagePrompt: "wolf",
    hpChange: 5,
    manaChange: -10,
    addEffects: ['clarity'] // Buff
  },

  // ÚJ ÁG: Barlangrendszer (Az erdőből nyílik)
  forest_explore: {
    text: "Ahogy mélyebbre hatolsz a sűrűben, a talaj lejteni kezd. Egy mohával benőtt, sötét barlangszáj tátong előtted, amelyből hűvös, dohos levegő árad. Valami kékesen dereng odabent.",
    choices: [
      { id: "cave_entrance", text: "Belépek a barlangba." },
      { id: "tower_approach", text: "Inkább a torony felé veszem az irányt." }
    ],
    imagePrompt: "cave",
    hpChange: 0,
    manaChange: 0
  },
  cave_entrance: {
    text: "A barlang falait foszforeszkáló gombák világítják meg. A járat egy hatalmas földalatti csarnokba torkollik, ahol egy fekete vizű tó terül el. A tó közepén egy sziget van, rajta egy karddal.",
    choices: [
      { id: "underground_lake", text: "Átúszom a szigetre." },
      { id: "drink_cave_water", text: "Iszom a fénylő vízből." }
    ],
    imagePrompt: "water",
    hpChange: 0,
    manaChange: 5
  },
  underground_lake: {
    text: "A víz jéghideg, de frissítő. Ahogy partot érsz a szigeten, látod, hogy a kard rozsdás, de a markolatában egy hatalmas rubin izzik. Amikor megérinted, a rubin porrá válik és beléd száll.",
    choices: [
      { id: "ruins_exit", text: "Kivezető utat keresek a felszínre." },
      { id: "meditate", text: "Megpihenek a szigeten." }
    ],
    imagePrompt: "cave",
    hpChange: -5,
    manaChange: 50
  },
  drink_cave_water: {
    text: "A víz íze fémes és édes. Ahogy lenyeled, látomásod támad: látod a Lebegő Várost lángokban állni. Amikor feleszmélsz, erősebbnek érzed magad. A tested bizsereg.",
    choices: [
      { id: "ruins_exit", text: "A felszínre sietek." },
      { id: "cave_entrance", text: "Visszafordulok az erdőbe." }
    ],
    imagePrompt: "goddess",
    hpChange: 15,
    manaChange: 15,
    addEffects: ['regeneration'] // Buff
  },

  // Ág B: Romok (Passzív kezdés)
  ruins_start: {
    text: "A csendet lassan morajlás váltja fel. Finoman, mint egy tollpihe, ereszkedsz le egy hideg márványpadlóra. Egy ősi, elhagyatott templom romjai között vagy. Az oltáron egy poros varázskönyv és egy pálca hever.",
    choices: [
      { id: "altar_search", text: "Elveszem a pálcát és a könyvet." },
      { id: "ruins_exit", text: "Kimegyek a szabadba." }
    ],
    imagePrompt: "ruins",
    hpChange: 0,
    manaChange: 5,
    loot: ['magic_wand']
  },
  altar_search: {
    text: "A pálca bizsergetni kezdi a tenyered. A könyv ősi varázslatokat tartalmaz. Ahogy beleolvasol, a szavak a fejedbe égnek.",
    choices: [
      { id: "drink_potion", text: "Keresek még valamit." },
      { id: "read_book", text: "Elmélyedek a tanulásban." }
    ],
    imagePrompt: "tavern", 
    hpChange: 0,
    manaChange: 0
  },
  drink_potion: {
    text: "Találsz egy elrejtett rekeszt, benne egy ősi pajzzsal és egy üvegcsével. A folyadék édes és égető.",
    choices: [
      { id: "ruins_exit", text: "Most már készen állok kimenni." },
      { id: "meditate", text: "Meditálok az új erővel." }
    ],
    imagePrompt: "goddess",
    hpChange: 20,
    manaChange: 0,
    loot: ['ancient_shield', 'health_potion']
  },
  read_book: {
    text: "A könyv ősi varázslatokat tartalmaz. Megtanultál egy tűzlabda varázslatot, de a szellemi erőfeszítés kimerített.",
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
  valley_camp: {
      text: "Tüzet raksz és az eget kémleled. A csillagok itt máshogy állnak. Az éjszaka nyugodt, de álmomban egy suttogó hang hívogat a város felé.",
      choices: [
          { id: "city_journey", text: "Reggel indulás a városba." },
          { id: "tower_approach", text: "Inkább a közeli tornyot nézem meg." }
      ],
      imagePrompt: "fire",
      hpChange: 10,
      manaChange: 10
  },

  // Konvergencia és Bővítés 1: MÁGUS TORONY
  tower_approach: {
    text: "A toronyhoz érve látod, hogy az valójában egy ősi mágus lakhelye volt. A kapu nyitva áll, de a bentről áradó sötétség baljós.",
    choices: [
      { id: "enter_tower", text: "Belépek a sötétségbe." },
      { id: "ruins_exit", text: "Túl veszélyes, visszafordulok." }
    ],
    imagePrompt: "ruins",
    hpChange: 0,
    manaChange: 0
  },
  enter_tower: {
    text: "A torony belseje sokkal nagyobbnak tűnik, mint kívülről. Végtelennek tűnő csigalépcső vezet felfelé, lefelé pedig egy pincelabirintus. Egy lebegő fénygömb jelenik meg előtted.",
    choices: [
      { id: "tower_library", text: "Felmegyek a lépcsőn." },
      { id: "tower_dungeon", text: "Leereszkedem a mélybe." }
    ],
    imagePrompt: "city", // Indoor architecture
    hpChange: 0,
    manaChange: 0
  },
  tower_library: {
      text: "Egy hatalmas kör alakú könyvtárba érsz. A könyvek maguktól repkednek a polcok között. A terem közepén egy Árnyékkonstrukt őrzi a főpultot. Észrevesz.",
      choices: [
          { id: "shadow_fight", text: "Harcolok a lénnyel!" },
          { id: "shadow_riddle", text: "Megpróbálok beszélni vele." }
      ],
      imagePrompt: "city",
      hpChange: 0,
      manaChange: 0
  },
  shadow_fight: {
      text: "A lény testetlen csápokkal támad. A mágiád alig sebzi, de sikerül felborítanod egy könyvespolcot, ami maga alá temeti. Zihálva kutatsz át a maradványait. A harc során furcsa átok szállt rád.",
      choices: [
          { id: "city_journey", text: "Kimenekülök az ablakon át." },
          { id: "read_book", text: "Gyorsan elolvasok egy könyvet." }
      ],
      imagePrompt: "fire",
      hpChange: -25,
      manaChange: -10,
      addEffects: ['curse']
  },
  shadow_riddle: {
      text: "'Mi az, ami reggel négy lábon jár, délben kettőn, este háromon?' - kérdezi a lény gépies hangon. Ez túl egyszerű.",
      choices: [
          { id: "riddle_human", text: "'Az ember', válaszolod." },
          { id: "riddle_monster", text: "'Te, ha letépem a lábad', feleled." }
      ],
      imagePrompt: "void",
      hpChange: 0,
      manaChange: 0
  },
  riddle_human: {
      text: "A lény meghajol és félreáll. A pulton egy térképet találsz, ami egy titkos bejáratot mutat a Lebegő Városba.",
      choices: [
          { id: "city_journey", text: "A térkép segítségével indulok." },
          { id: "meditate", text: "Pihenek a könyvtár békéjében." }
      ],
      imagePrompt: "city",
      hpChange: 0,
      manaChange: 20,
      loot: ['map']
  },
  tower_dungeon: {
      text: "A pince nyirkos és sötét. Ketrecek sorakoznak a falak mentén. A levegőben sűrű, fojtogató mágia terjeng.",
      choices: [
          { id: "open_cage", text: "Kinyitom a ketrecet." },
          { id: "ignore_cage", text: "Továbbmegyek." }
      ],
      imagePrompt: "cave",
      hpChange: 0,
      manaChange: 0,
      addEffects: ['curse']
  },

  // Konvergencia és Bővítés 2: LEBEGŐ VÁROS ÉS BŐVÍTÉS
  city_journey: {
    text: "Hosszú út után eléred a szakadék szélét. Egy vékony, szélfútta kőhíd vezet át a lebegő szigetre. A kapuban páncélos őrök állják utadat.",
    choices: [
      { id: "city_gate_fight", text: "Áttörök rajtuk!" },
      { id: "city_gate_bribe", text: "Megpróbálom megvesztegetni őket." }
    ],
    imagePrompt: "city",
    hpChange: -5,
    manaChange: 0
  },
  city_gate_fight: {
      text: "Az őrök képzettek, de a váratlan támadásod meglepi őket. Sikerül besurrannod a kapun, de egy nyílvessző súrolja a vállad.",
      choices: [
          { id: "city_market", text: "Eltűnök a tömegben a piacon." },
          { id: "sky_tavern", text: "Egy sikátorba menekülök." }
      ],
      imagePrompt: "fire",
      hpChange: -15,
      manaChange: -5
  },
  city_gate_bribe: {
      text: "Nincs pénzed, de felajánlasz nekik egy kis mágikus bemutatót. Az őrök lenyűgözve tapsolnak, és átengednek.",
      choices: [
          { id: "city_market", text: "Irány a piac!" },
          { id: "sky_tavern", text: "Megkeresem a kocsmát." }
      ],
      imagePrompt: "city",
      hpChange: 0,
      manaChange: -10
  },
  city_market: {
      text: "A piactér kavargó forgatag. Különös lények árulnak sárkánypikkelyeket, varázitalokat és ismeretlen gyümölcsöket. Az illatok bódítóak.",
      choices: [
          { id: "buy_supplies", text: "Ellátmányt lopok." },
          { id: "listen_rumors", text: "Híreket hallgatok." }
      ],
      imagePrompt: "tavern",
      hpChange: 0,
      manaChange: 0
  },
  
  // --- ÚJ KIBŐVÍTETT ÁGAK: LÉGHAJÓK, ALVÁROS ÉS SÁRKÁNYOK ---
  
  buy_supplies: {
      text: "A kereskedő észrevesz és 'Tolvajt!' kiált. Páncélos őrök rontanak elő a tömegből. Nincs sok időd gondolkodni.",
      choices: [
          { id: "rooftop_run", text: "Menekülés a tetőkön át!" },
          { id: "surrender_guard", text: "Megadom magam." }
      ],
      imagePrompt: "city",
      hpChange: 0,
      manaChange: 0
  },
  surrender_guard: {
      text: "Az őrök lefogna és a börtönbe vetnek. A cellád mélyén egy öreg mágus a szobatársad, aki tanít egy titkos alagútról.",
      choices: [
          { id: "tower_dungeon", text: "Megkeresem az alagutat." },
          { id: "wait_rot", text: "Várok a soromra." }
      ],
      imagePrompt: "ruins",
      hpChange: -10,
      manaChange: 10
  },
  wait_rot: {
     text: "Évek telnek el. A történeted itt ér véget, elfeledve. (GAME OVER)",
     choices: [{id: 'intro', text: "Újrakezdés"}],
     imagePrompt: "void",
     gameOver: true
  },
  rooftop_run: {
      text: "Felmászol egy stand tetejére, onnan egy erkélyre. Menekülés közben felkapsz egy kötélen száradó sötét köpenyt. A tetőkön ugrálsz, alattad a szédítő mélység. Egy kereskedő léghajó halad el alattad.",
      choices: [
          { id: "jump_airship", text: "Ugrás a léghajóra!" },
          { id: "sewer_dive", text: "Le a csatornába!" }
      ],
      imagePrompt: "city",
      hpChange: -5,
      manaChange: 0,
      loot: ['shadow_cloak']
  },
  
  // Alváros Ág
  sewer_dive: {
      text: "Büdös, sötét, de biztonságos. A Lebegő Város szennyvízrendszere, az 'Alváros' fogad be. Itt a törvény nem érvényes, csak az erő.",
      choices: [
          { id: "black_market", text: "Megkeresem a Feketepiacot." },
          { id: "cultist_gathering", text: "Kántálást hallok..." }
      ],
      imagePrompt: "cave",
      hpChange: -5,
      manaChange: 0
  },
  black_market: {
      text: "Lila fáklyák világítják meg a földalatti piacteret. Egy csuklyás alak sárkánytojást kínál, egy másik tiltott tekercseket.",
      choices: [
          { id: "buy_scroll", text: "Veszek egy tekercset (Mana)." },
          { id: "steal_egg", text: "Ellopom a tojást." }
      ],
      imagePrompt: "tavern",
      hpChange: 0,
      manaChange: 0
  },
  buy_scroll: {
      text: "A tekercs tudása égeti az elmédet. Megtanulod az 'Armageddon' varázslatot, amivel te leszel az Alváros rettegett ura. GYŐZELEM.",
      choices: [{id: 'intro', text: "Új játék"}],
      imagePrompt: "fire",
      gameOver: true
  },
  steal_egg: {
      text: "A tojás forró a kezedben. Kirohansz vele a csatornából egyenesen a pusztaságba. A tojás megreped, és egy kissárkány bújik ki. Mostantól te vagy a Sárkányok Anyja/Apja. GYŐZELEM.",
      choices: [{id: 'intro', text: "Új játék"}],
      imagePrompt: "wolf", // Creature vibe
      gameOver: true,
      loot: ['dragon_scale']
  },
  cultist_gathering: {
      text: "Egy sötét istent idéznek. Észrevesznek. 'Tökéletes áldozat!' - kiáltják. Nincs menekvés. (GAME OVER)",
      choices: [{id: 'intro', text: "Újrakezdés"}],
      imagePrompt: "ruins",
      gameOver: true
  },

  // Léghajó Ág
  jump_airship: {
      text: "Zuhanás... majd puffanás. A 'Vándorló Szél' nevű hajó fedélzetén landolsz. A legénység fegyvert ránt, de a kapitány, egy félszemű elf, int nekik.",
      choices: [
          { id: "talk_captain", text: "Munkát ajánlok az útért." },
          { id: "cast_wind", text: "Szélmágiával bizonyítok." }
      ],
      imagePrompt: "void",
      hpChange: -5,
      manaChange: 0
  },
  talk_captain: {
      text: "'Bátor bolond vagy' - vigyorog a kapitány. 'Épp a Sárkány-csúcsok felé tartunk. Ha bírod a hideget, maradhatsz.'",
      choices: [
          { id: "dragon_peaks_arrival", text: "Velük tartok a hegyekbe." },
          { id: "mutiny", text: "Inkább átveszem a hajót." }
      ],
      imagePrompt: "mountain",
      hpChange: 0,
      manaChange: 0
  },
  cast_wind: {
      text: "Megidézed a szeleket, felgyorsítva a hajót. A legénység ujjong. A kapitány tisztelettel bólint. 'Varázsló a fedélzeten! Irány a Kristály-sziget!'",
      choices: [
           { id: "crystal_island", text: "Irány a sziget!" },
           { id: "demand_gold", text: "Aranyat követelek." }
      ],
      imagePrompt: "water",
      hpChange: 0,
      manaChange: -20
  },
  mutiny: {
      text: "A legénység kinevet, majd egyszerűen kidobnak a hajóról a felhők közé. Zuhanás... (GAME OVER)",
      choices: [{id: 'intro', text: "Újrakezdés"}],
      imagePrompt: "void",
      gameOver: true
  },
  demand_gold: {
      text: "A kapitány nem tűri a zsarolást. Fegyvert ránt és lelő, mielőtt varázsolhatnál. (GAME OVER)",
      choices: [{id: 'intro', text: "Újrakezdés"}],
      imagePrompt: "fire",
      gameOver: true
  },
  crystal_island: {
      text: "A sziget tisztán kristályból van és lebeg az égen. A mágiád itt végtelen. Eggyé válsz a szigettel, te leszel az új Isten. GYŐZELEM.",
      choices: [{id: 'intro', text: "Új játék"}],
      imagePrompt: "goddess",
      gameOver: true
  },
  
  // Sárkány-csúcsok Ág
  dragon_peaks_arrival: {
      text: "A hajó kiköt a legmagasabb hegycsúcson. Hó és jég mindenütt. Előtted egy hatalmas barlang, amit sárkánytűz feketített be.",
      choices: [
          { id: "enter_dragon_cave", text: "Belépek a barlangba." },
          { id: "search_ice_flower", text: "Jégvirágot keresek a sziklákon." }
      ],
      imagePrompt: "mountain",
      hpChange: 0,
      manaChange: 0
  },
  enter_dragon_cave: {
      text: "A sárkány alszik, hatalmas kincshalmon. Egyetlen pikkelye többet ér, mint az életed, de a lehelete halálos.",
      choices: [
          { id: "steal_scale", text: "Ellopok egy pikkelyt." },
          { id: "worship_dragon", text: "Imádkozom hozzá." }
      ],
      imagePrompt: "cave",
      hpChange: 0,
      manaChange: 0
  },
  steal_scale: {
      text: "Sikerül! De a sárkány egyik szeme kinyílik. Futás! Leugrasz a hegyről, és a zuhanás közben rájössz, hogy a pikkely varázsereje szárnyakat ad. Szabad vagy! GYŐZELEM.",
      choices: [{id: 'intro', text: "Új játék"}],
      imagePrompt: "void",
      gameOver: true,
      loot: ['dragon_scale']
  },
  worship_dragon: {
      text: "A sárkányt nem hatja meg az imádásod. Egyetlen lángcsóvával hamuvá tesz. (GAME OVER)",
      choices: [{id: 'intro', text: "Újrakezdés"}],
      imagePrompt: "fire",
      gameOver: true
  },
  search_ice_flower: {
      text: "Megtalálod a legendás Jégvirágot a szirten. Aki megeszi, örök életet nyer, de lassan jégszoborrá válik. Ezt választod. GYŐZELEM (vagy átok?).",
      choices: [{id: 'intro', text: "Új játék"}],
      imagePrompt: "mountain",
      gameOver: true
  },

  listen_rumors: {
      text: "A piacon suttogják, hogy a Király valójában egy sárkány, és a 'Vándorló Szél' léghajó ma indul a csúcsokhoz.",
      choices: [
          {id: "sky_tavern", text: "Kocsmázni megyek"},
          {id: "jump_airship", text: "Megkeresem a léghajót"}
      ],
      imagePrompt: "city",
      hpChange: 0,
      manaChange: 5
  },
  sky_tavern: {
      text: "Az 'Égi Kancsó' kocsma tele van kalandorokkal. A csapos egy négykezű óriás. A sarokban egy köpenyes alak téged figyel.",
      choices: [
          { id: "talk_stranger", text: "Odamegyek az alakhoz." },
          { id: "order_drink", text: "Iszom valamit." }
      ],
      imagePrompt: "tavern",
      hpChange: 0,
      manaChange: 0
  },

  // ENDINGS (Old)
  talk_stranger: {
      text: "Az alak leveszi csuklyáját. Te vagy az, de öregebben. 'Már vártalak' - mondja, és átnyújt egy gömböt, amiben a saját világod látszik. VÉGE AZ ELSŐ FEJEZETNEK.",
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
  forest_sleep: { text: "Kipihenten ébredsz.", choices: [{id: "tower_approach", text: "Tovább"}], imagePrompt: "forest", hpChange: 10, manaChange: 10 },
  healing_magic: { text: "Sikerült begyógyítani a sebet.", choices: [{id: "tower_approach", text: "Tovább"}], imagePrompt: "goddess", hpChange: 10, manaChange: -10 },
  meditate: { text: "A meditáció feltölti a manádat és megnyugtatja a lelked.", choices: [{id: "ruins_exit", text: "Tovább"}], imagePrompt: "void", hpChange: 5, manaChange: 30 },
  rest_ruins: { text: "A hideg kövön alvás nem túl pihentető, de túlélted.", choices: [{id: "ruins_exit", text: "Tovább"}], imagePrompt: "ruins", hpChange: 5 },
  riddle_monster: { text: "A lény megzavarodik a választól, szikrákat szór, majd leáll. Szabad az út.", choices: [{id: "city_journey", text: "Tovább"}], imagePrompt: "ruins", hpChange: 0, manaChange: 0 },
  open_cage: { text: "Egy kis tündér repül ki a ketrecből. Hálából meggyógyít, majd eltűnik a falon át.", choices: [{id: "tower_library", text: "Vissza fel"}], imagePrompt: "goddess", hpChange: 20, manaChange: 20 },
  ignore_cage: { text: "A lelkiismereted furdal, de sietned kell. Visszatérsz a lépcsőházba.", choices: [{id: "tower_library", text: "Fel a könyvtárba"}], imagePrompt: "cave", hpChange: 0, manaChange: 0 },
  order_drink: { text: "A pia erős, és kicsit hallucinálsz tőle, de a mana szinted az egekbe szökik.", choices: [{id: "talk_stranger", text: "Megnézem a köpenyest"}], imagePrompt: "tavern", hpChange: -5, manaChange: 50 },
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
  
  // Return optimized Unsplash URL with w=600 and q=60 for mobile performance
  return `https://images.unsplash.com/${imageId}?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60`;
};