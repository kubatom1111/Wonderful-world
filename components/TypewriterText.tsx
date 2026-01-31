import React, { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  delay?: number;
  onComplete?: () => void;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({ text, speed = 40, delay = 0, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    let intervalId: ReturnType<typeof setInterval>;
    
    // Start typing after the specified delay
    const startTimeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        if (i < text.length) {
          const char = text.charAt(i);
          setDisplayedText((prev) => prev + char);
          i++;
        } else {
          clearInterval(intervalId);
          if (onComplete) onComplete();
        }
      }, speed);
    }, delay);

    return () => {
      clearTimeout(startTimeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [text, speed, delay, onComplete]);

  return <p className="leading-relaxed min-h-[1.5em]">{displayedText}</p>;
};

export default TypewriterText;