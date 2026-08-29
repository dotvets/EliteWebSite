import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";
import PageLayout from "@/components/PageLayout";
import { AnimatedContent } from "@/components/AnimatedContent";
import { createBlogSections } from "@/data/blogSections";

export default function Blog() {
  const { language } = useLanguage();
  const t = translations[language].blogPage;

  const sections = createBlogSections(t);
  const [posts, setPosts] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/public/blog").then((r) => (r.ok ? r.json() : [])).then(setPosts).catch(() => {});
  }, []);

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

      {/* DB-managed posts (admin Blog panel) */}
      {posts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <article key={p.id} className="bg-card rounded-2xl shadow-md overflow-hidden border border-border">
              {p.coverImage && <img src={p.coverImage} alt="" className="w-full h-44 object-cover" loading="lazy" />}
              <div className="p-5">
                <h2 className="text-xl font-bold font-heading text-primary mb-2">{(language === "ar" ? p.titleAr : p.titleEn) || p.titleAr}</h2>
                <p className="text-foreground/70 text-sm line-clamp-4 whitespace-pre-line">{((language === "ar" ? p.contentAr : p.contentEn) || p.contentAr || "").slice(0, 400)}</p>
                <div className="mt-3 text-xs text-muted-foreground">{p.author || ""} {p.publishedAt ? "• " + String(p.publishedAt).slice(0, 10) : ""}</div>
              </div>
            </article>
          ))}
        </section>
      )}

      {/* Blog Sections */}
      {sections.map(({ key, className, content }, index) => {
        // For first section, replace py-* with separate pt-* and pb-*
        const sectionClassName = index === 0
          ? className.replace('py-12 sm:py-16 md:py-20', 'pt-20 sm:pt-24 md:pt-28 pb-12 sm:pb-16 md:pb-20')
          : className;
        
        return (
          <section key={key} className={sectionClassName}>
            {content}
          </section>
        );
      })}
    </PageLayout>
  );
}
