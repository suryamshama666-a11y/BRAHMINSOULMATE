import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';

interface FloatingHeart {
  id: number;
  left: number;
  animationDuration: number;
  size: number;
  color: string;
  delay: number;
}

interface HeartsAnimationProps {
  isActive?: boolean;
  intensity?: 'low' | 'medium' | 'high';
}

export const HeartsAnimation: React.FC<HeartsAnimationProps> = ({ 
  isActive = true, 
  intensity = 'medium' 
}) => {
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);

  const heartColors = [
    '#FF69B4', // Hot Pink
    '#FF1493', // Deep Pink
    '#DC143C', // Crimson
    '#FF6347', // Tomato
    '#FF4500', // Orange Red
    '#FFB6C1', // Light Pink
    '#FFC0CB', // Pink
    '#E30613', // Brand Red
  ];

  const intensitySettings = {
    low: { count: 3, interval: 3000 },
    medium: { count: 5, interval: 2000 },
    high: { count: 8, interval: 1500 }
  };

  const createHeart = (): FloatingHeart => {
    const side = Math.random() > 0.5 ? 'left' : 'right';
    const baseLeft = side === 'left' ? Math.random() * 15 : 85 + Math.random() * 15;
    
    return {
      id: Date.now() + Math.random(),
      left: baseLeft,
      animationDuration: 3000 + Math.random() * 2000, // 3-5 seconds
      size: 20 + Math.random() * 15, // 20-35px
      color: heartColors[Math.floor(Math.random() * heartColors.length)],
      delay: Math.random() * 1000, // 0-1 second delay
    };
  };

  useEffect(() => {
    if (!isActive) return;

    const settings = intensitySettings[intensity];
    
    // Create initial hearts
    const initialHearts = Array.from({ length: settings.count }, createHeart);
    setHearts(initialHearts);

    // Create new hearts periodically
    const interval = setInterval(() => {
      const newHeart = createHeart();
      setHearts(prev => [...prev, newHeart]);
      
      // Remove old hearts to prevent memory leaks
      setTimeout(() => {
        setHearts(prev => prev.filter(heart => heart.id !== newHeart.id));
      }, newHeart.animationDuration + 1000);
    }, settings.interval);

    return () => clearInterval(interval);
  }, [isActive, intensity]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute bottom-0 animate-float-up"
          style={{
            left: `${heart.left}%`,
            animationDuration: `${heart.animationDuration}ms`,
            animationDelay: `${heart.delay}ms`,
            fontSize: `${heart.size}px`,
            color: heart.color,
          }}
        >
          <Heart 
            className="fill-current animate-pulse-gentle" 
            style={{
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
              animation: `pulse-gentle 2s infinite ease-in-out`
            }}
          />
        </div>
      ))}
    </div>
  );
};

// Floating hearts that appear on click/interaction
interface InteractiveHeartsProps {
  triggerCount: number;
  onComplete?: () => void;
}

export const InteractiveHearts: React.FC<InteractiveHeartsProps> = ({ 
  triggerCount, 
  onComplete 
}) => {
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);

  useEffect(() => {
    if (triggerCount === 0) return;

    // Create burst of hearts
    const burstHearts = Array.from({ length: 5 + Math.random() * 5 }, () => ({
      id: Date.now() + Math.random(),
      left: 45 + Math.random() * 10, // Center area
      animationDuration: 2000 + Math.random() * 1000,
      size: 15 + Math.random() * 10,
      color: '#FF69B4',
      delay: Math.random() * 200,
    }));

    setHearts(burstHearts);

    // Clean up after animation
    setTimeout(() => {
      setHearts([]);
      onComplete?.();
    }, 3000);
  }, [triggerCount, onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute bottom-1/2 animate-burst-up"
          style={{
            left: `${heart.left}%`,
            animationDuration: `${heart.animationDuration}ms`,
            animationDelay: `${heart.delay}ms`,
            fontSize: `${heart.size}px`,
            color: heart.color,
          }}
        >
          <Heart className="fill-current" />
        </div>
      ))}
    </div>
  );
};
