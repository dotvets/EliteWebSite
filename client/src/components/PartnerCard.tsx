type PartnerCardProps = {
  name: string;
  image: string;
  width?: string;
  delay?: number;
};

export function PartnerCard({ name, image, width = "w-48" }: PartnerCardProps) {
  return (
    <div className={`${width} flex items-center justify-center`}>
      <img 
        src={image} 
        alt={name} 
        className="w-full h-auto object-contain"
        data-testid={`img-partner-${name.toLowerCase().replace(/\s+/g, '-')}`}
      />
    </div>
  );
}
