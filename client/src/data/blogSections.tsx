import ContentWithMediaSection from "@/components/ContentWithMediaSection";
import { AnimatedContent } from "@/components/AnimatedContent";

import blogImg1 from "@assets/Blog_photo1.png";
import blogImg2 from "@assets/Blog_photo2.png";
import blogImg3 from "@assets/Blog_photo3.png";
import blogImg4 from "@assets/Blog_photo4.png";

export const createBlogSections = (t: any) => {
  const articles = [
    {
      image: blogImg1,
      title: t.article1.title,
      date: t.article1.date,
      description: t.article1.description,
      reverse: false,
    },
    {
      image: blogImg2,
      title: t.article2.title,
      date: t.article2.date,
      description: t.article2.description,
      reverse: true,
    },
    {
      image: blogImg3,
      title: t.article3.title,
      date: t.article3.date,
      description: t.article3.description,
      reverse: false,
    },
    {
      image: blogImg4,
      title: t.article4.title,
      date: t.article4.date,
      description: t.article4.description,
      reverse: true,
    },
  ];

  return articles.map((article, index) => ({
    key: `blog-article-${index}`,
    className: `py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 ${index % 2 === 0 ? "bg-muted/30" : "bg-background"}`,
    content: (
      <ContentWithMediaSection
        image={article.image}
        imageAlt={article.title}
        imageTestId={`blog-image-${index}`}
        reverse={article.reverse}
      >
        <AnimatedContent variant="fadeInUp" className="space-y-4">
          {/* التاريخ */}
          <p className="text-xs text-primary font-semibold">{article.date}</p>

          {/* العنوان */}
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-primary">
            {article.title}
          </h2>

          {/* الوصف */}
          <p className="text-base sm:text-lg text-muted-foreground font-body">
            {article.description}
          </p>
        </AnimatedContent>
      </ContentWithMediaSection>
    ),
  }));
};
