import { AnimatedContent } from "./AnimatedContent";

type SectionHeaderProps = {
  title: string;
  description?: string;
  titleTestId?: string;
  className?: string;
};

export function SectionHeader({ title, description, titleTestId, className = "" }: SectionHeaderProps) {
  return (
    <AnimatedContent className={`text-center mb-12 ${className}`}>
      <h2
        className="text-xl sm:text-2xl lg:text-3xl font-bold font-heading text-foreground mb-4"
        data-testid={titleTestId}
      >
        {title}
      </h2>
      {description && (
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          {description}
        </p>
      )}
    </AnimatedContent>
  );
}
