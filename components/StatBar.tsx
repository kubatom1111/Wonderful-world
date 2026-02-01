import React from 'react';

interface StatBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
  icon: React.ReactNode;
}

const StatBar: React.FC<StatBarProps> = ({ label, value, max, color, icon }) => {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div className="flex flex-col w-full mb-4 group">
      <div className="flex justify-between items-end mb-2 text-xs uppercase tracking-[0.2em] text-amber-300 font-serif font-bold group-hover:text-amber-100 transition-colors duration-300">
        <span className="flex items-center gap-2 drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">{icon} {label}</span>
        <span className="font-sans text-amber-200 group-hover:text-white transition-colors font-semibold text-sm drop-shadow-md">{value} / {max}</span>
      </div>
      
      <div className="relative w-full h-2 bg-[#0a0500] rounded-full overflow-hidden border border-amber-900/50 shadow-inner">
        {/* Background pulsing glow */}
        <div className={`absolute top-0 left-0 bottom-0 w-full opacity-40 ${color} blur-sm transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
        
        {/* The actual bar */}
        <div 
          className={`relative h-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(0,0,0,0.6)] ${color}`} 
          style={{ width: `${percentage}%` }}
        >
          {/* Shine effect on top */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/60 opacity-60"></div>
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-black/30"></div>
        </div>
      </div>
    </div>
  );
};

export default StatBar;