import { useMemo } from 'react';
import { motion } from 'framer-motion';

type ShapeProps = {
  color: string;
  size: number;
  top: string;
  left: string;
  duration: number;
  delay: number;
};

const RegularPaw = ({ color, size, top, left, duration, delay }: ShapeProps) => {
  return (
    <motion.div
      className="absolute"
      style={{
        top,
        left,
        width: `${size}px`,
        height: `${size}px`,
        opacity: 0.35,
      }}
      animate={{
        y: [0, -20, 0],
        x: [0, 10, -10, 0],
        rotate: [0, 5, -5, 0],
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
        {/* Main pad */}
        <ellipse cx="50" cy="65" rx="18" ry="22" />
        {/* Top toe */}
        <circle cx="50" cy="35" r="10" />
        {/* Left toe */}
        <circle cx="35" cy="42" r="10" />
        {/* Right toe */}
        <circle cx="65" cy="42" r="10" />
        {/* Far left toe */}
        <circle cx="28" cy="55" r="8" />
      </svg>
    </motion.div>
  );
};

const HeartPaw = ({ color, size, top, left, duration, delay }: ShapeProps) => {
  return (
    <motion.div
      className="absolute"
      style={{
        top,
        left,
        width: `${size}px`,
        height: `${size}px`,
        opacity: 0.35,
      }}
      animate={{
        y: [0, -25, 0],
        x: [0, 12, -12, 0],
        rotate: [0, -5, 5, 0],
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
        {/* Heart-shaped main pad */}
        <path d="M 50 75 C 50 75, 35 65, 35 52 C 35 45, 40 40, 45 40 C 48 40, 50 42, 50 45 C 50 42, 52 40, 55 40 C 60 40, 65 45, 65 52 C 65 65, 50 75, 50 75 Z" />
        {/* Top toe */}
        <circle cx="50" cy="30" r="9" />
        {/* Left toe */}
        <circle cx="36" cy="36" r="9" />
        {/* Right toe */}
        <circle cx="64" cy="36" r="9" />
        {/* Far left toe */}
        <circle cx="27" cy="48" r="7" />
      </svg>
    </motion.div>
  );
};

type ShapeElement = {
  id: string;
  type: string;
  color: string;
  size: number;
  top: string;
  left: string;
  duration: number;
  delay: number;
};

export default function AnimatedServicesBackground() {
  const brandColors = [
    '#7760a8',
    '#9d9ea0',
    '#8875b3',
    '#6650a0',
  ];

  const elements = useMemo(() => {
    const items: ShapeElement[] = [];
    
    // Create regular paw prints
    for (let i = 0; i < 20; i++) {
      items.push({
        id: `regular-paw-${i}`,
        type: 'regular',
        color: brandColors[Math.floor(Math.random() * brandColors.length)],
        size: Math.random() * 35 + 50,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        duration: Math.random() * 12 + 18,
        delay: Math.random() * 6,
      });
    }
    
    // Create heart paw prints
    for (let i = 0; i < 12; i++) {
      items.push({
        id: `heart-paw-${i}`,
        type: 'heart',
        color: brandColors[Math.floor(Math.random() * brandColors.length)],
        size: Math.random() * 35 + 50,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        duration: Math.random() * 12 + 18,
        delay: Math.random() * 6,
      });
    }
    
    return items;
  }, []);

  const renderShape = (element: ShapeElement) => {
    const shapeProps = {
      color: element.color,
      size: element.size,
      top: element.top,
      left: element.left,
      duration: element.duration,
      delay: element.delay,
    };

    if (element.type === 'heart') {
      return <HeartPaw key={element.id} {...shapeProps} />;
    }
    return <RegularPaw key={element.id} {...shapeProps} />;
  };

  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden" 
      style={{ zIndex: 1 }}
      data-testid="animated-background"
    >
      {elements.map((element) => renderShape(element))}
    </div>
  );
}
