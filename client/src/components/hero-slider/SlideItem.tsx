import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { SlideOverlay } from "./SlideOverlay";

interface SlideItemProps {
  image: string;
  title: string;
  subtitle: string;
  ctaText: string;
  index: number;
}

export function SlideItem({ image, title, subtitle, ctaText, index }: SlideItemProps) {
  return (
    <div className="flex-[0_0_100%] min-w-0 relative">
      <SlideOverlay />
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 z-20 flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-heading text-white mb-4 sm:mb-6"
            data-testid={`text-hero-title-${index}`}
          >
            {title}
          </h1>
          <p
            className="text-base sm:text-lg md:text-xl text-white/95 mb-6 sm:mb-8"
            data-testid={`text-hero-subtitle-${index}`}
          >
            {subtitle}
          </p>
          <Link href="/book-now">
            <Button
              size="default"
              className="bg-primary/20 backdrop-blur-md border-2 border-white/30 text-white hover:bg-primary/30 sm:min-h-10"
              data-testid="button-hero-cta"
            >
              {ctaText}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
