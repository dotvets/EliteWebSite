export default function ECGAnimation() {
  return (
    <div className="w-full overflow-hidden bg-background">
      <div className="relative h-20 md:h-24">
        <svg
          className="w-full h-full absolute inset-0"
          viewBox="0 0 1200 140"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="ecg-pattern-header"
              x="0"
              y="0"
              width="400"
              height="140"
              patternUnits="userSpaceOnUse"
            >
              <animateTransform
                attributeName="patternTransform"
                type="translate"
                from="0 0"
                to="400 0"
                dur="12s"
                repeatCount="indefinite"
              />
              <path
                className="ecg-path"
                d="M0,70 L60,70 L65,65 L70,70 L75,70 L80,70 L85,50 L90,90 L95,70 L100,70 L105,75 L110,70 L115,70 L400,70"
                fill="none"
                stroke="#7760a8"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </pattern>
          </defs>
          
          <rect
            x="-400"
            y="0"
            width="2000"
            height="140"
            fill="url(#ecg-pattern-header)"
          />
        </svg>
      </div>
      
      <style>{`
        @media (min-width: 768px) {
          .ecg-path {
            stroke-width: 2.5;
          }
        }
      `}</style>
    </div>
  );
}
