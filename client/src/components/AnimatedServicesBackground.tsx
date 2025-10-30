import { useMemo } from 'react';
import { motion } from 'framer-motion';

const PawPrint = ({ color, size, top, left, duration, delay }: {
  color: string;
  size: number;
  top: string;
  left: string;
  duration: number;
  delay: number;
}) => {
  return (
    <motion.div
      className="absolute"
      style={{
        top,
        left,
        width: `${size}px`,
        height: `${size}px`,
        opacity: 0.25,
      }}
      animate={{
        y: [0, -30, 0],
        x: [0, 15, -15, 0],
        rotate: [0, 10, -10, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <svg
        viewBox="0 0 100 100"
        fill={color}
        width="100%"
        height="100%"
      >
        <path d="M 30 65 Q 30 45, 50 45 Q 70 45, 70 65 Q 72 80, 60 85 Q 50 90, 40 85 Q 28 80, 30 65 Z" />
        <ellipse cx="50" cy="20" rx="8" ry="12" />
        <ellipse cx="28" cy="32" rx="7" ry="11" transform="rotate(-25 28 32)" />
        <ellipse cx="72" cy="32" rx="7" ry="11" transform="rotate(25 72 32)" />
        <ellipse cx="18" cy="50" rx="6" ry="10" transform="rotate(-35 18 50)" />
        <ellipse cx="82" cy="50" rx="6" ry="10" transform="rotate(35 82 50)" />
      </svg>
    </motion.div>
  );
};

const Bone = ({ color, size, top, left, duration, delay }: {
  color: string;
  size: number;
  top: string;
  left: string;
  duration: number;
  delay: number;
}) => {
  return (
    <motion.div
      className="absolute"
      style={{
        top,
        left,
        width: `${size}px`,
        height: `${size}px`,
        opacity: 0.25,
      }}
      animate={{
        y: [0, 30, 0],
        x: [0, -15, 15, 0],
        rotate: [0, -10, 10, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <svg
        viewBox="0 0 100 50"
        fill={color}
        width="100%"
        height="100%"
      >
        <circle cx="12" cy="18" r="8" />
        <circle cx="12" cy="32" r="8" />
        <circle cx="88" cy="18" r="8" />
        <circle cx="88" cy="32" r="8" />
        <rect x="16" y="20" width="68" height="10" rx="5" ry="5" />
      </svg>
    </motion.div>
  );
};

export default function AnimatedServicesBackground() {
  const brandColors = [
    '#7760a8',
    '#9d9ea0',
    '#8875b3',
    '#6650a0',
  ];

  const elements = useMemo(() => {
    const items = [];
    
    for (let i = 0; i < 12; i++) {
      items.push({
        id: `paw-${i}`,
        type: 'paw',
        color: brandColors[Math.floor(Math.random() * brandColors.length)],
        size: Math.random() * 40 + 60,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        duration: Math.random() * 10 + 15,
        delay: Math.random() * 5,
      });
    }
    
    for (let i = 0; i < 6; i++) {
      items.push({
        id: `bone-${i}`,
        type: 'bone',
        color: brandColors[Math.floor(Math.random() * brandColors.length)],
        size: Math.random() * 40 + 60,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        duration: Math.random() * 10 + 15,
        delay: Math.random() * 5,
      });
    }
    
    return items;
  }, []);

  console.log('AnimatedServicesBackground rendered with', elements.length, 'elements');

  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden" 
      style={{ zIndex: 0 }}
      data-testid="animated-background"
    >
      {elements.map((element) => (
        element.type === 'paw' ? (
          <PawPrint
            key={element.id}
            color={element.color}
            size={element.size}
            top={element.top}
            left={element.left}
            duration={element.duration}
            delay={element.delay}
          />
        ) : (
          <Bone
            key={element.id}
            color={element.color}
            size={element.size}
            top={element.top}
            left={element.left}
            duration={element.duration}
            delay={element.delay}
          />
        )
      ))}
    </div>
  );
}
