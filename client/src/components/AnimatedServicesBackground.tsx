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

const PawPrint = ({ color, size, top, left, duration, delay }: ShapeProps) => {
  return (
    <motion.div
      className="absolute"
      style={{
        top,
        left,
        width: `${size}px`,
        height: `${size}px`,
        opacity: 0.4,
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
        <ellipse cx="50" cy="65" rx="18" ry="22" />
        <circle cx="35" cy="42" r="10" />
        <circle cx="50" cy="35" r="10" />
        <circle cx="65" cy="42" r="10" />
        <circle cx="28" cy="55" r="8" />
      </svg>
    </motion.div>
  );
};

const Triangle = ({ color, size, top, left, duration, delay }: ShapeProps) => {
  return (
    <motion.div
      className="absolute"
      style={{
        top,
        left,
        width: `${size}px`,
        height: `${size}px`,
        opacity: 0.4,
      }}
      animate={{
        y: [0, 25, 0],
        x: [0, -12, 12, 0],
        rotate: [0, -8, 8, 0],
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
        stroke={color}
        fill="none"
        strokeWidth="6"
        width="100%"
        height="100%"
      >
        <polygon points="50,20 20,80 80,80" />
      </svg>
    </motion.div>
  );
};

const Spiral = ({ color, size, top, left, duration, delay }: ShapeProps) => {
  return (
    <motion.div
      className="absolute"
      style={{
        top,
        left,
        width: `${size}px`,
        height: `${size}px`,
        opacity: 0.4,
      }}
      animate={{
        y: [0, -15, 0],
        x: [0, 15, -15, 0],
        rotate: [0, 360],
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
        stroke={color}
        fill="none"
        strokeWidth="5"
        strokeLinecap="round"
        width="100%"
        height="100%"
      >
        <path d="M 50 50 Q 60 40, 65 50 Q 70 60, 60 70 Q 50 80, 35 70 Q 20 60, 25 45 Q 30 30, 50 30" />
      </svg>
    </motion.div>
  );
};

const WavyLine = ({ color, size, top, left, duration, delay }: ShapeProps) => {
  return (
    <motion.div
      className="absolute"
      style={{
        top,
        left,
        width: `${size}px`,
        height: `${size * 0.6}px`,
        opacity: 0.4,
      }}
      animate={{
        y: [0, 20, 0],
        x: [0, -10, 10, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <svg
        viewBox="0 0 100 60"
        stroke={color}
        fill="none"
        strokeWidth="5"
        strokeLinecap="round"
        width="100%"
        height="100%"
      >
        <path d="M 10 30 Q 25 15, 40 30 T 70 30 T 90 30" />
      </svg>
    </motion.div>
  );
};

const PlusSign = ({ color, size, top, left, duration, delay }: ShapeProps) => {
  return (
    <motion.div
      className="absolute"
      style={{
        top,
        left,
        width: `${size}px`,
        height: `${size}px`,
        opacity: 0.4,
      }}
      animate={{
        y: [0, -18, 0],
        rotate: [0, 90, 180, 270, 360],
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
        stroke={color}
        fill="none"
        strokeWidth="6"
        strokeLinecap="round"
        width="100%"
        height="100%"
      >
        <line x1="50" y1="20" x2="50" y2="80" />
        <line x1="20" y1="50" x2="80" y2="50" />
      </svg>
    </motion.div>
  );
};

const XMark = ({ color, size, top, left, duration, delay }: ShapeProps) => {
  return (
    <motion.div
      className="absolute"
      style={{
        top,
        left,
        width: `${size}px`,
        height: `${size}px`,
        opacity: 0.4,
      }}
      animate={{
        y: [0, 22, 0],
        x: [0, 12, -12, 0],
        rotate: [0, -45, 45, 0],
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
        stroke={color}
        fill="none"
        strokeWidth="6"
        strokeLinecap="round"
        width="100%"
        height="100%"
      >
        <line x1="25" y1="25" x2="75" y2="75" />
        <line x1="75" y1="25" x2="25" y2="75" />
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
    const items: ShapeElement[] = [];
    const shapeTypes = ['paw', 'triangle', 'spiral', 'wavy', 'plus', 'x'];
    const shapeCounts = {
      paw: 8,
      triangle: 6,
      spiral: 5,
      wavy: 5,
      plus: 4,
      x: 4,
    };
    
    shapeTypes.forEach((shapeType) => {
      const count = shapeCounts[shapeType as keyof typeof shapeCounts];
      for (let i = 0; i < count; i++) {
        items.push({
          id: `${shapeType}-${i}`,
          type: shapeType,
          color: brandColors[Math.floor(Math.random() * brandColors.length)],
          size: Math.random() * 35 + 45,
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          duration: Math.random() * 12 + 18,
          delay: Math.random() * 6,
        });
      }
    });
    
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

    switch (element.type) {
      case 'paw':
        return <PawPrint key={element.id} {...shapeProps} />;
      case 'triangle':
        return <Triangle key={element.id} {...shapeProps} />;
      case 'spiral':
        return <Spiral key={element.id} {...shapeProps} />;
      case 'wavy':
        return <WavyLine key={element.id} {...shapeProps} />;
      case 'plus':
        return <PlusSign key={element.id} {...shapeProps} />;
      case 'x':
        return <XMark key={element.id} {...shapeProps} />;
      default:
        return null;
    }
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
