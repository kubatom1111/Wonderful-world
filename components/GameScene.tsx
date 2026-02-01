import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameStats, StoryNode, Choice, Item, StatusEffect } from '../types';
import { generateSceneImage } from '../services/geminiService';
import TypewriterText from './TypewriterText';
import StatBar from './StatBar';
import SceneVisual from './SceneVisual';

// --- Icons ---
const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 drop-shadow-[0_0_8px_rgba(220,38,38,1)]" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
  </svg>
);

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,1)]" viewBox="0 0 20 20" fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const BagIcon = () => (
   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,1)]" viewBox="0 0 20 20" fill="currentColor">
     <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
   </svg>
);

interface GameSceneProps {
  node: StoryNode;
  stats: GameStats;
  inventory: Item[];
  activeEffects: StatusEffect[];
  onChoice: (choice: Choice) => void;
  isLoading?: boolean;
  error?: string;
}

const GameScene: React.FC<GameSceneProps> = ({ node, stats, inventory, activeEffects, onChoice, isLoading, error }) => {
  // --- Buffered Display State ---
  // We keep a separate state for what is *currently* shown, so we can
  // fade out the old content before swapping in the new content from props.
  const [displayNode, setDisplayNode] = useState<StoryNode>(node);
  const [displayStats, setDisplayStats] = useState<GameStats>(stats);
  const [displayInventory, setDisplayInventory] = useState<Item[]>(inventory);
  const [displayEffects, setDisplayEffects] = useState<StatusEffect[]>(activeEffects);
  
  // --- Visual & Animation State ---
  const [currentImage, setCurrentImage] = useState<string | undefined>(undefined);
  const [sceneType, setSceneType] = useState<string>('intro');
  const [isFading, setIsFading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [textComplete, setTextComplete] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  // Helper to map prompts to visual CSS themes
  const getVisualKeyFromPrompt = (prompt: string): string => {
    if (!prompt) return 'hiding';
    const p = prompt.toLowerCase();
    if (p.includes('space') || p.includes('void') || p.includes('nebula')) return 'intro';
    if (p.includes('forest') || p.includes('tree') || p.includes('woods')) return 'forest';
    if (p.includes('fire') || p.includes('flame') || p.includes('burn')) return 'fire';
    if (p.includes('city') || p.includes('castle') || p.includes('town') || p.includes('ruin')) return 'city';
    if (p.includes('wolf') || p.includes('beast') || p.includes('monster')) return 'wolf';
    if (p.includes('tavern') || p.includes('inn') || p.includes('bar')) return 'tavern';
    if (p.includes('god') || p.includes('divine') || p.includes('light')) return 'goddess';
    return 'hiding'; 
  };

  // --- Transition Logic ---
  useEffect(() => {
    // If the props match what we are displaying, do nothing.
    // We check text similarity to detect a new node.
    if (node.text === displayNode.text && node.choices.length === displayNode.choices.length) {
        return;
    }

    let cancelled = false;

    const performTransition = async () => {
        // 1. Start Fade Out
        setIsFading(true);

        // 2. Prepare next image (fetch in parallel with fade out)
        let nextSceneType = sceneType;
        let imagePromise: Promise<string> | null = null;
        
        if (node.imagePrompt && node.imagePrompt !== displayNode.imagePrompt) {
            nextSceneType = getVisualKeyFromPrompt(node.imagePrompt);
            imagePromise = generateSceneImage(node.imagePrompt);
        }

        // 3. Wait for the fade-out animation (600ms)
        await new Promise(resolve => setTimeout(resolve, 600));
        
        if (cancelled) return;

        // 4. Swap Content
        setDisplayNode(node);
        setDisplayStats(stats);
        setDisplayInventory(inventory);
        setDisplayEffects(activeEffects);
        setTextComplete(false);
        
        // 5. Swap Image / Scene Visual
        if (node.imagePrompt && node.imagePrompt !== displayNode.imagePrompt) {
            setSceneType(nextSceneType);
            setImageLoaded(false); // Reset to show SceneVisual placeholder
            
            if (imagePromise) {
                try {
                    const url = await imagePromise;
                    if (!cancelled) setCurrentImage(url);
                } catch (e) {
                    console.error("Failed to generate image", e);
                }
            }
        }

        // 6. Start Fade In
        setIsFading(false);
    };

    performTransition();

    return () => { cancelled = true; };
  }, [node, stats, inventory, activeEffects, displayNode, sceneType]);

  // Initial setup for scene type if undefined
  useEffect(() => {
      if (node.imagePrompt) {
          const initialType = getVisualKeyFromPrompt(node.imagePrompt);
          if (initialType !== sceneType) setSceneType(initialType);
          // Initial load image
          if (!currentImage) {
              generateSceneImage(node.imagePrompt).then(setCurrentImage);
          }
      }
  }, []);

  // Auto-scroll logic
  useEffect(() => {
    if (bottomRef.current && !isFading) {
      setTimeout(() => {
          bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [displayNode, isFading]);

  const onTextComplete = useCallback(() => {
    setTextComplete(true);
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-stretch w-full">
            
        {/* Left Column: Visuals, Stats & Inventory */}
        <div className="w-full md:w-5/12 flex flex-col gap-6">
            
            {/* Stats Panel */}
            <div className="bg-[#0f0c0c] border border-amber-900/30 p-5 rounded shadow-xl backdrop-blur-sm relative overflow-hidden group hover:border-amber-700/40 transition-colors duration-500">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-700/50 to-transparent"></div>
                <StatBar label="Életerő" value={displayStats.hp} max={displayStats.maxHp} color="bg-gradient-to-r from-red-900 via-red-700 to-red-500" icon={<HeartIcon />} />
                <StatBar label="Mana" value={displayStats.mana} max={displayStats.maxMana} color="bg-gradient-to-r from-sky-900 via-sky-600 to-sky-400" icon={<StarIcon />} />
                
                {/* Active Effects Display */}
                {displayEffects.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-amber-900/20">
                     <div className="text-[10px] uppercase tracking-[0.2em] text-amber-500/70 font-bold mb-2">Hatások</div>
                     <div className="flex flex-wrap gap-2">
                        {displayEffects.map((effect, idx) => (
                           <div key={`${effect.id}-${idx}`} className="relative group/effect cursor-help">
                              <div className={`w-8 h-8 rounded border flex items-center justify-center text-lg shadow-lg
                                  ${effect.type === 'debuff' 
                                      ? 'bg-red-950/40 border-red-800 text-red-400' 
                                      : 'bg-emerald-950/40 border-emerald-800 text-emerald-400'}
                              `}>
                                  <span className="animate-pulse">{effect.icon}</span>
                              </div>
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-black border border-amber-900/50 rounded-full flex items-center justify-center text-[9px] font-bold text-gray-300">
                                  {effect.duration}
                              </div>
                              
                              {/* Tooltip */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 bg-stone-900 border border-amber-600/50 rounded p-2 invisible opacity-0 group-hover/effect:visible group-hover/effect:opacity-100 transition-all duration-300 pointer-events-none z-50">
                                    <div className={`font-bold text-xs mb-1 ${effect.type === 'debuff' ? 'text-red-400' : 'text-emerald-400'}`}>{effect.name}</div>
                                    <div className="text-stone-400 text-[10px] leading-tight mb-1">{effect.description}</div>
                                    <div className="text-stone-500 text-[9px]">
                                        {effect.hpPerTurn ? `${effect.hpPerTurn > 0 ? '+' : ''}${effect.hpPerTurn} HP/kör` : ''}
                                        {effect.hpPerTurn && effect.manaPerTurn ? ', ' : ''}
                                        {effect.manaPerTurn ? `${effect.manaPerTurn > 0 ? '+' : ''}${effect.manaPerTurn} Mana/kör` : ''}
                                    </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
                )}
            </div>

            {/* Inventory Panel */}
            <div className="bg-[#0f0c0c] border border-amber-900/30 p-4 rounded shadow-xl backdrop-blur-sm relative overflow-visible group hover:border-amber-700/40 transition-colors duration-500 min-h-[100px]">
                <div className="flex justify-between items-center mb-3 text-xs uppercase tracking-[0.2em] text-amber-300 font-serif font-bold border-b border-amber-900/30 pb-2">
                    <span className="flex items-center gap-2 drop-shadow-[0_2px_2px_rgba(0,0,0,1)]"><BagIcon /> Ereklyék</span>
                    <span className="text-amber-600 text-[10px]">{displayInventory.length} / 6</span>
                </div>
                {displayInventory.length === 0 ? (
                    <div className="text-center text-stone-600 text-xs italic py-4">A zsákod üres.</div>
                ) : (
                    <div className="grid grid-cols-4 gap-2 relative">
                        {displayInventory.map((item, idx) => {
                            // Smart Tooltip Alignment based on grid position (4 columns)
                            const isLeftCol = idx % 4 === 0;
                            const isRightCol = idx % 4 === 3;
                            
                            // Align tooltip to left/right edge if on boundary, otherwise center
                            let tooltipAlignClass = 'left-1/2 -translate-x-1/2';
                            if (isLeftCol) tooltipAlignClass = 'left-0 translate-x-0';
                            if (isRightCol) tooltipAlignClass = 'right-0 translate-x-0';

                            return (
                                <div key={`${item.id}-${idx}`} className="relative group/item z-10 hover:z-50">
                                    <div className="w-full aspect-square bg-[#1a1612] border border-amber-900/40 rounded flex items-center justify-center text-2xl cursor-help hover:bg-[#25201a] hover:border-amber-600 transition-colors">
                                        {item.icon}
                                    </div>
                                    
                                    {/* Tooltip Box - Shifted based on column */}
                                    <div className={`absolute bottom-full mb-2 w-48 bg-stone-900 border border-amber-600/50 rounded p-2 invisible opacity-0 group-hover/item:visible group-hover/item:opacity-100 transition-all duration-300 pointer-events-none shadow-xl z-50 ${tooltipAlignClass}`}>
                                        <div className="text-amber-100 font-bold text-sm mb-1">{item.name}</div>
                                        <div className="text-stone-400 text-xs leading-tight">{item.description}</div>
                                    </div>

                                    {/* Tooltip Arrow - Always centered on the item */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-[3px] w-2 h-2 bg-stone-900 border-r border-b border-amber-600/50 rotate-45 invisible opacity-0 group-hover/item:visible group-hover/item:opacity-100 transition-all duration-300 z-50"></div>
                                </div>
                            );
                        })}
                        {/* Empty Slots Filler - Ensures grid structure remains intact */}
                        {[...Array(Math.max(0, 4 - (displayInventory.length % 4 === 0 && displayInventory.length > 0 ? 4 : displayInventory.length % 4)))].map((_, i) => (
                             <div key={`empty-${i}`} className="w-full aspect-square bg-[#0a0806] border border-amber-900/10 rounded"></div>
                        ))}
                    </div>
                )}
            </div>

            {/* Image Display */}
            <div className="w-full h-72 md:h-auto md:flex-1 bg-[#080808] border-2 border-amber-900/20 rounded relative group overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-amber-600/40 z-20"></div>
                <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-amber-600/40 z-20"></div>
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-amber-600/40 z-20"></div>
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-amber-600/40 z-20"></div>
                
                <div className="w-full h-full relative bg-[#121010] flex items-center justify-center overflow-hidden">
                        
                        {/* 1. LAYER: CSS Visual Placeholder (Always visible, serves as loading state and background) */}
                        <div className="absolute inset-0 z-0">
                            <SceneVisual scene={sceneType} />
                        </div>

                        {/* 2. LAYER: AI Generated Image (Fades in when loaded) */}
                        {currentImage && (
                        <img 
                            src={currentImage}
                            alt="Fantasy Scene"
                            className={`
                                absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-1000
                                ${imageLoaded ? 'opacity-100' : 'opacity-0'}
                            `}
                            loading="eager"
                            onLoad={() => setImageLoaded(true)}
                        />
                        )}
                        
                        {/* Overlay Shadow */}
                        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_60px_rgba(0,0,0,0.8)] z-20"></div>
                </div>
            </div>
        </div>

        {/* Right Column: Text & Choices */}
        <div className="w-full md:w-7/12 flex flex-col">
                <div className="flex-1 bg-[#0a0a0a] border-y md:border border-amber-900/30 md:rounded p-6 md:p-8 relative shadow-2xl flex flex-col">
                <div className={`
                    flex-1 font-sans text-lg md:text-xl leading-8 text-amber-50 font-medium tracking-wide text-justify mb-8 drop-shadow-md
                    transition-all duration-700 ease-out
                    ${!isFading ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                `}>
                    {error ? (
                        <div className="text-red-400 bg-red-950/40 p-4 border border-red-800 rounded font-bold">{error}</div>
                    ) : (
                        <TypewriterText 
                            text={displayNode.text} 
                            speed={25}
                            delay={100} // Small delay after fade in
                            onComplete={onTextComplete}
                        />
                    )}
                </div>

                <div className={`
                    flex flex-col gap-4 mt-auto
                    transition-all duration-500 delay-100
                    ${!isFading ? 'opacity-100' : 'opacity-0'}
                `}>
                    <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-amber-900/40 to-transparent mb-4"></div>
                    
                    {isLoading ? (
                        <div className="text-center py-6">
                            <span className="text-amber-500 animate-pulse text-sm tracking-[0.3em] font-bold">A SORS DÖNT...</span>
                        </div>
                    ) : (
                        displayNode.choices.map((choice, idx) => (
                            <button
                                key={choice.id}
                                onClick={() => onChoice(choice)}
                                disabled={!textComplete}
                                style={{ animationDelay: `${idx * 100}ms` }}
                                className={`
                                    group relative overflow-hidden p-[1px] rounded transition-all duration-300
                                    ${!textComplete ? 'opacity-40 cursor-not-allowed grayscale' : 'opacity-100 hover:-translate-y-0.5'}
                                `}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-amber-800 via-amber-600 to-amber-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative bg-[#111] hover:bg-[#1a1a1a] p-4 flex items-center justify-between rounded transition-colors border border-amber-800/40 group-hover:border-transparent">
                                    <span className="font-serif text-gray-200 group-hover:text-white text-lg font-bold transition-colors tracking-wide">
                                        {choice.text}
                                    </span>
                                    <span className="text-amber-600 group-hover:text-amber-300 transition-colors opacity-75 group-hover:opacity-100">
                                        ✦
                                    </span>
                                </div>
                            </button>
                        ))
                    )}
                </div>
                </div>
        </div>
        <div ref={bottomRef} />
    </div>
  );
};

export default GameScene;