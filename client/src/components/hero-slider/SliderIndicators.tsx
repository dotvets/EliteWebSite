interface SliderIndicatorsProps {
  count: number;
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function SliderIndicators({ count, selectedIndex, onSelect }: SliderIndicatorsProps) {
  return (
    <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2 sm:gap-3">
      {Array.from({ length: count }).map((_, index) => (
        <button
          key={index}
          onClick={() => onSelect(index)}
          className={`w-3 h-3 rounded-full transition-all ${
            index === selectedIndex
              ? "bg-primary w-8"
              : "bg-white/50 hover:bg-white/70"
          }`}
          data-testid={`button-indicator-${index}`}
        />
      ))}
    </div>
  );
}
