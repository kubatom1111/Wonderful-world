import { StoryNode } from "../types";

// --- STATIC STORY ENGINE ---

const getStaticStoryNode = (historyLength: number, lastChoiceText: string | null): StoryNode => {
  // A historyLength alapján határozzuk meg a történet pontjait
  
  // 1. KÖR: KEZDET (0) - Űr / Semmi
  if (historyLength === 0) {
    return {
      text: "A fékcsikorgás emléke lassan elhalványul. Nem érzel fájdalmat, csak végtelen csendet. Kinyitod a szemed, de nem a kórházi mennyezetet látod, hanem egy örvénylő, sötét csillagködöt. Egyedül vagy a semmiben. A tested súlytalan, mintha vízben lebegnél.",
      choices: [
        { id: "1a", text: "Kiáltok a sötétségbe!" },
        { id: "1b", text: "Csendben várok és figyelek." },
      ],
      imagePrompt: "intro",
      hpChange: 0,
      manaChange: 0
    };
  }

  // 2. KÖR: ISTENNŐ (2) - Fény
  if (historyLength === 2) {
    return {
      text: "Egy vakító fényoszlop hasít bele a sötétségbe. A fényből egy női alak lép ki, akinek arca folyamatosan változik – hol fiatal lány, hol idős bölcs –, de kisugárzása nyugodt és ősi.\n\n\"Üdvözöllek, Elveszett Lélek\" – szólal meg az elmédben. – \"A Földön véget ért az utad, de a sors fonalai még nem varrták el a történetedet. Felajánlok egy új életet a Beautiful New World világában.\"",
      choices: [
        { id: "2a", text: "Hálásan elfogadom az ajánlatot." },
        { id: "2b", text: "Milyen árat kell fizetnem ezért?" },
      ],
      imagePrompt: "goddess", 
      hpChange: 0,
      manaChange: 0
    };
  }

  // 3. KÖR: ERDŐ (4) - Sötét erdő
  if (historyLength === 4) {
    return {
      text: "\"Az ár csupán annyi, hogy élned kell\" – mosolyog az Istennő, majd egy kézmozdulattal eloszlatja a csillagokat.\n\nZuhanást érzel, majd hirtelen földet érsz. Puha mohán fekszel egy sűrű, ősi erdő közepén. A fák levelei lilásan derengenek a félhomályban, és két hold világít az égen. A levegő tele van nyers mágiával.",
      choices: [
        { id: "3a", text: "Felállok és elindulok az ösvényen." },
        { id: "3b", text: "Megvizsgálom a környezetemet mágiát keresve." },
      ],
      imagePrompt: "forest",
      hpChange: 0,
      manaChange: 10
    };
  }

  // 4. KÖR: FARKAS (6) - Vörös szemek
  if (historyLength === 6) {
    return {
      text: "Alig teszel pár lépést, amikor mély morgást hallasz a hátad mögül. A bokrok közül egy hatalmas, fekete bundájú Árnyfarkas ugrik elő! A szemei vörösen izzanak, agyaraiból savas nyál csepeg a földre. Éhesnek tűnik.",
      choices: [
        { id: "4a", text: "Tűzgolyót dobok rá! (Harc)" },
        { id: "4b", text: "Felmászok egy magas fára. (Menekülés)" },
      ],
      imagePrompt: "wolf",
      hpChange: -5,
      manaChange: 0
    };
  }

  // 5. KÖR: KONFLIKTUS VÉGE (8)
  if (historyLength === 8) {
    const isFight = lastChoiceText?.toLowerCase().includes("tűz") || lastChoiceText?.toLowerCase().includes("harc");

    if (isFight) {
      return {
        text: "Összegyűjtöd belső erődet, és a tenyeredből egy lángoló gömböt zúdítasz a szörnyre! A farkas vonyítva hőkölsz hátra, bundája füstölögni kezd. Rémülten elmenekül a sötétbe. Győztél, és érzed, ahogy a mágia ereje átjárja a tested.",
        choices: [
          { id: "5a", text: "Büszkén folytatom az utam." },
          { id: "5b", text: "Megpihenek regenerálódni." },
        ],
        imagePrompt: "fire",
        hpChange: -10,
        manaChange: -30
      };
    } else {
      return {
        text: "Gyorsan felkapsz egy alacsony ágra, épp mielőtt az állkapcsok csattannának a bokádon. A farkas megpróbál utánad ugrani, de elvéti. Egy ideig még köröz a fa alatt, majd morogva eloldalog. Megmenekültél.",
        choices: [
          { id: "5a", text: "Lemászok és osonva tovább indulok." },
          { id: "5b", text: "Fent maradok biztonságban." },
        ],
        imagePrompt: "hiding",
        hpChange: 0,
        manaChange: -5
      };
    }
  }

  // 6. KÖR: VÁROS (10) - Kastély sziluett
  if (historyLength === 10) {
    return {
      text: "Végül kiérsz az erdőből. A napfelkelte fényeiben, egy dombtetőről megpillantod a királyság fővárosát. Hatalmas, fehér falak, égbe nyúló tornyok és a távolban egy fenséges, lebegő kristályokkal díszített kastély. Ez lesz az új otthonod.",
      choices: [
        { id: "6a", text: "Belépek a városkapun." },
        { id: "6b", text: "A piactér felé veszem az irányt." },
      ],
      imagePrompt: "city",
      hpChange: 10,
      manaChange: 10
    };
  }

  // 7. KÖR: VÉGE (12) - Kocsma fények
  if (historyLength === 12) {
    return {
      text: "A város forgataga magával ragad. Betérsz az 'Arany Griff' fogadóba, ahol vidám lantmuzsika szól. Leülsz egy sarokasztalhoz, rendelsz egy italt, és elmosolyodsz. A kalandod még csak most kezdődik el igazán ebben az új világban.\n\n(Vége a bevezető fejezetnek.)",
      choices: [
        { id: "restart", text: "Újraélem a kalandot (Restart)" },
      ],
      imagePrompt: "tavern",
      hpChange: 20,
      manaChange: 20,
      gameOver: true
    };
  }

  // Fallback
  return {
    text: "A sors fonalai összekuszálódtak.",
    choices: [{ id: "restart", text: "Újrakezdés" }],
    imagePrompt: "intro",
    gameOver: true
  };
};

// --- IMAGE GENERATION ---

// Mapping simple keys to complex AI prompts
const PROMPT_MAP: Record<string, string> = {
  intro: "cosmic void, colorful nebula in deep space, swirling stardust, cinematic lighting, 8k resolution, mysterious atmosphere",
  goddess: "ethereal glowing goddess silhouette made of starlight, divine light beams in darkness, mystical fantasy art, no face, cinematic composition",
  forest: "dark ancient forest with purple glowing bioluminescent plants, foggy atmosphere, mystical trees, fantasy landscape, 8k",
  wolf: "gigantic black wolf with glowing red eyes in a dark forest, menacing beast, fantasy monster art, detailed fur, cinematic lighting",
  fire: "magical fireball spell in hand, first person view, glowing orange flames, dark background, rpg fantasy art, detailed particles",
  hiding: "looking up at dark giant trees in a forest, hiding in shadows, mysterious atmosphere, night time, fantasy concept art",
  city: "majestic white fantasy castle on a hill, floating crystals, sunrise lighting, epic fantasy architecture, wide shot, matte painting",
  tavern: "cozy medieval tavern interior, candle light, wooden tables, fantasy rpg atmosphere, warm lighting, detailed background"
};

export const generateStorySegment = async (
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  userChoice: string | null
): Promise<StoryNode> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  return getStaticStoryNode(history.length, userChoice);
};

export const generateSceneImage = async (promptKey: string): Promise<string> => {
  // Use Pollinations.ai for reliable, style-enforced generation
  const basePrompt = PROMPT_MAP[promptKey] || PROMPT_MAP.intro;
  // Append style enforcers to ensure consistency and avoid photorealism of modern people
  const finalPrompt = encodeURIComponent(`${basePrompt}, dark fantasy art style, digital painting, artstation, cinematic, masterpiece`);
  // Add random seed to prevent caching issues if needed, though for consistency we might want it stable. 
  // Let's keep it stable per scene type for now to save bandwidth/generation time, or random for variety?
  // Let's add a small random seed to ensure it regenerates if reload happens
  const seed = Math.floor(Math.random() * 1000);
  
  return `https://image.pollinations.ai/prompt/${finalPrompt}?width=1280&height=720&nologo=true&seed=${seed}`;
};