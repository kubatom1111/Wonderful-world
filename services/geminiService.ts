import { GoogleGenAI, Type, Schema } from "@google/genai";
import { StoryNode, GameStats } from "../types";

// Lazy initialization of Gemini Client
let ai: GoogleGenAI | null = null;

const getAiClient = () => {
  if (!ai) {
    const apiKey = process.env.API_KEY || ""; 
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

const MODEL_NAME = "gemini-2.5-flash";

// --- STATIC INTRO ---
const getIntroNode = (): StoryNode => {
  return {
    text: "A fékcsikorgás emléke lassan elhalványul. Nem érzel fájdalmat, csak végtelen csendet. Kinyitod a szemed, de nem a kórházi mennyezetet látod, hanem egy örvénylő, sötét csillagködöt. Egyedül vagy a semmiben. A tested súlytalan, mintha vízben lebegnél.",
    choices: [
      { id: "1a", text: "Kiáltok a sötétségbe!" },
      { id: "1b", text: "Csendben várok és figyelek." },
    ],
    imagePrompt: "void", // Simple keyword is enough now
    hpChange: 0,
    manaChange: 0
  };
};

// --- DYNAMIC AI ENGINE ---

const storySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    text: { type: Type.STRING, description: "The narrative segment describing what happens next. Atmospheric, dark fantasy style. 2-3 sentences. In HUNGARIAN." },
    choices: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          text: { type: Type.STRING, description: "The text of the choice. In HUNGARIAN." }
        },
        required: ["id", "text"]
      },
      description: "Exactly 2 distinct choices for the player."
    },
    imagePrompt: { type: Type.STRING, description: "One or two KEYWORDS describing the biome/location for image selection. Choose from: 'forest', 'cave', 'city', 'castle', 'tavern', 'mountain', 'water', 'fire', 'void', 'ruins', 'snow'. MUST BE ENGLISH." },
    hpChange: { type: Type.INTEGER, description: "Change in HP. Range -20 to +10." },
    manaChange: { type: Type.INTEGER, description: "Change in Mana. Negative for using magic, positive for rest." },
    gameOver: { type: Type.BOOLEAN, description: "True ONLY if HP drops to 0." }
  },
  required: ["text", "choices", "imagePrompt", "hpChange", "manaChange", "gameOver"]
};

export const generateStorySegment = async (
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  userChoice: string | null,
  currentStats?: GameStats
): Promise<StoryNode> => {
  
  if (history.length === 0) return getIntroNode();

  try {
    const client = getAiClient();
    
    const systemInstruction = `
      You are the Dungeon Master of 'Beautiful New World', a Dark Fantasy Isekai.
      Current Stats: HP: ${currentStats?.hp ?? 100}, Mana: ${currentStats?.mana ?? 50}.
      
      Tone: Dark Souls / Elden Ring. Mysterious, dangerous, beautiful.
      Rules:
      1. Continue the story logically.
      2. If HP <= 0, game over.
      3. Language: Narrative/Choices in HUNGARIAN.
      4. Image Prompt: Return a SINGLE KEYWORD describing the location (e.g., 'forest', 'cave', 'city').
    `;

    const contents = [
      ...history,
      { role: 'user', parts: [{ text: `Action: ${userChoice}. Generate next scene.` }] }
    ];

    const response = await client.models.generateContent({
      model: MODEL_NAME,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: storySchema,
        temperature: 0.8, 
      },
      contents: contents as any, 
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response");
    const generatedNode = JSON.parse(jsonText) as StoryNode;
    
    generatedNode.choices = generatedNode.choices.map((c, i) => ({
      ...c,
      id: c.id || `c_${Date.now()}_${i}`
    }));

    return generatedNode;

  } catch (error) {
    console.error("AI Error:", error);
    return {
      text: "A világ elhomályosodik egy pillanatra, majd újraéled. (Kapcsolódási hiba, de a kaland folytatódik...)",
      choices: [{ id: "f1", text: "Tovább" }, { id: "f2", text: "Körülnézek" }],
      imagePrompt: "void",
      hpChange: 0,
      manaChange: 0
    };
  }
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

  const collection = IMAGE_LIBRARY[category] || DEFAULT_IMAGES;
  
  // Pick a random image from the collection
  const imageId = collection[Math.floor(Math.random() * collection.length)];
  
  // Return optimized Unsplash URL
  return `https://images.unsplash.com/${imageId}?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80`;
};
