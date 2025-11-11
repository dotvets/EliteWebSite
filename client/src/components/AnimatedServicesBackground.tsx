export default function AnimatedServicesBackground() {
  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden" 
      style={{ 
        zIndex: 1,
        backgroundImage: 'url(/assets/backgrounds/bones-pattern.svg)',
        backgroundRepeat: 'repeat',
        backgroundSize: '150px 150px',
        backgroundPosition: 'center',
      }}
      data-testid="animated-background"
    />
  );
}
