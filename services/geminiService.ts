import { GoogleGenAI, Type } from "@google/genai";
import { StoryNode } from "../types";

// Helper to safely get the API key in various environments (Vite/Next/Standard)
const getApiKey = () => {
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  // Fallback for Vite client-side usage if not defined in process.env
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
    // @ts-ignore
    return import.meta.env.VITE_API_KEY;
  }
  return "";
};

const apiKey = getApiKey();
// Initialize Gemini Client safely
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const SYSTEM_INSTRUCTION = `
Te egy Isekai (Another World) fantasy kalandjáték narrátora vagy.
Stílus: Epikus, misztikus, kicsit sötét tónusú, mint a Mushoku Tensei vagy a Re:Zero.

A Történet Íve:
1. **Kezdet (Prológus):** A játékos a modern világban hal meg (tipikus teherautó/baleset), és egy "Köztes Térbe" kerül (Fehér Üresség).
2. **Találkozás:** Itt egy Istennővel (vagy felsőbb lénnyel) beszél, aki felajánlja a reinkarnációt.
3. **Új Világ:** Ezután születik újjá egy fantasy világban (a neve: "Beautiful New World"), ahol a döntései alakítják a sorsát és képességeit.

Feladataid:
1. Narrálj választékos, irodalmi magyar nyelven (kb. 70-100 szó/kör).
2. Mindig adj 2-3 érdemi választási lehetőséget.
3. Kezeld a HP (Életerő) és Mana (Varázserő) értékeket.
4. Generálj angol nyelvű 'imagePrompt'-ot az aktuális jelenethez. Stílus: "Anime art style, fantasy, detailed, atmospheric, cinematic lighting".

Kimenet (JSON):
{
  "text": "...",
  "choices": [{ "id": "...", "text": "..." }],
  "hpChange": 0,
  "manaChange": 0,
  "imagePrompt": "...",
  "gameOver": false
}
`;

export const generateStorySegment = async (
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  userChoice: string | null
): Promise<StoryNode> => {
  
  if (!ai) {
    console.error("API Key missing");
    return {
        text: "Hiba: Az Istennő nem elérhető (Hiányzó API Kulcs). Kérlek ellenőrizd a konfigurációt (API_KEY vagy VITE_API_KEY).",
        choices: [],
        imagePrompt: "",
        gameOver: true
    };
  }

  let prompt = "";
  if (!userChoice) {
    // START: MODERN WORLD -> DEATH -> GODDESS
    prompt = `
      Kezdd a történetet a legelején! 
      Helyszín: Modern nagyváros, esős éjszaka.
      Esemény: A főhős (a játékos) éppen átsétál az úton, amikor elvakítják egy teherautó fényei. Csattanás. Sötétség.
      Aztán: Hirtelen csend. A játékos kinyitja a szemét egy végtelen, örvénylő csillagköd közepén (vagy fehér ürességben). Előtte lebeg egy ragyogó, titokzatos alak (az Istennő).
      Az Istennő megszólal: "Érdekes... Egy lélek, amely még nem állt készen a végre."
      Írd le ezt a jelenetet hangulatosan, és adj válaszlehetőségeket, hogyan reagál a játékos az Istennőre.
    `;
  } else {
    prompt = `A játékos döntése: "${userChoice}". Folytasd a történetet. Ha ez még a prológus, akkor vezess át a fantasy világba való újjászületéshez/megérkezéshez. Ha már ott van, folytasd a kalandot.`;
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
    return {
      text: "A valóság szövete megremeg. Egy külső erő (Szerver Hiba) megszakította a kapcsolatot az Istennővel.",
      choices: [{ id: "retry", text: "Koncentrálj és próbáld újra (Hiba elhárítása)" }],
      imagePrompt: "surreal glitch art, anime goddess dissolving into data, dark fantasy style",
      gameOver: false
    };
  }
};

export const generateSceneImage = async (prompt: string): Promise<string | undefined> => {
  if (!ai) return undefined;
  
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
    return undefined;
  }
};