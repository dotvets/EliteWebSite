import { motion } from "framer-motion";
import { useRef } from "react";
import { useInView } from "framer-motion";

interface ContentWithMediaSectionProps {
  image: string;
  imageAlt: string;
  children: React.ReactNode;
  reverse?: boolean;
  className?: string;
  imageTestId?: string;
}

export default function ContentWithMediaSection({
  image,
  imageAlt,
  children,
  reverse = false,
  className = "",
  imageTestId = "img-section",
}: ContentWithMediaSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.2 });

  return (
    <section className={`py-20 px-6 lg:px-8 ${className}`}>
      <motion.div
        ref={ref}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image Column - First on mobile, alternates on desktop */}
          <motion.div
            initial={{ opacity: 0, x: reverse ? 50 : -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: reverse ? 50 : -50 }}
            transition={{ duration: 0.6 }}
            className={reverse ? 'lg:order-2' : 'lg:order-1'}
          >
            <img
              src={image}
              alt={imageAlt}
              className="rounded-xl shadow-lg w-full h-auto"
              data-testid={imageTestId}
            />
          </motion.div>

          {/* Content Column */}
          <motion.div
            initial={{ opacity: 0, x: reverse ? -50 : 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: reverse ? -50 : 50 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={reverse ? 'lg:order-1' : 'lg:order-2'}
          >
            {children}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
