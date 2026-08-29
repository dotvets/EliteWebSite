import { useEffect, useState } from "react";
import { ArrowRight, Tag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AnimatedContent } from "@/components/AnimatedContent";
import { SectionHeader } from "@/components/SectionHeader";
import { useLanguage } from "@/contexts/LanguageContext";

type Offer = {
  id: string; titleAr: string; titleEn?: string; descriptionAr?: string; descriptionEn?: string;
  image?: string; discount?: string; startDate?: string; endDate?: string; cta?: string; ctaUrl?: string;
};

const inWindow = (o: Offer) => {
  const today = new Date().toISOString().slice(0, 10);
  if (o.startDate && o.startDate > today) return false;
  if (o.endDate && o.endDate < today) return false;
  return true;
};

// Published offers from DB (admin → العروض). Self-hides when no active offers.
export default function OffersSection() {
  const { language } = useLanguage();
  const [offers, setOffers] = useState<Offer[] | null>(null);
  useEffect(() => {
    fetch("/api/public/offers").then((r) => (r.ok ? r.json() : [])).then(setOffers).catch(() => setOffers([]));
  }, []);
  if (!offers) return null;
  const active = offers.filter(inWindow);
  if (!active.length) return null;
  const pick = (ar?: string, en?: string) => (language === "ar" ? ar || en : en || ar) || "";
  return (
    <div className="max-w-7xl mx-auto overflow-x-hidden">
      <SectionHeader title={language === "ar" ? "عروضنا الحالية" : "Current Offers"} titleTestId="text-offers-title" />
      <AnimatedContent variant="staggerGrid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8">
        {active.map((o) => (
          <Card key={o.id} className="overflow-hidden hover-elevate transition-all duration-300" data-testid={`card-offer-${o.id}`}>
            {o.image && <img src={o.image} alt={pick(o.titleAr, o.titleEn)} className="w-full h-44 object-cover" />}
            <div className="p-6">
              {o.discount && (
                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-sm font-bold rounded-full px-3 py-1 mb-3">
                  <Tag className="w-3.5 h-3.5" /> {o.discount}
                </span>
              )}
              <h3 className="text-xl font-semibold font-heading text-foreground mb-2">{pick(o.titleAr, o.titleEn)}</h3>
              {pick(o.descriptionAr, o.descriptionEn) && (
                <p className="text-muted-foreground text-sm mb-4">{pick(o.descriptionAr, o.descriptionEn)}</p>
              )}
              {o.endDate && (
                <p className="text-xs text-muted-foreground mb-3">
                  {language === "ar" ? `حتى ${o.endDate}` : `Until ${o.endDate}`}
                </p>
              )}
              {o.ctaUrl && (
                <a href={o.ctaUrl} className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors">
                  {o.cta || (language === "ar" ? "احجز الآن" : "Book now")}
                  <ArrowRight className="w-4 h-4" />
                </a>
              )}
            </div>
          </Card>
        ))}
      </AnimatedContent>
    </div>
  );
}
