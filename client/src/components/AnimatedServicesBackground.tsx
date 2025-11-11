import { motion } from 'framer-motion';

export default function AnimatedServicesBackground() {
  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden" 
      style={{ zIndex: 1 }}
      data-testid="animated-background"
    >
      <motion.svg 
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        animate={{
          backgroundPosition: ['0px 0px', '150px 150px'],
        }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <defs>
          <pattern 
            id="bonesPattern" 
            x="0" 
            y="0" 
            width="150" 
            height="150" 
            patternUnits="userSpaceOnUse"
          >
            {/* Row 1 */}
            <motion.g 
              transform="translate(20, 20) rotate(-20)" 
              opacity="0.35"
              animate={{
                y: [0, -8, 0],
                x: [0, 5, -5, 0],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <circle cx="0" cy="5" r="4" fill="#c4b5d8" stroke="#c4b5d8" strokeWidth="1"/>
              <circle cx="0" cy="-5" r="4" fill="#c4b5d8" stroke="#c4b5d8" strokeWidth="1"/>
              <rect x="-2" y="-3" width="4" height="6" rx="2" fill="#c4b5d8" stroke="#c4b5d8" strokeWidth="1"/>
              <circle cx="20" cy="5" r="4" fill="#c4b5d8" stroke="#c4b5d8" strokeWidth="1"/>
              <circle cx="20" cy="-5" r="4" fill="#c4b5d8" stroke="#c4b5d8" strokeWidth="1"/>
              <rect x="18" y="-3" width="4" height="6" rx="2" fill="#c4b5d8" stroke="#c4b5d8" strokeWidth="1"/>
              <rect x="2" y="-1.5" width="16" height="3" rx="1.5" fill="#c4b5d8" stroke="#c4b5d8" strokeWidth="1"/>
            </motion.g>
            
            <motion.g 
              transform="translate(75, 15) rotate(10)" 
              opacity="0.35"
              animate={{
                y: [0, 10, 0],
                x: [0, -6, 6, 0],
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2,
              }}
            >
              <circle cx="0" cy="4" r="3.5" fill="#d4cee5" stroke="#d4cee5" strokeWidth="1"/>
              <circle cx="0" cy="-4" r="3.5" fill="#d4cee5" stroke="#d4cee5" strokeWidth="1"/>
              <rect x="-1.5" y="-2.5" width="3" height="5" rx="1.5" fill="#d4cee5" stroke="#d4cee5" strokeWidth="1"/>
              <circle cx="18" cy="4" r="3.5" fill="#d4cee5" stroke="#d4cee5" strokeWidth="1"/>
              <circle cx="18" cy="-4" r="3.5" fill="#d4cee5" stroke="#d4cee5" strokeWidth="1"/>
              <rect x="16.5" y="-2.5" width="3" height="5" rx="1.5" fill="#d4cee5" stroke="#d4cee5" strokeWidth="1"/>
              <rect x="1.5" y="-1.5" width="15" height="3" rx="1.5" fill="#d4cee5" stroke="#d4cee5" strokeWidth="1"/>
            </motion.g>
            
            <motion.g 
              transform="translate(130, 25) rotate(-15)" 
              opacity="0.35"
              animate={{
                y: [0, -6, 0],
                x: [0, 4, -4, 0],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 4,
              }}
            >
              <circle cx="0" cy="4" r="3.5" fill="#b3a1c7" stroke="#b3a1c7" strokeWidth="1"/>
              <circle cx="0" cy="-4" r="3.5" fill="#b3a1c7" stroke="#b3a1c7" strokeWidth="1"/>
              <rect x="-1.5" y="-2.5" width="3" height="5" rx="1.5" fill="#b3a1c7" stroke="#b3a1c7" strokeWidth="1"/>
              <circle cx="18" cy="4" r="3.5" fill="#b3a1c7" stroke="#b3a1c7" strokeWidth="1"/>
              <circle cx="18" cy="-4" r="3.5" fill="#b3a1c7" stroke="#b3a1c7" strokeWidth="1"/>
              <rect x="16.5" y="-2.5" width="3" height="5" rx="1.5" fill="#b3a1c7" stroke="#b3a1c7" strokeWidth="1"/>
              <rect x="1.5" y="-1.5" width="15" height="3" rx="1.5" fill="#b3a1c7" stroke="#b3a1c7" strokeWidth="1"/>
            </motion.g>

            {/* Row 2 */}
            <motion.g 
              transform="translate(45, 55) rotate(25)" 
              opacity="0.35"
              animate={{
                y: [0, 7, 0],
                x: [0, -5, 5, 0],
              }}
              transition={{
                duration: 16,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            >
              <circle cx="0" cy="4" r="3.5" fill="#c4b5d8" stroke="#c4b5d8" strokeWidth="1"/>
              <circle cx="0" cy="-4" r="3.5" fill="#c4b5d8" stroke="#c4b5d8" strokeWidth="1"/>
              <rect x="-1.5" y="-2.5" width="3" height="5" rx="1.5" fill="#c4b5d8" stroke="#c4b5d8" strokeWidth="1"/>
              <circle cx="18" cy="4" r="3.5" fill="#c4b5d8" stroke="#c4b5d8" strokeWidth="1"/>
              <circle cx="18" cy="-4" r="3.5" fill="#c4b5d8" stroke="#c4b5d8" strokeWidth="1"/>
              <rect x="16.5" y="-2.5" width="3" height="5" rx="1.5" fill="#c4b5d8" stroke="#c4b5d8" strokeWidth="1"/>
              <rect x="1.5" y="-1.5" width="15" height="3" rx="1.5" fill="#c4b5d8" stroke="#c4b5d8" strokeWidth="1"/>
            </motion.g>
            
            <motion.g 
              transform="translate(105, 60) rotate(-5)" 
              opacity="0.35"
              animate={{
                y: [0, -9, 0],
                x: [0, 6, -6, 0],
              }}
              transition={{
                duration: 22,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 3,
              }}
            >
              <circle cx="0" cy="4" r="3.5" fill="#9f8dba" stroke="#9f8dba" strokeWidth="1"/>
              <circle cx="0" cy="-4" r="3.5" fill="#9f8dba" stroke="#9f8dba" strokeWidth="1"/>
              <rect x="-1.5" y="-2.5" width="3" height="5" rx="1.5" fill="#9f8dba" stroke="#9f8dba" strokeWidth="1"/>
              <circle cx="18" cy="4" r="3.5" fill="#9f8dba" stroke="#9f8dba" strokeWidth="1"/>
              <circle cx="18" cy="-4" r="3.5" fill="#9f8dba" stroke="#9f8dba" strokeWidth="1"/>
              <rect x="16.5" y="-2.5" width="3" height="5" rx="1.5" fill="#9f8dba" stroke="#9f8dba" strokeWidth="1"/>
              <rect x="1.5" y="-1.5" width="15" height="3" rx="1.5" fill="#9f8dba" stroke="#9f8dba" strokeWidth="1"/>
            </motion.g>

            {/* Row 3 */}
            <motion.g 
              transform="translate(15, 95) rotate(15)" 
              opacity="0.35"
              animate={{
                y: [0, 8, 0],
                x: [0, -4, 4, 0],
              }}
              transition={{
                duration: 19,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 5,
              }}
            >
              <circle cx="0" cy="4" r="3.5" fill="#d4cee5" stroke="#d4cee5" strokeWidth="1"/>
              <circle cx="0" cy="-4" r="3.5" fill="#d4cee5" stroke="#d4cee5" strokeWidth="1"/>
              <rect x="-1.5" y="-2.5" width="3" height="5" rx="1.5" fill="#d4cee5" stroke="#d4cee5" strokeWidth="1"/>
              <circle cx="18" cy="4" r="3.5" fill="#d4cee5" stroke="#d4cee5" strokeWidth="1"/>
              <circle cx="18" cy="-4" r="3.5" fill="#d4cee5" stroke="#d4cee5" strokeWidth="1"/>
              <rect x="16.5" y="-2.5" width="3" height="5" rx="1.5" fill="#d4cee5" stroke="#d4cee5" strokeWidth="1"/>
              <rect x="1.5" y="-1.5" width="15" height="3" rx="1.5" fill="#d4cee5" stroke="#d4cee5" strokeWidth="1"/>
            </motion.g>
            
            <motion.g 
              transform="translate(80, 90) rotate(-25)" 
              opacity="0.35"
              animate={{
                y: [0, -7, 0],
                x: [0, 5, -5, 0],
              }}
              transition={{
                duration: 17,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2.5,
              }}
            >
              <circle cx="0" cy="4" r="3.5" fill="#b3a1c7" stroke="#b3a1c7" strokeWidth="1"/>
              <circle cx="0" cy="-4" r="3.5" fill="#b3a1c7" stroke="#b3a1c7" strokeWidth="1"/>
              <rect x="-1.5" y="-2.5" width="3" height="5" rx="1.5" fill="#b3a1c7" stroke="#b3a1c7" strokeWidth="1"/>
              <circle cx="18" cy="4" r="3.5" fill="#b3a1c7" stroke="#b3a1c7" strokeWidth="1"/>
              <circle cx="18" cy="-4" r="3.5" fill="#b3a1c7" stroke="#b3a1c7" strokeWidth="1"/>
              <rect x="16.5" y="-2.5" width="3" height="5" rx="1.5" fill="#b3a1c7" stroke="#b3a1c7" strokeWidth="1"/>
              <rect x="1.5" y="-1.5" width="15" height="3" rx="1.5" fill="#b3a1c7" stroke="#b3a1c7" strokeWidth="1"/>
            </motion.g>

            {/* Row 4 */}
            <motion.g 
              transform="translate(35, 125) rotate(5)" 
              opacity="0.35"
              animate={{
                y: [0, 9, 0],
                x: [0, -6, 6, 0],
              }}
              transition={{
                duration: 21,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.5,
              }}
            >
              <circle cx="0" cy="4" r="3.5" fill="#c4b5d8" stroke="#c4b5d8" strokeWidth="1"/>
              <circle cx="0" cy="-4" r="3.5" fill="#c4b5d8" stroke="#c4b5d8" strokeWidth="1"/>
              <rect x="-1.5" y="-2.5" width="3" height="5" rx="1.5" fill="#c4b5d8" stroke="#c4b5d8" strokeWidth="1"/>
              <circle cx="18" cy="4" r="3.5" fill="#c4b5d8" stroke="#c4b5d8" strokeWidth="1"/>
              <circle cx="18" cy="-4" r="3.5" fill="#c4b5d8" stroke="#c4b5d8" strokeWidth="1"/>
              <rect x="16.5" y="-2.5" width="3" height="5" rx="1.5" fill="#c4b5d8" stroke="#c4b5d8" strokeWidth="1"/>
              <rect x="1.5" y="-1.5" width="15" height="3" rx="1.5" fill="#c4b5d8" stroke="#c4b5d8" strokeWidth="1"/>
            </motion.g>
            
            <motion.g 
              transform="translate(120, 130) rotate(-30)" 
              opacity="0.35"
              animate={{
                y: [0, -8, 0],
                x: [0, 4, -4, 0],
              }}
              transition={{
                duration: 23,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 4.5,
              }}
            >
              <circle cx="0" cy="4" r="3.5" fill="#9f8dba" stroke="#9f8dba" strokeWidth="1"/>
              <circle cx="0" cy="-4" r="3.5" fill="#9f8dba" stroke="#9f8dba" strokeWidth="1"/>
              <rect x="-1.5" y="-2.5" width="3" height="5" rx="1.5" fill="#9f8dba" stroke="#9f8dba" strokeWidth="1"/>
              <circle cx="18" cy="4" r="3.5" fill="#9f8dba" stroke="#9f8dba" strokeWidth="1"/>
              <circle cx="18" cy="-4" r="3.5" fill="#9f8dba" stroke="#9f8dba" strokeWidth="1"/>
              <rect x="16.5" y="-2.5" width="3" height="5" rx="1.5" fill="#9f8dba" stroke="#9f8dba" strokeWidth="1"/>
              <rect x="1.5" y="-1.5" width="15" height="3" rx="1.5" fill="#9f8dba" stroke="#9f8dba" strokeWidth="1"/>
            </motion.g>
          </pattern>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#bonesPattern)"/>
      </motion.svg>
    </div>
  );
}
