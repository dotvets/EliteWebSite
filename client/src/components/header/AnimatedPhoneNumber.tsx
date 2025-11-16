import { motion } from "framer-motion";

interface AnimatedPhoneNumberProps {
  number: string;
}

export function AnimatedPhoneNumber({ number }: AnimatedPhoneNumberProps) {
  return (
    <span dir="ltr" className="flex gap-1">
      {Array.from(number).map((digit, index) => (
        <motion.span
          key={index}
          animate={{
            scale: [1, 1.8, 1],
          }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            delay: index * 0.15,
            repeatDelay: 1.5,
            ease: "easeInOut",
          }}
          className="inline-block"
        >
          {digit}
        </motion.span>
      ))}
    </span>
  );
}
