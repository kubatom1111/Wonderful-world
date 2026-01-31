import { GoogleGenAI, Type } from "@google/genai";
import { StoryNode } from "../types";

// Helper to safely get the API key
const getApiKey = () => {
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
    // @ts-ignore
    return import.meta.env.VITE_API_KEY;
  }
  return "";
};

const apiKey = getApiKey();
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// --- OFFLINE / DEMO MODE ASSETS ---

const OFFLINE_IMAGES = {
  void: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2894&auto=format&fit=crop", // Abstract Space
  goddess: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?q=80&w=2787&auto=format&fit=crop", // Mysterious Light/Figure
  forest: "https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=2832&auto=format&fit=crop", // Dark Forest
  village: "https://images.unsplash.com/photo-1595878715977-2e8f8df18ea8?q=80&w=2787&auto=format&fit=crop", // Old Village
  battle: "https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=2787&auto=format&fit=crop", // Fire/Battle
};

// Simple Offline Story Engine
const getOfflineStoryNode = (historyLength: number, lastChoice: string | null): StoryNode => {
  // PROLOGUE
  if (!lastChoice) {
    return {
      text: "A fékk, a csikorgás, majd a tompa csattanás emléke lassan elhalványul. Nem érzel fájdalmat. Nem érzel semmit. Kinyitod a szemed, de nem a kórházi mennyezetet látod, hanem egy végtelen, örvénylő csillagködöt. Előtted egy ragyogó alak lebeg, akinek arcát nem látod tisztán, de jelenléte egyszerre megnyugtató és félelmetes. \n\n\"Üdvözöllek, utazó\" – szólal meg a hangja az elmédben. – \"Az életed fonala elszakadt a Földön, de a lelked túl erős a megsemmisüléshez.\"",
      choices: [
        { id: "1a", text: "Hol vagyok? Ki vagy te?" },
        { id: "1b", text: "Ez a mennyország? Vagy a pokol?" },
      ],
      imagePrompt: "void",
      hpChange: 0,
      manaChange: 0,
      gameOver: false
    };
  }

  // SCENE 1: The Dialogue
  if (historyLength <= 2) { // Early game
    return {
      text: "\"Én vagyok a Kezdet és a Vég őrzője ebben a szektorban\" – válaszolja a lény, miközben a csillagok táncolni kezdenek körülötte. – \"A világ, ahonnan jöttél, már a múlté. De felkínálok neked egy lehetőséget. Egy új világot, tele mágiával, veszéllyel és lehetőséggel. A Beautiful New World vár rád.\"",
      choices: [
        { id: "2a", text: "Elfogadom. Készen állok az új életre!" },
        { id: "2b", text: "Milyen képességeket kapok?" },
      ],
      imagePrompt: "goddess",
      hpChange: 0,
      manaChange: 0,
      gameOver: false
    };
  }

  // SCENE 2: Arrival
  if (lastChoice.includes("Elfogadom") || lastChoice.includes("Készen") || lastChoice.includes("képességeket")) {
    return {
      text: "Fényrobbanás vakít el. Úgy érzed, mintha minden sejtedet szétszednék, majd újra összeraknák. \n\nAmikor feleszmélsz, a hátadon fekszel. Hűvös szellő simogatja az arcodat, és az orrodat megcsapja a nedves föld és a fenyő illata. Egy sűrű, ősi erdő közepén vagy. A fák levelei lilás árnyalatban játszanak, az égen pedig két hold halvány körvonala látszik.",
      choices: [
        { id: "3a", text: "Felállok és körülnézek." },
        { id: "3b", text: "Megvizsgálom magam, változtam-e valamit." },
      ],
      imagePrompt: "forest",
      hpChange: 0,
      manaChange: 10, // First mana awaken
      gameOver: false
    };
  }

  // SCENE 3: Exploration
  if (lastChoice.includes("Felállok") || lastChoice.includes("Megvizsgálom")) {
    return {
      text: "A tested fiatalabbnak, erősebbnek tűnik. A tenyeredbe nézve halványan derengő rúnákat látsz a bőröd alatt. Hirtelen reccsenést hallasz a hátad mögül. Egy hatalmas, agyaras vadkan ront ki a bokrok közül, szemei vörösen izzanak. Nem tűnik barátságosnak.",
      choices: [
        { id: "4a", text: "Megpróbálok varázsolni (Tűzgolyó)." },
        { id: "4b", text: "Felkapok egy faágat és védekezem." },
        { id: "4c", text: "Elfutuok." },
      ],
      imagePrompt: "battle",
      hpChange: 0,
      manaChange: 0,
      gameOver: false
    };
  }

   // SCENE 4: Combat/Action
   if (lastChoice.includes("varázsolni")) {
    return {
      text: "Ösztönösen kinyújtod a kezed. A tenyeredben lévő rúnák felizzanak, és egy lángcsóva csap ki belőlük! A vadkan visítva hőkölsz hátra, a bundája megperzselődött. A mágia használata azonban kimerít, szédülni kezdesz.",
      choices: [
        { id: "5a", text: "Befejezem a dolgot egy újabb támadással!" },
        { id: "5b", text: "Kihasználom a zavarát és elmenekülök." },
      ],
      imagePrompt: "battle",
      hpChange: -5,
      manaChange: -20,
      gameOver: false
    };
  }

  // Default Loop for Offline Mode
  return {
    text: "A kaland folytatódik... (Ez a DEMO verzió vége az offline módban. API kulcs megadása után a történet a végtelenségig generálható.)",
    choices: [
      { id: "restart", text: "Újrakezdés" }
    ],
    imagePrompt: "village",
    hpChange: 0,
    manaChange: 0,
    gameOver: true
  };
};


const SYSTEM_INSTRUCTION = `
Te egy Isekai (Another World) fantasy kalandjáték narrátora vagy.
Stílus: Epikus, misztikus, kicsit sötét tónusú.
... (Standard System Prompt) ...
`;

export const generateStorySegment = async (
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  userChoice: string | null
): Promise<StoryNode> => {
  
  // --- OFFLINE MODE CHECK ---
  if (!ai) {
    console.log("Running in Offline/Demo Mode");
    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 1500));
    return getOfflineStoryNode(history.length, userChoice);
  }

  // --- ONLINE MODE (GEMINI) ---
  let prompt = "";
  if (!userChoice) {
    prompt = `
      Kezdd a történetet a legelején! 
      Helyszín: Modern nagyváros, esős éjszaka.
      Esemény: A főhős (a játékos) éppen átsétál az úton, amikor elvakítják egy teherautó fényei. Csattanás. Sötétség.
      Aztán: Hirtelen csend. A játékos kinyitja a szemét egy végtelen, örvénylő csillagköd közepén (vagy fehér ürességben). Előtte lebeg egy ragyogó, titokzatos alak (az Istennő).
      Az Istennő megszólal: "Érdekes... Egy lélek, amely még nem állt készen a végre."
      Írd le ezt a jelenetet hangulatosan, és adj válaszlehetőségeket, hogyan reagál a játékos az Istennőre.
    `;
  } else {
    prompt = `A játékos döntése: "${userChoice}". Folytasd a történetet.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: [
        ...history,
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            choices: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  text: { type: Type.STRING },
                }
              }
            },
            hpChange: { type: Type.INTEGER },
            manaChange: { type: Type.INTEGER },
            imagePrompt: { type: Type.STRING },
            gameOver: { type: Type.BOOLEAN },
          },
          required: ["text", "choices", "imagePrompt", "gameOver"]
        }
      }
    });

    if (response.text) {
        return JSON.parse(response.text) as StoryNode;
    }
    throw new Error("Üres válasz az AI-tól.");

  } catch (error) {
    console.error("Gemini Story Error:", error);
    // Fallback to offline node on error too
    return getOfflineStoryNode(history.length, userChoice);
  }
};

export const generateSceneImage = async (prompt: string): Promise<string | undefined> => {
  // Offline Mode Image Selector
  if (!ai) {
    const lowerPrompt = prompt.toLowerCase();
    if (lowerPrompt.includes("void") || lowerPrompt.includes("start")) return OFFLINE_IMAGES.void;
    if (lowerPrompt.includes("goddess") || lowerPrompt.includes("istennő")) return OFFLINE_IMAGES.goddess;
    if (lowerPrompt.includes("forest") || lowerPrompt.includes("erdő")) return OFFLINE_IMAGES.forest;
    if (lowerPrompt.includes("battle") || lowerPrompt.includes("fire") || lowerPrompt.includes("attack")) return OFFLINE_IMAGES.battle;
    return OFFLINE_IMAGES.village; // Default
  }
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [{ text: prompt + " Anime fantasy art style, 8k resolution, highly detailed, atmospheric lighting, masterpiece." }]
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return undefined;
  } catch (error) {
    console.error("Gemini Image Error:", error);
    return OFFLINE_IMAGES.forest; // Fallback image on error
  }
};