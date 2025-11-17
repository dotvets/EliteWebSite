import { HeroOverlay } from "./HeroOverlay";
import { AnimatedContent } from "@/components/AnimatedContent";

interface HeroImageProps {
  image: string;
  title: string;
  alt?: string;
}

export function HeroImage({ image, title, alt }: HeroImageProps) {
  return (
    <section className="relative min-h-[450px] h-[60vh] sm:h-[500px] md:h-[550px] lg:h-[700px] w-full overflow-hidden">
      <img
        src={image}
        alt={alt || title}
        className="absolute inset-0 w-full h-full object-cover"
        data-testid="img-about-hero"
      />

      <HeroOverlay />
      
      <div className="absolute inset-0 z-20 flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <AnimatedContent variant="fadeInUpSoft">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-heading text-white" data-testid="text-about-hero-title">
              {title}
            </h1>
          </AnimatedContent>
        </div>
      </div>
    </section>
  );
}
