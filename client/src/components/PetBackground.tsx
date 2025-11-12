import { motion } from "framer-motion";
import petCollar from "@assets/generated_images/Pet_collar_transparent_icon_d68ad5d1.png";
import petBone from "@assets/generated_images/Dog_bone_transparent_icon_cc0c591e.png";
import petPaws from "@assets/generated_images/Paw_print_transparent_icon_d0e5306b.png";

export default function PetBackground() {
  const shapes = [petCollar, petBone, petPaws];

  const randomMotion = () => {
    const xMove = Math.random() * 80 - 40;
    const yMove = Math.random() * 80 - 40;
    const rotate = Math.random() * 15 - 7;
    return { xMove, yMove, rotate };
  };

  const elements = Array.from({ length: 8 });

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
              opacity: 0.12,
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
