import { AnimatedContent } from "@/components/AnimatedContent";
import ContentWithMediaSection from "@/components/ContentWithMediaSection";

interface ServiceImageBlockProps {
  image: string;
  imageAlt: string;
  imageTestId: string;
  title: string;
  description: string;
  reverse?: boolean;
}

export default function ServiceImageBlock({
  image,
  imageAlt,
  imageTestId,
  title,
  description,
  reverse = false
}: ServiceImageBlockProps) {
  return (
    <div className="mb-12">
      <ContentWithMediaSection
        image={image}
        imageAlt={imageAlt}
        imageTestId={imageTestId}
        reverse={reverse}
      >
        <AnimatedContent className="space-y-4 text-center lg:text-start ltr:lg:text-left rtl:lg:text-right">
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-primary">
            {title}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground font-body">
            {description}
          </p>
        </AnimatedContent>
      </ContentWithMediaSection>
    </div>
  );
}
