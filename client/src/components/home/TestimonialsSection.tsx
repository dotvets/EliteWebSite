import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AnimatedContent } from "@/components/AnimatedContent";
import { SectionHeader } from "@/components/SectionHeader";
import { useLanguage } from "@/contexts/LanguageContext";

type Testimonial = {
  id: string; customerAr: string; customerEn?: string; textAr: string; textEn?: string;
  rating?: string; image?: string; branch?: string;
};

// Published testimonials from DB (admin → التوصيات). Self-hides when empty.
export default function TestimonialsSection() {
  const { language } = useLanguage();
  const [items, setItems] = useState<Testimonial[] | null>(null);
  useEffect(() => {
    fetch("/api/public/testimonials").then((r) => (r.ok ? r.json() : [])).then(setItems).catch(() => setItems([]));
  }, []);
  if (!items || !items.length) return null;
  const pick = (ar?: string, en?: string) => (language === "ar" ? ar || en : en || ar) || "";
  return (
    <div className="max-w-7xl mx-auto overflow-x-hidden">
      <SectionHeader title={language === "ar" ? "ماذا يقول عملاؤنا" : "What Our Clients Say"} titleTestId="text-testimonials-title" />
      <AnimatedContent variant="staggerGrid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8">
        {items.map((t) => {
          const rating = Math.max(0, Math.min(5, parseInt(t.rating || "5", 10) || 5));
          return (
            <Card key={t.id} className="p-6 hover-elevate transition-all duration-300 h-full" data-testid={`card-testimonial-${t.id}`}>
              <div className="flex gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} />
                ))}
              </div>
              <p className="text-foreground text-sm leading-relaxed mb-4">“{pick(t.textAr, t.textEn)}”</p>
              <div className="flex items-center gap-3">
                {t.image ? (
                  <img src={t.image} alt={pick(t.customerAr, t.customerEn)} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {pick(t.customerAr, t.customerEn).slice(0, 1)}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-sm">{pick(t.customerAr, t.customerEn)}</div>
                  {t.branch && <div className="text-xs text-muted-foreground">{t.branch}</div>}
                </div>
              </div>
            </Card>
          );
        })}
      </AnimatedContent>
    </div>
  );
}
