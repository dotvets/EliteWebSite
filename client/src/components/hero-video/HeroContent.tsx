import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AnimatedContent } from "@/components/AnimatedContent";

interface HeroContentProps {
  title: string;
  subtitle: string;
  ctaText: string;
}

export function HeroContent({ title, subtitle, ctaText }: HeroContentProps) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <AnimatedContent variant="fadeInUpSoft">
          <h1
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-heading text-white mb-4 sm:mb-6"
            data-testid="text-hero-title"
          >
            {title}
          </h1>
        </AnimatedContent>

        <AnimatedContent variant="fadeInUpSoft">
          <p
            className="text-base sm:text-lg md:text-xl text-white/95 mb-6 sm:mb-8"
            data-testid="text-hero-subtitle"
          >
            {subtitle}
          </p>
        </AnimatedContent>

        <AnimatedContent variant="zoomInSoft">
          <Link href="/book-now">
            <Button
              size="default"
              className="bg-primary/20 backdrop-blur-md border-2 border-white/30 text-white hover:bg-primary/30 sm:min-h-10"
              data-testid="button-hero-cta"
            >
              {ctaText}
            </Button>
          </Link>
        </AnimatedContent>
      </div>
    </div>
  );
}
