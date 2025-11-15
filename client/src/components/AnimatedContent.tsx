import { motion, Variants } from "framer-motion";

// Animation variants
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

// Viewport configurations
export const VIEWPORT_CONFIG_DEFAULT = { once: false, amount: 0.3 };
export const VIEWPORT_CONFIG_STAGGER = { once: false, amount: 0.2 };

interface AnimatedContentProps {
  children: React.ReactNode;
  className?: string;
  variant?: "fadeInUp" | "stagger";
  viewport?: "default" | "stagger";
}

export function AnimatedContent({ 
  children, 
  className = "", 
  variant = "fadeInUp",
  viewport = "default"
}: AnimatedContentProps) {
  const variants = variant === "stagger" ? staggerContainer : fadeInUp;
  const viewportConfig = viewport === "stagger" ? VIEWPORT_CONFIG_STAGGER : VIEWPORT_CONFIG_DEFAULT;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      variants={variants}
      viewport={viewportConfig}
      className={className}
    >
      {children}
    </motion.div>
  );
}
