import React, { useState, useEffect } from 'react';
import { INITIAL_STATS, StoryNode, Choice, GameStats, Item, StatusEffect } from './types';
import { getStoryNode, getItem, getEffect } from './services/geminiService';
import GameScene from './components/GameScene';

const App: React.FC = () => {
  // Logical Game State (Source of Truth)
  const [currentNode, setCurrentNode] = useState<StoryNode | null>(null);
  const [stats, setStats] = useState<GameStats>(INITIAL_STATS);
  const [inventory, setInventory] = useState<Item[]>([]);
  const [activeEffects, setActiveEffects] = useState<StatusEffect[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  // Initialize game on mount
  useEffect(() => {
    const initGame = async () => {
      try {
        const response = getStoryNode('intro');
        setCurrentNode(response);
      } catch (e) {
        console.error("Game Initialization Failed:", e);
        setError("Hiba történt a történet betöltése közben.");
      } finally {
        setIsLoading(false);
      }
    };

    initGame();
  }, []);

  const handleChoice = async (choice: Choice) => {
    // Determine reset logic
    if (choice.id === 'intro') {
        setStats(INITIAL_STATS);
        setInventory([]);
        setActiveEffects([]);
    }
    
    setIsLoading(true);
    setError(undefined);

    try {
      // 1. Fetch next node (Sync or Async)
      const nextNode = getStoryNode(choice.id);

      // --- LOGIC: STATUS EFFECTS & STATS ---

      let currentHp = stats.hp;
      let currentMana = stats.mana;
      let effectsLog: string[] = [];
      let updatedEffects = [...activeEffects];

      // A. Add New Effects from Next Node
      if (nextNode.addEffects) {
        nextNode.addEffects.forEach(effectId => {
            const effect = getEffect(effectId);
            if (effect) {
                // If effect already exists, reset duration? Or duplicate? Let's stack for now or reset duration.
                // Simple implementation: Just push.
                updatedEffects.push(effect);
                effectsLog.push(`${effect.name} hatása alá kerültél!`);
            }
        });
      }

      // B. Tick Effects (Apply Damage/Heal)
      // We process effects *before* the node's immediate impact, or after? 
      // Convention: Effects tick at end of turn (movement).
      const nextEffects: StatusEffect[] = [];
      
      updatedEffects.forEach(effect => {
          let effectDidSomething = false;
          
          if (effect.hpPerTurn) {
              currentHp += effect.hpPerTurn;
              effectDidSomething = true;
          }
          if (effect.manaPerTurn) {
              currentMana += effect.manaPerTurn;
              effectDidSomething = true;
          }

          // Generate log message for the tick
          if (effectDidSomething) {
             const hpMsg = effect.hpPerTurn ? `${effect.hpPerTurn > 0 ? '+' : ''}${effect.hpPerTurn} HP` : '';
             const manaMsg = effect.manaPerTurn ? `${effect.manaPerTurn > 0 ? '+' : ''}${effect.manaPerTurn} Mana` : '';
             const combined = [hpMsg, manaMsg].filter(Boolean).join(', ');
             effectsLog.push(`${effect.name}: ${combined}`);
          }

          // Decrement duration
          const remaining = effect.duration - 1;
          if (remaining > 0) {
              nextEffects.push({ ...effect, duration: remaining });
          } else {
              effectsLog.push(`${effect.name} hatása elmúlt.`);
          }
      });

      // C. Apply Immediate Node Stat Changes
      currentHp += (nextNode.hpChange || 0);
      currentMana += (nextNode.manaChange || 0);

      // D. Clamping
      currentHp = Math.min(stats.maxHp, currentHp);
      currentMana = Math.min(stats.maxMana, Math.max(0, currentMana));
      
      // E. Check Death
      const isDead = currentHp <= 0 || nextNode.gameOver;

      // 3. Process Loot
      if (nextNode.loot && nextNode.loot.length > 0) {
        const newItems: Item[] = [];
        nextNode.loot.forEach(itemId => {
           if (!inventory.some(i => i.id === itemId)) {
               const item = getItem(itemId);
               if (item) newItems.push(item);
           }
        });
        if (newItems.length > 0) {
           setInventory(prev => [...prev, ...newItems]);
        }
      }

      // 4. Construct Display Text (append logs)
      let finalText = nextNode.text;
      if (effectsLog.length > 0) {
          finalText += "\n\n" + effectsLog.map(log => `[${log}]`).join(" ");
      }

      // 5. Prepare Display Node
      const nodeToDisplay: StoryNode = {
          ...nextNode,
          text: finalText,
          choices: isDead ? [{id: 'intro', text: "A lelked visszatér a körforgásba (Új Játék)"}] : nextNode.choices,
          gameOver: isDead || false
      };

      // 6. Update State
      setStats({ ...stats, hp: currentHp, mana: currentMana });
      setActiveEffects(nextEffects);
      setCurrentNode(nodeToDisplay);

    } catch (e) {
      console.error(e);
      setError("Hiba történt. Próbáld újra.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-serif text-gray-100 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#110e0e] via-[#050505] to-[#000000] opacity-90"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-900/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Main Grimoire Container */}
      <main className="w-full max-w-5xl z-10 flex flex-col gap-8">
        
        {/* Header */}
        <header className="relative w-full flex flex-col items-center justify-center py-6 md:py-10">
            <div className="w-full max-w-lg h-[1px] bg-gradient-to-r from-transparent via-amber-700/50 to-transparent mb-4"></div>
            <div className="relative group cursor-default">
                <div className="absolute -inset-4 bg-amber-600/10 blur-xl rounded-full opacity-50 group-hover:opacity-75 transition-opacity duration-1000"></div>
                <h1 className="relative text-3xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-400 to-amber-700 tracking-[0.15em] drop-shadow-lg uppercase text-center font-serif leading-tight">
                    Beautiful<br className="md:hidden" /> New World
                </h1>
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 opacity-80">
                <svg className="w-8 h-8 text-amber-600 rotate-180" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
                <div className="flex flex-col items-center">
                    <p className="text-amber-500 text-xs md:text-sm tracking-[0.5em] uppercase font-bold drop-shadow-md">Isekai Chronicles</p>
                </div>
                <svg className="w-8 h-8 text-amber-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
            </div>
            <div className="w-full max-w-lg h-[1px] bg-gradient-to-r from-transparent via-amber-700/50 to-transparent mt-4"></div>
        </header>

        {/* Scene Container */}
        {currentNode && (
            <GameScene 
                node={currentNode}
                stats={stats}
                inventory={inventory}
                activeEffects={activeEffects}
                onChoice={handleChoice}
                isLoading={isLoading}
                error={error}
            />
        )}
      </main>
    </div>
  );
};

export default App;