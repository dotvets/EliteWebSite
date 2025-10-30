import AnimatedServicesBackground from '../AnimatedServicesBackground'

export default function AnimatedServicesBackgroundExample() {
  return (
    <div className="relative min-h-screen">
      <AnimatedServicesBackground />
      <div className="relative z-10 p-8">
        <h2 className="text-2xl font-bold mb-4">Animated Background (Paw Prints & Bones)</h2>
        <p className="text-muted-foreground">This component creates a full-screen animated background with floating paw prints and bones.</p>
        <div className="mt-8 bg-white/80 p-6 rounded-md">
          <h3 className="font-semibold mb-2">Features:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>12 paw prints randomly positioned</li>
            <li>6 bones randomly positioned</li>
            <li>Smooth floating animations</li>
            <li>Brand color palette</li>
            <li>Non-intrusive (click-through enabled)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
