export interface GameStats {
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
}

export interface Choice {
  id: string;
  text: string;
}

export interface StoryNode {
  text: string;
  choices: Choice[];
  imagePrompt: string;
  hpChange?: number;
  manaChange?: number;
  gameOver?: boolean;
}

export interface GameState {
  currentTurn: number;
  history: { role: 'user' | 'model'; parts: { text: string }[] }[];
  stats: GameStats;
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