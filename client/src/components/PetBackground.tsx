import { motion } from "framer-motion";
import petCollar from "@assets/1_1762951684781.png";
import petBone from "@assets/2_1762951684782.png";
import petPaws from "@assets/3_1762951684783.png";

export default function PetBackground() {
  const shapes = [petCollar, petBone, petPaws];

  const randomMotion = () => {
    const xMove = Math.random() * 80 - 40;
    const yMove = Math.random() * 80 - 40;
    const rotate = Math.random() * 15 - 7;
    return { xMove, yMove, rotate };
  };

  const elements = Array.from({ length: 15 });

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[1]">
      {elements.map((_, i) => {
        const src = shapes[Math.floor(Math.random() * shapes.length)];
        const size = 40 + Math.random() * 90;
        const top = `${Math.random() * 100}%`;
        const left = `${Math.random() * 100}%`;
        const duration = 14 + Math.random() * 8;
        const delay = Math.random() * 3;
        const { xMove, yMove, rotate } = randomMotion();

        return (
          <motion.img
            key={i}
            src={src}
            alt="pet shape"
            className="absolute select-none will-change-transform"
            style={{
              top,
              left,
              width: size,
              height: size,
              opacity: 0.25,
            }}
            animate={{
              x: [0, xMove, -xMove, 0],
              y: [0, yMove, -yMove, 0],
              rotate: [0, rotate, -rotate, 0],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
}
