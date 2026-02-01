import React from 'react';

interface SceneVisualProps {
  scene: string;
}

const SceneVisual: React.FC<SceneVisualProps> = ({ scene }) => {
  // Render different visual compositions based on scene key
  const renderVisual = () => {
    switch (scene) {
      case 'intro':
        return (
          <div className="absolute inset-0 bg-black overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1a103c_0%,#000000_100%)] opacity-80"></div>
            {/* Stars */}
            {[...Array(20)].map((_, i) => (
              <div 
                key={i}
                className="absolute bg-white rounded-full animate-pulse-slow"
                style={{
                  width: Math.random() * 2 + 1 + 'px',
                  height: Math.random() * 2 + 1 + 'px',
                  top: Math.random() * 100 + '%',
                  left: Math.random() * 100 + '%',
                  opacity: Math.random() * 0.7 + 0.3,
                  animationDelay: Math.random() * 5 + 's'
                }}
              ></div>
            ))}
             <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-64 h-64 bg-purple-900/20 blur-[80px] rounded-full animate-pulse"></div>
             </div>
          </div>
        );
      
      case 'goddess':
        return (
          <div className="absolute inset-0 bg-black overflow-hidden flex items-center justify-center">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#222_0%,#000_100%)]"></div>
             {/* Divine Light */}
             <div className="w-2 h-full bg-white blur-xl opacity-60"></div>
             <div className="absolute w-32 h-32 bg-amber-100 rounded-full blur-[60px] animate-pulse"></div>
             <div className="absolute w-64 h-64 bg-amber-500/10 rounded-full blur-[80px]"></div>
             {/* Silhouette hint */}
             <div className="absolute w-12 h-32 bg-black blur-md rounded-full mt-10 opacity-70"></div>
          </div>
        );

      case 'forest':
        return (
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-green-950 to-black overflow-hidden">
            {/* Fog */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 z-10"></div>
            {/* Trees (Abstract Triangles) */}
            <div className="absolute bottom-0 left-[10%] w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-b-[200px] border-b-[#051a05] opacity-80"></div>
            <div className="absolute bottom-0 right-[20%] w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-b-[250px] border-b-[#031103] opacity-90"></div>
            <div className="absolute bottom-0 left-[40%] w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[150px] border-b-[#061e06] opacity-60"></div>
            {/* Moon Glow */}
            <div className="absolute top-10 right-10 w-16 h-16 bg-purple-200/10 rounded-full blur-xl"></div>
          </div>
        );

      case 'wolf':
        return (
          <div className="absolute inset-0 bg-[#050505] overflow-hidden flex items-center justify-center">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,#1a0000_0%,#000000_70%)]"></div>
             {/* Eyes */}
             <div className="flex gap-16 mt-10">
                <div className="w-4 h-4 bg-red-600 rounded-full blur-[2px] shadow-[0_0_20px_rgba(220,38,38,0.8)] animate-pulse"></div>
                <div className="w-4 h-4 bg-red-600 rounded-full blur-[2px] shadow-[0_0_20px_rgba(220,38,38,0.8)] animate-pulse" style={{ animationDelay: '0.5s' }}></div>
             </div>
             {/* Teeth Hint */}
             <div className="absolute mt-32 flex gap-2 opacity-30">
                <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[20px] border-t-gray-300"></div>
                <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[20px] border-t-gray-300 ml-8"></div>
             </div>
          </div>
        );

      case 'fire':
        return (
          <div className="absolute inset-0 bg-black overflow-hidden flex items-end justify-center">
             {/* Fire Glow */}
             <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-orange-900/60 to-transparent"></div>
             <div className="absolute bottom-[-50px] w-64 h-64 bg-orange-600/30 rounded-full blur-[80px] animate-pulse"></div>
             
             {/* Particles */}
             {[...Array(10)].map((_, i) => (
                <div 
                   key={i}
                   className="absolute bottom-0 w-1 h-1 bg-orange-400 rounded-full animate-bounce"
                   style={{
                      left: 40 + Math.random() * 20 + '%',
                      animationDuration: 1 + Math.random() + 's',
                      opacity: Math.random()
                   }}
                ></div>
             ))}
          </div>
        );
      
      case 'city':
        return (
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-black overflow-hidden flex items-end">
             {/* Sky */}
             <div className="absolute top-0 w-full h-full bg-[linear-gradient(to_bottom,#0f172a_0%,#000000_100%)]"></div>
             <div className="absolute top-1/3 w-full h-64 bg-amber-100/5 blur-[100px] rounded-full"></div>
             
             {/* Silhouette Skyline */}
             <div className="relative w-full h-32 flex items-end justify-center opacity-80 z-10 gap-1">
                 <div className="w-10 h-20 bg-black"></div>
                 <div className="w-14 h-32 bg-black"></div>
                 <div className="w-8 h-16 bg-black"></div>
                 <div className="w-20 h-40 bg-black relative">
                     {/* Windows */}
                     <div className="absolute top-4 left-4 w-1 h-1 bg-amber-500/50"></div>
                     <div className="absolute top-10 right-4 w-1 h-1 bg-amber-500/50"></div>
                 </div>
                 <div className="w-12 h-24 bg-black"></div>
             </div>
          </div>
        );
        
      case 'tavern':
          return (
            <div className="absolute inset-0 bg-[#1a0f00] overflow-hidden flex items-center justify-center">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#4a2c00_0%,#000000_100%)] opacity-80"></div>
               {/* Warm Glow */}
               <div className="w-full h-full absolute inset-0 bg-amber-900/20 backdrop-blur-[2px]"></div>
               <div className="w-32 h-32 bg-orange-500/20 rounded-full blur-[40px] animate-pulse"></div>
               {/* Candle */}
               <div className="absolute mt-20 w-4 h-12 bg-stone-800 rounded opacity-60">
                   <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-2 h-4 bg-orange-400 rounded-full blur-[2px] animate-pulse"></div>
               </div>
            </div>
          );

      case 'hiding':
          return (
            <div className="absolute inset-0 bg-black overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-green-950/30 to-black"></div>
                {/* Obscuring branches */}
                <div className="absolute top-0 left-0 w-full h-32 bg-black blur-xl -rotate-6 scale-110 opacity-90"></div>
                <div className="absolute top-0 right-0 w-1/2 h-full bg-black blur-2xl rotate-12 opacity-80"></div>
            </div>
          );

      default:
        return (
           <div className="absolute inset-0 bg-black flex items-center justify-center">
               <div className="text-amber-900/20 text-4xl">✦</div>
           </div>
        );
    }
  };

  return (
    <div className="w-full h-full relative animate-fade-in-scale">
      {renderVisual()}
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay pointer-events-none"></div>
      <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.9)] pointer-events-none"></div>
    </div>
  );
};

export default SceneVisual;