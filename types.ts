export interface GameStats {
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
}

export type ItemType = 'weapon' | 'armor' | 'consumable' | 'key';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  icon: string; // Emoji or SVG string
}

export type EffectType = 'buff' | 'debuff';

export interface StatusEffect {
  id: string;
  name: string;
  type: EffectType;
  description: string;
  icon: string;
  duration: number; // Remaining turns
  hpPerTurn?: number;
  manaPerTurn?: number;
}

export interface Choice {
  id: string;
  text: string;
  requiredItemId?: string; // Optional: choice only available if user has this item
}

export interface StoryNode {
  text: string;
  choices: Choice[];
  imagePrompt: string;
  hpChange?: number;
  manaChange?: number;
  gameOver?: boolean;
  loot?: string[]; // Array of Item IDs gained in this node
  addEffects?: string[]; // Array of Effect IDs applied in this node
}

export interface GameState {
  currentTurn: number;
  history: { role: 'user' | 'model'; parts: { text: string }[] }[];
  stats: GameStats;
  inventory: Item[]; 
  activeEffects: StatusEffect[]; // Currently active status effects
  currentImage?: string;
  isLoading: boolean;
  error?: string;
  currentText: string;
  currentChoices: Choice[];
  isGameOver: boolean;
}

// Initial stats
export const INITIAL_STATS: GameStats = {
  hp: 100,
  maxHp: 100,
  mana: 50,
  maxMana: 100,
};