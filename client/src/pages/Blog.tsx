import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";
import PageLayout from "@/components/PageLayout";
import { AnimatedContent } from "@/components/AnimatedContent";
import { createBlogSections } from "@/data/blogSections";

export default function Blog() {
  const { language } = useLanguage();
  const t = translations[language].blogPage;

  const sections = createBlogSections(t);

  return (
    <PageLayout dataTestId="page-blog">
      {/* Hero Section */}
      <section className="relative h-[260px] sm:h-[300px] md:h-[350px] w-full overflow-hidden mb-12 bg-gradient-to-br from-primary/10 to-primary/5 bg-background">
        <div className="absolute inset-0 bg-black/10" />

        <div className="relative z-20 h-full flex flex-col justify-center items-center text-center px-4">
          <AnimatedContent variant="fadeInUp">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-primary mb-2">
              {t.hero.title}
            </h1>
            <p className="text-foreground/80 text-sm sm:text-base md:text-lg font-body max-w-2xl">
              {t.hero.subtitle}
            </p>
          </AnimatedContent>
        </div>
      </section>

      {/* Blog Sections */}
      {sections.map(({ key, className, content }) => (
        <section key={key} className={className}>
          {content}
        </section>
      ))}
    </PageLayout>
  );
}
