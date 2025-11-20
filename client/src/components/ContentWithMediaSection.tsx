import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useInView } from "framer-motion";

interface ContentWithMediaSectionProps {
  image?: string;
  imageAlt?: string;
  children: React.ReactNode;
  reverse?: boolean;
  className?: string;
  imageTestId?: string;
}

export default function ContentWithMediaSection({
  image,
  imageAlt = "",
  children,
  reverse = false,
  className = "",
  imageTestId = "img-section",
}: ContentWithMediaSectionProps) {
  const ref = useRef(null);
  const imageRef = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.2 });
  const isImageFullyVisible = useInView(imageRef, { once: false, amount: 0.9 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const hasImage = Boolean(image);

  return (
    <div className={`py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 ${className}`}>
      <motion.div
        ref={ref}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto overflow-x-hidden"
      >
        <div className={`grid gap-6 sm:gap-8 md:gap-12 items-center ${hasImage ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Image Column - Only render if image is provided */}
          {hasImage && (
            <motion.div
              initial={{ opacity: 0, x: reverse ? 50 : -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: reverse ? 50 : -50 }}
              transition={{ duration: 0.6 }}
              className={reverse ? 'lg:order-2' : 'lg:order-1'}
            >
              <div ref={imageRef} className="overflow-hidden rounded-lg sm:rounded-xl shadow-lg">
                <motion.img
                  src={image}
                  alt={imageAlt}
                  className="w-full h-auto object-cover aspect-[4/3]"
                  data-testid={imageTestId}
                  initial={{ scale: 1 }}
                  animate={isMobile && isImageFullyVisible ? { scale: 1.05 } : { scale: 1 }}
                  whileHover={!isMobile ? { scale: 1.08 } : undefined}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          )}

          {/* Content Column */}
          <motion.div
            initial={{ opacity: 0, x: hasImage ? (reverse ? -50 : 50) : 0 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: hasImage ? (reverse ? -50 : 50) : 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={hasImage ? (reverse ? 'lg:order-1' : 'lg:order-2') : ''}
          >
            {children}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
