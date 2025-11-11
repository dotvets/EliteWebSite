export default function AnimatedServicesBackground() {
  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden" 
      style={{ 
        zIndex: 1,
        backgroundImage: 'url(/assets/backgrounds/paws-pattern.svg)',
        backgroundRepeat: 'repeat',
        backgroundSize: '200px 200px',
        backgroundPosition: 'center',
      }}
      data-testid="animated-background"
    />
  );
}
