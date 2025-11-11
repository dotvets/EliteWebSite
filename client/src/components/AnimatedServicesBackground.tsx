export default function AnimatedServicesBackground() {
  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden" 
      style={{ 
        zIndex: 1,
      }}
      data-testid="animated-background"
    >
      <svg 
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
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
            <g transform="translate(20, 20) rotate(-20)" opacity="0.2">
              <circle cx="0" cy="5" r="4" fill="#9d9ea0" stroke="#9d9ea0" strokeWidth="1"/>
              <circle cx="0" cy="-5" r="4" fill="#9d9ea0" stroke="#9d9ea0" strokeWidth="1"/>
              <rect x="-2" y="-3" width="4" height="6" rx="2" fill="#9d9ea0" stroke="#9d9ea0" strokeWidth="1"/>
              <circle cx="20" cy="5" r="4" fill="#9d9ea0" stroke="#9d9ea0" strokeWidth="1"/>
              <circle cx="20" cy="-5" r="4" fill="#9d9ea0" stroke="#9d9ea0" strokeWidth="1"/>
              <rect x="18" y="-3" width="4" height="6" rx="2" fill="#9d9ea0" stroke="#9d9ea0" strokeWidth="1"/>
              <rect x="2" y="-1.5" width="16" height="3" rx="1.5" fill="#9d9ea0" stroke="#9d9ea0" strokeWidth="1"/>
            </g>
            
            <g transform="translate(75, 15) rotate(10)" opacity="0.2">
              <circle cx="0" cy="4" r="3.5" fill="#8875b3" stroke="#8875b3" strokeWidth="1"/>
              <circle cx="0" cy="-4" r="3.5" fill="#8875b3" stroke="#8875b3" strokeWidth="1"/>
              <rect x="-1.5" y="-2.5" width="3" height="5" rx="1.5" fill="#8875b3" stroke="#8875b3" strokeWidth="1"/>
              <circle cx="18" cy="4" r="3.5" fill="#8875b3" stroke="#8875b3" strokeWidth="1"/>
              <circle cx="18" cy="-4" r="3.5" fill="#8875b3" stroke="#8875b3" strokeWidth="1"/>
              <rect x="16.5" y="-2.5" width="3" height="5" rx="1.5" fill="#8875b3" stroke="#8875b3" strokeWidth="1"/>
              <rect x="1.5" y="-1.5" width="15" height="3" rx="1.5" fill="#8875b3" stroke="#8875b3" strokeWidth="1"/>
            </g>
            
            <g transform="translate(130, 25) rotate(-15)" opacity="0.2">
              <circle cx="0" cy="4" r="3.5" fill="#7760a8" stroke="#7760a8" strokeWidth="1"/>
              <circle cx="0" cy="-4" r="3.5" fill="#7760a8" stroke="#7760a8" strokeWidth="1"/>
              <rect x="-1.5" y="-2.5" width="3" height="5" rx="1.5" fill="#7760a8" stroke="#7760a8" strokeWidth="1"/>
              <circle cx="18" cy="4" r="3.5" fill="#7760a8" stroke="#7760a8" strokeWidth="1"/>
              <circle cx="18" cy="-4" r="3.5" fill="#7760a8" stroke="#7760a8" strokeWidth="1"/>
              <rect x="16.5" y="-2.5" width="3" height="5" rx="1.5" fill="#7760a8" stroke="#7760a8" strokeWidth="1"/>
              <rect x="1.5" y="-1.5" width="15" height="3" rx="1.5" fill="#7760a8" stroke="#7760a8" strokeWidth="1"/>
            </g>

            {/* Row 2 */}
            <g transform="translate(45, 55) rotate(25)" opacity="0.2">
              <circle cx="0" cy="4" r="3.5" fill="#9d9ea0" stroke="#9d9ea0" strokeWidth="1"/>
              <circle cx="0" cy="-4" r="3.5" fill="#9d9ea0" stroke="#9d9ea0" strokeWidth="1"/>
              <rect x="-1.5" y="-2.5" width="3" height="5" rx="1.5" fill="#9d9ea0" stroke="#9d9ea0" strokeWidth="1"/>
              <circle cx="18" cy="4" r="3.5" fill="#9d9ea0" stroke="#9d9ea0" strokeWidth="1"/>
              <circle cx="18" cy="-4" r="3.5" fill="#9d9ea0" stroke="#9d9ea0" strokeWidth="1"/>
              <rect x="16.5" y="-2.5" width="3" height="5" rx="1.5" fill="#9d9ea0" stroke="#9d9ea0" strokeWidth="1"/>
              <rect x="1.5" y="-1.5" width="15" height="3" rx="1.5" fill="#9d9ea0" stroke="#9d9ea0" strokeWidth="1"/>
            </g>
            
            <g transform="translate(105, 60) rotate(-5)" opacity="0.2">
              <circle cx="0" cy="4" r="3.5" fill="#6650a0" stroke="#6650a0" strokeWidth="1"/>
              <circle cx="0" cy="-4" r="3.5" fill="#6650a0" stroke="#6650a0" strokeWidth="1"/>
              <rect x="-1.5" y="-2.5" width="3" height="5" rx="1.5" fill="#6650a0" stroke="#6650a0" strokeWidth="1"/>
              <circle cx="18" cy="4" r="3.5" fill="#6650a0" stroke="#6650a0" strokeWidth="1"/>
              <circle cx="18" cy="-4" r="3.5" fill="#6650a0" stroke="#6650a0" strokeWidth="1"/>
              <rect x="16.5" y="-2.5" width="3" height="5" rx="1.5" fill="#6650a0" stroke="#6650a0" strokeWidth="1"/>
              <rect x="1.5" y="-1.5" width="15" height="3" rx="1.5" fill="#6650a0" stroke="#6650a0" strokeWidth="1"/>
            </g>

            {/* Row 3 */}
            <g transform="translate(15, 95) rotate(15)" opacity="0.2">
              <circle cx="0" cy="4" r="3.5" fill="#8875b3" stroke="#8875b3" strokeWidth="1"/>
              <circle cx="0" cy="-4" r="3.5" fill="#8875b3" stroke="#8875b3" strokeWidth="1"/>
              <rect x="-1.5" y="-2.5" width="3" height="5" rx="1.5" fill="#8875b3" stroke="#8875b3" strokeWidth="1"/>
              <circle cx="18" cy="4" r="3.5" fill="#8875b3" stroke="#8875b3" strokeWidth="1"/>
              <circle cx="18" cy="-4" r="3.5" fill="#8875b3" stroke="#8875b3" strokeWidth="1"/>
              <rect x="16.5" y="-2.5" width="3" height="5" rx="1.5" fill="#8875b3" stroke="#8875b3" strokeWidth="1"/>
              <rect x="1.5" y="-1.5" width="15" height="3" rx="1.5" fill="#8875b3" stroke="#8875b3" strokeWidth="1"/>
            </g>
            
            <g transform="translate(80, 90) rotate(-25)" opacity="0.2">
              <circle cx="0" cy="4" r="3.5" fill="#7760a8" stroke="#7760a8" strokeWidth="1"/>
              <circle cx="0" cy="-4" r="3.5" fill="#7760a8" stroke="#7760a8" strokeWidth="1"/>
              <rect x="-1.5" y="-2.5" width="3" height="5" rx="1.5" fill="#7760a8" stroke="#7760a8" strokeWidth="1"/>
              <circle cx="18" cy="4" r="3.5" fill="#7760a8" stroke="#7760a8" strokeWidth="1"/>
              <circle cx="18" cy="-4" r="3.5" fill="#7760a8" stroke="#7760a8" strokeWidth="1"/>
              <rect x="16.5" y="-2.5" width="3" height="5" rx="1.5" fill="#7760a8" stroke="#7760a8" strokeWidth="1"/>
              <rect x="1.5" y="-1.5" width="15" height="3" rx="1.5" fill="#7760a8" stroke="#7760a8" strokeWidth="1"/>
            </g>

            {/* Row 4 */}
            <g transform="translate(35, 125) rotate(5)" opacity="0.2">
              <circle cx="0" cy="4" r="3.5" fill="#9d9ea0" stroke="#9d9ea0" strokeWidth="1"/>
              <circle cx="0" cy="-4" r="3.5" fill="#9d9ea0" stroke="#9d9ea0" strokeWidth="1"/>
              <rect x="-1.5" y="-2.5" width="3" height="5" rx="1.5" fill="#9d9ea0" stroke="#9d9ea0" strokeWidth="1"/>
              <circle cx="18" cy="4" r="3.5" fill="#9d9ea0" stroke="#9d9ea0" strokeWidth="1"/>
              <circle cx="18" cy="-4" r="3.5" fill="#9d9ea0" stroke="#9d9ea0" strokeWidth="1"/>
              <rect x="16.5" y="-2.5" width="3" height="5" rx="1.5" fill="#9d9ea0" stroke="#9d9ea0" strokeWidth="1"/>
              <rect x="1.5" y="-1.5" width="15" height="3" rx="1.5" fill="#9d9ea0" stroke="#9d9ea0" strokeWidth="1"/>
            </g>
            
            <g transform="translate(120, 130) rotate(-30)" opacity="0.2">
              <circle cx="0" cy="4" r="3.5" fill="#6650a0" stroke="#6650a0" strokeWidth="1"/>
              <circle cx="0" cy="-4" r="3.5" fill="#6650a0" stroke="#6650a0" strokeWidth="1"/>
              <rect x="-1.5" y="-2.5" width="3" height="5" rx="1.5" fill="#6650a0" stroke="#6650a0" strokeWidth="1"/>
              <circle cx="18" cy="4" r="3.5" fill="#6650a0" stroke="#6650a0" strokeWidth="1"/>
              <circle cx="18" cy="-4" r="3.5" fill="#6650a0" stroke="#6650a0" strokeWidth="1"/>
              <rect x="16.5" y="-2.5" width="3" height="5" rx="1.5" fill="#6650a0" stroke="#6650a0" strokeWidth="1"/>
              <rect x="1.5" y="-1.5" width="15" height="3" rx="1.5" fill="#6650a0" stroke="#6650a0" strokeWidth="1"/>
            </g>
          </pattern>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#bonesPattern)"/>
      </svg>
    </div>
  );
}
