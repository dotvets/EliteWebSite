import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

type CountingNumberProps = {
  target: number;
  duration?: number;
};

export function CountingNumber({ target, duration = 3 }: CountingNumberProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { amount: 0.3 });
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (isInView) {
      setCount(0);
      
      const startTime = Date.now();
      const endTime = startTime + duration * 1000;

      const updateCount = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / (duration * 1000), 1);
        
        const easeInOutCubic = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        const currentCount = Math.floor(easeInOutCubic * target);
        
        setCount(currentCount);

        if (now < endTime) {
          animationRef.current = requestAnimationFrame(updateCount);
        } else {
          setCount(target);
        }
      };

      animationRef.current = requestAnimationFrame(updateCount);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [isInView, target, duration]);

  return (
    <div ref={ref} className="text-4xl lg:text-5xl font-bold font-heading text-primary">
      {count.toLocaleString()}
    </div>
  );
}
