import React, { useState, useEffect, useRef, useCallback } from 'react';
import { INITIAL_STATS, GameState, StoryNode, Choice } from './types';
import { generateStorySegment, generateSceneImage } from './services/geminiService';
import TypewriterText from './components/TypewriterText';
import StatBar from './components/StatBar';
import SceneVisual from './components/SceneVisual';

// Icons
const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600 drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
  </svg>
);

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]" viewBox="0 0 20 20" fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentTurn: 0,
    history: [],
    stats: { ...INITIAL_STATS },
    isLoading: true,
    currentText: "",
    currentChoices: [],
    isGameOver: false,
    currentImage: 'intro' // Default scene
  });

  const [textComplete, setTextComplete] = useState(false);
  const [isSceneVisible, setIsSceneVisible] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Initialize game on mount
  useEffect(() => {
    const initGame = async () => {
      try {
        const response = await generateStorySegment([], null);
        await updateGameState(response);
      } catch (e) {
        console.error(e);
        setGameState(prev => ({ ...prev, isLoading: false, error: "Hiba történt a történet betöltése közben." }));
        setIsSceneVisible(true);
      }
    };

    initGame();
  }, []);

  // Scroll logic
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [gameState.currentText, gameState.currentChoices]);

  const updateGameState = async (node: StoryNode) => {
    const newHp = Math.min(gameState.stats.maxHp, Math.max(0, gameState.stats.hp + (node.hpChange || 0)));
    const newMana = Math.min(gameState.stats.maxMana, Math.max(0, gameState.stats.mana + (node.manaChange || 0)));
    const isDead = newHp <= 0 || node.gameOver;

    // Load Scene Type
    let sceneType = gameState.currentImage || 'intro';
    if (node.imagePrompt) {
        const generated = await generateSceneImage(node.imagePrompt);
        if (generated) sceneType = generated;
    }

    // Start text fade out
    setIsSceneVisible(false);

    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        stats: { ...prev.stats, hp: newHp, mana: newMana },
        currentText: node.text,
        currentChoices: isDead ? [{id: 'restart', text: "Új Élet Kezdése (Restart)"}] : node.choices,
        isGameOver: isDead || false,
        currentImage: sceneType,
        isLoading: false,
        history: [
          ...prev.history,
          { role: 'model', parts: [{ text: JSON.stringify(node) }] } 
        ]
      }));
      
      setTextComplete(false);
      setIsSceneVisible(true); // Triggers text fade in
    }, 600);
  };

  const handleChoice = async (choice: Choice) => {
    // Robust restart
    if (choice.id === 'restart') {
      window.location.reload();
      return;
    }

    setGameState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    // We add the user choice to history to track turns in the static engine
    const updatedHistory = [
      ...gameState.history,
      { role: 'user' as const, parts: [{ text: choice.text }] }
    ];

    try {
      const response = await generateStorySegment(updatedHistory, choice.text);
      await updateGameState(response);
    } catch (e) {
      console.error(e);
      setGameState(prev => ({ ...prev, isLoading: false, error: "A sors fonalai elszakadtak. Próbáld újra." }));
      setIsSceneVisible(true);
    }
  };

  const onTextComplete = useCallback(() => {
    setTextComplete(true);
  }, []);

  return (
    <div className="min-h-screen font-serif text-gray-300 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
         {/* Deep dark gradient */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#110e0e] via-[#050505] to-[#000000] opacity-90"></div>
        {/* Subtle magical glow in center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-900/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Main Grimoire Container */}
      <main className="w-full max-w-5xl z-10 flex flex-col gap-8">
        
        {/* Header Title Area */}
        <header className="relative w-full flex flex-col items-center justify-center py-6 md:py-10">
            <div className="w-full max-w-lg h-[1px] bg-gradient-to-r from-transparent via-amber-700/50 to-transparent mb-4"></div>
            
            <div className="relative group cursor-default">
                <div className="absolute -inset-4 bg-amber-600/10 blur-xl rounded-full opacity-50 group-hover:opacity-75 transition-opacity duration-1000"></div>
                <h1 className="relative text-3xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-400 to-amber-700 tracking-[0.15em] drop-shadow-lg uppercase text-center font-serif leading-tight">
                    Beautiful<br className="md:hidden" /> New World
                </h1>
            </div>

            <div className="flex items-center justify-center gap-4 mt-4 opacity-80">
                <svg className="w-8 h-8 text-amber-700/60 rotate-180" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
                <div className="flex flex-col items-center">
                    <p className="text-amber-500/90 text-xs md:text-sm tracking-[0.5em] uppercase font-bold">Isekai Chronicles</p>
                </div>
                <svg className="w-8 h-8 text-amber-700/60" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
            </div>
            
            <div className="w-full max-w-lg h-[1px] bg-gradient-to-r from-transparent via-amber-700/50 to-transparent mt-4"></div>
        </header>

        {/* Game Layout */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-stretch">
            
            {/* Left Column: Visuals & Stats */}
            <div className="w-full md:w-5/12 flex flex-col gap-6">
                
                {/* Stats Panel */}
                <div className="bg-[#0f0c0c] border border-amber-900/30 p-5 rounded shadow-xl backdrop-blur-sm relative overflow-hidden group hover:border-amber-700/40 transition-colors duration-500">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-700/50 to-transparent"></div>
                    <StatBar 
                        label="Életerő" 
                        value={gameState.stats.hp} 
                        max={gameState.stats.maxHp} 
                        color="bg-gradient-to-r from-red-900 via-red-700 to-red-500" 
                        icon={<HeartIcon />}
                    />
                    <StatBar 
                        label="Mana" 
                        value={gameState.stats.mana} 
                        max={gameState.stats.maxMana} 
                        color="bg-gradient-to-r from-sky-900 via-sky-600 to-sky-400" 
                        icon={<StarIcon />}
                    />
                </div>

                {/* Image Display */}
                <div className="flex-1 min-h-[300px] bg-[#080808] border-2 border-amber-900/20 rounded relative group overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                     <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-amber-600/40 z-20"></div>
                     <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-amber-600/40 z-20"></div>
                     <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-amber-600/40 z-20"></div>
                     <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-amber-600/40 z-20"></div>
                    
                    <div className="w-full h-full relative bg-[#121010]">
                         {gameState.isLoading && isSceneVisible && (
                             <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-black/50 backdrop-blur-sm">
                                 <div className="w-12 h-12 border-2 border-amber-600/30 border-t-amber-500 rounded-full animate-spin mb-3"></div>
                                 <span className="text-amber-700/80 text-xs tracking-widest font-bold">VILÁG SZÖVÉSE...</span>
                             </div>
                         )}
                         
                         {/* Render the generated scene visuals */}
                         <SceneVisual scene={gameState.currentImage || 'intro'} />
                         
                         {/* Overlay Shadow - Always on top */}
                         <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_60px_rgba(0,0,0,0.8)] z-20"></div>
                    </div>
                </div>
            </div>

            {/* Right Column: Text & Choices */}
            <div className="w-full md:w-7/12 flex flex-col">
                 <div className="flex-1 bg-[#0a0a0a] border-y md:border border-amber-900/20 md:rounded p-6 md:p-8 relative shadow-2xl flex flex-col">
                    
                    <div className={`
                        flex-1 font-sans text-lg md:text-xl leading-8 text-gray-300 tracking-wide text-justify mb-8
                        transition-all duration-700 ease-out
                        ${isSceneVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                    `}>
                        {gameState.error ? (
                            <div className="text-red-800 bg-red-950/20 p-4 border border-red-900/50 rounded">{gameState.error}</div>
                        ) : (
                            <TypewriterText 
                                text={gameState.currentText} 
                                speed={25}
                                delay={300}
                                onComplete={onTextComplete}
                            />
                        )}
                    </div>

                    <div className={`
                        flex flex-col gap-4 mt-auto
                        transition-all duration-500 delay-100
                        ${isSceneVisible ? 'opacity-100' : 'opacity-0'}
                    `}>
                        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-amber-900/30 to-transparent mb-4"></div>
                        
                        {gameState.isLoading ? (
                            <div className="text-center py-6">
                                <span className="text-amber-800/40 animate-pulse text-sm tracking-[0.3em]">A SORS DÖNT...</span>
                            </div>
                        ) : (
                            gameState.currentChoices.map((choice, idx) => (
                                <button
                                    key={choice.id}
                                    onClick={() => handleChoice(choice)}
                                    disabled={!textComplete}
                                    style={{ animationDelay: `${idx * 100}ms` }}
                                    className={`
                                        group relative overflow-hidden p-[1px] rounded transition-all duration-300
                                        ${!textComplete ? 'opacity-40 cursor-not-allowed grayscale' : 'opacity-100 hover:-translate-y-0.5'}
                                    `}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-amber-900/40 via-amber-600/40 to-amber-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="relative bg-[#111] hover:bg-[#161616] p-4 flex items-center justify-between rounded transition-colors border border-amber-900/20 group-hover:border-transparent">
                                        <span className="font-serif text-gray-400 group-hover:text-amber-100 text-lg transition-colors">
                                            {choice.text}
                                        </span>
                                        <span className="text-amber-800 group-hover:text-amber-500 transition-colors opacity-50 group-hover:opacity-100">
                                            ✦
                                        </span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                 </div>
            </div>
        </div>
        <div ref={bottomRef} />
      </main>
    </div>
  );
};

export default App;