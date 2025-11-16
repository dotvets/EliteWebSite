import { motion, Variants } from "framer-motion";
import * as animations from "@/animations";

// Viewport configurations
export const VIEWPORT_CONFIG_DEFAULT = { once: false, amount: 0.3 };
export const VIEWPORT_CONFIG_STAGGER = { once: false, amount: 0.2 };

// Legacy exports for backward compatibility
export const fadeInUp = animations.fadeInUp;
export const staggerContainer = animations.staggerContainer;

// Animation variant mapping
const variantMap: Record<string, Variants> = {
  fadeIn: animations.fadeIn,
  fadeInUp: animations.fadeInUp,
  fadeInDown: animations.fadeInDown,
  slideLeft: animations.slideLeft,
  slideRight: animations.slideRight,
  zoomIn: animations.zoomIn,
  zoomInSoft: animations.zoomInSoft,
  staggerContainer: animations.staggerContainer,
  staggerList: animations.staggerList,
  staggerGrid: animations.staggerGrid,
  stagger: animations.staggerContainer,
};

type VariantName = keyof typeof variantMap;

interface AnimatedContentProps {
  children: React.ReactNode;
  className?: string;
  variant?: VariantName | "custom";
  customVariants?: Variants;
  viewport?: "default" | "stagger" | { once: boolean; amount: number };
}

export function AnimatedContent({ 
  children, 
  className = "", 
  variant = "fadeInUp",
  customVariants,
  viewport = "default"
}: AnimatedContentProps) {
  let variants: Variants;
  
  if (variant === "custom" && customVariants) {
    variants = customVariants;
  } else if (variant === "custom" && !customVariants) {
    console.warn(`AnimatedContent: variant="custom" requires customVariants prop. Falling back to fadeInUp.`);
    variants = animations.fadeInUp;
  } else if (variantMap[variant]) {
    variants = variantMap[variant];
  } else {
    console.warn(`AnimatedContent: Unknown variant "${variant}". Falling back to fadeInUp. Available variants: ${Object.keys(variantMap).join(", ")}`);
    variants = animations.fadeInUp;
  }
  
  const viewportConfig = typeof viewport === "object" 
    ? viewport 
    : viewport === "stagger" 
      ? VIEWPORT_CONFIG_STAGGER 
      : VIEWPORT_CONFIG_DEFAULT;

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
