import { GoogleGenAI, Type, Schema } from "@google/genai";
import { StoryNode, GameStats } from "../types";

// Lazy initialization of Gemini Client
let ai: GoogleGenAI | null = null;

const getAiClient = () => {
  if (!ai) {
    // Use fallback empty string to prevent constructor crash if key is undefined
    // The API call itself will fail gracefully with an error message later if key is invalid
    const apiKey = process.env.API_KEY || ""; 
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

const MODEL_NAME = "gemini-2.5-flash"; // Using Flash for speed/cost balance in interactive games

// --- STATIC INTRO (For instant start) ---
const getIntroNode = (): StoryNode => {
  return {
    text: "A fékcsikorgás emléke lassan elhalványul. Nem érzel fájdalmat, csak végtelen csendet. Kinyitod a szemed, de nem a kórházi mennyezetet látod, hanem egy örvénylő, sötét csillagködöt. Egyedül vagy a semmiben. A tested súlytalan, mintha vízben lebegnél.",
    choices: [
      { id: "1a", text: "Kiáltok a sötétségbe!" },
      { id: "1b", text: "Csendben várok és figyelek." },
    ],
    imagePrompt: "cosmic void, colorful nebula in deep space, swirling stardust",
    hpChange: 0,
    manaChange: 0
  };
};

// --- DYNAMIC AI ENGINE ---

const storySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    text: { type: Type.STRING, description: "The narrative segment describing what happens next. Atmospheric, dark fantasy style. 2-3 sentences." },
    choices: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          text: { type: Type.STRING, description: "The text of the choice." }
        },
        required: ["id", "text"]
      },
      description: "Exactly 2 distinct choices for the player."
    },
    imagePrompt: { type: Type.STRING, description: "A concise, comma-separated visual description of the current scene for an image generator (e.g. 'dark swamp, glowing mushrooms, fog')." },
    hpChange: { type: Type.INTEGER, description: "Change in HP based on the result. Negative for damage, positive for healing. Range -20 to +10." },
    manaChange: { type: Type.INTEGER, description: "Change in Mana. Negative for using magic, positive for rest/potions." },
    gameOver: { type: Type.BOOLEAN, description: "True ONLY if HP drops to 0 or the player chose a definitively fatal action." }
  },
  required: ["text", "choices", "imagePrompt", "hpChange", "manaChange", "gameOver"]
};

export const generateStorySegment = async (
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  userChoice: string | null,
  currentStats?: GameStats
): Promise<StoryNode> => {
  
  // 1. Return Static Intro if it's the very first turn
  if (history.length === 0) {
    return getIntroNode();
  }

  // 2. Generate Dynamic Continuation
  try {
    const client = getAiClient();
    
    const systemInstruction = `
      You are the Dungeon Master of a 'Beautiful New World', a Dark Fantasy Isekai text adventure.
      
      Current Player Stats: HP: ${currentStats?.hp ?? 100}, Mana: ${currentStats?.mana ?? 50}.
      
      Rules:
      1. Tone: Dark, mysterious, mature, atmospheric. Similar to Dark Souls or Elden Ring lore.
      2. Continuity: Continue the story logically from the last user choice.
      3. Variety: Introduce new environments (ruins, cursed forests, floating cities, caves), weird creatures, and magic. Do not stay in one place too long.
      4. Consequences: If the player does something risky, deduct HP. If they use magic, deduct Mana.
      5. Length: Keep the narrative description engaging but concise (approx 300-400 characters).
      6. Infinite: Do NOT end the story unless the player dies (HP hits 0). Keep generating new challenges.
      7. Language: HUNGARIAN (Magyar).
    `;

    const contents = [
      ...history,
      { role: 'user', parts: [{ text: `Player Choice: ${userChoice}. Generate the next scene.` }] }
    ];

    const response = await client.models.generateContent({
      model: MODEL_NAME,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: storySchema,
        temperature: 0.8, 
      },
      contents: contents as any, 
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");

    const generatedNode = JSON.parse(jsonText) as StoryNode;
    
    // Fallback if AI forgets to give IDs
    generatedNode.choices = generatedNode.choices.map((c, i) => ({
      ...c,
      id: c.id || `choice_${Date.now()}_${i}`
    }));

    return generatedNode;

  } catch (error) {
    console.error("AI Generation failed:", error);
    // Emergency Fallback
    return {
      text: "A mágia köde elhomályosítja a látásodat. Egy pillanatra megszédülsz, de aztán kitisztul a kép. (Hiba történt a kapcsolatban, de a kaland folytatódik...)",
      choices: [
        { id: "fallback_1", text: "Továbbmegyek az úton." },
        { id: "fallback_2", text: "Megpihenek egy pillanatra." }
      ],
      imagePrompt: "mysterious fog, glitch art, dark fantasy",
      hpChange: 0,
      manaChange: 0
    };
  }
};

// --- IMAGE GENERATION ---

export const generateSceneImage = async (prompt: string): Promise<string> => {
  const style = "dark fantasy art style, digital painting, artstation, cinematic, masterpiece, highly detailed, dramatic lighting";
  const finalPrompt = encodeURIComponent(`${prompt}, ${style}`);
  const seed = Math.floor(Math.random() * 10000);
  
  return `https://image.pollinations.ai/prompt/${finalPrompt}?width=1280&height=720&nologo=true&seed=${seed}`;
};