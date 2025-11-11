import { useMemo } from 'react';
import { motion } from 'framer-motion';

const Cat = ({ color, size, top, left, duration, delay }: {
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
        opacity: 0.5,
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
        {/* Cat silhouette */}
        <ellipse cx="50" cy="60" rx="25" ry="30" />
        <circle cx="50" cy="35" r="20" />
        <polygon points="30,15 25,5 35,25" />
        <polygon points="70,15 75,5 65,25" />
        <circle cx="42" cy="32" r="3" fill="#fff" opacity="0.8" />
        <circle cx="58" cy="32" r="3" fill="#fff" opacity="0.8" />
        <path d="M 35 65 Q 42 70, 50 68 Q 58 70, 65 65" stroke={color} strokeWidth="2" fill="none" opacity="0.6" />
      </svg>
    </motion.div>
  );
};

const Dog = ({ color, size, top, left, duration, delay }: {
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
        opacity: 0.5,
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
        viewBox="0 0 100 100"
        fill={color}
        width="100%"
        height="100%"
      >
        {/* Dog silhouette */}
        <ellipse cx="50" cy="65" rx="28" ry="25" />
        <ellipse cx="52" cy="38" rx="22" ry="20" />
        <ellipse cx="32" cy="28" rx="8" ry="14" transform="rotate(-30 32 28)" />
        <ellipse cx="68" cy="28" rx="8" ry="14" transform="rotate(30 68 28)" />
        <circle cx="43" cy="35" r="3" fill="#fff" opacity="0.8" />
        <circle cx="57" cy="35" r="3" fill="#fff" opacity="0.8" />
        <ellipse cx="50" cy="45" rx="4" ry="6" fill="#333" opacity="0.6" />
        <path d="M 50 50 Q 45 55, 42 53 M 50 50 Q 55 55, 58 53" stroke={color} strokeWidth="2" fill="none" opacity="0.6" />
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
        id: `cat-${i}`,
        type: 'cat',
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
        id: `dog-${i}`,
        type: 'dog',
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
      style={{ zIndex: 1 }}
      data-testid="animated-background"
    >
      {elements.map((element) => (
        element.type === 'cat' ? (
          <Cat
            key={element.id}
            color={element.color}
            size={element.size}
            top={element.top}
            left={element.left}
            duration={element.duration}
            delay={element.delay}
          />
        ) : (
          <Dog
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
