import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";
import PageLayout from "@/components/PageLayout";
import { SectionHeader } from "@/components/SectionHeader";
import { AnimatedContent } from "@/components/AnimatedContent";
import { Card } from "@/components/ui/card";
import { Phone, MessageCircle, Smartphone } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp } from "@/animations";

const PHONE_NUMBER = "920011626";
const WHATSAPP_NUMBER = "966920011626";
const MOBILE_APP_URL = "https://vet.digitail.io/clinics/elite-vet-qourtobah-tel-920011626";

export default function BookNow() {
  const { language } = useLanguage();
  const t = translations[language].bookNowPage;

  const bookingOptions = [
    {
      icon: Phone,
      label: t.phoneCall,
      value: PHONE_NUMBER,
      href: `tel:${PHONE_NUMBER}`,
      testId: "link-book-phone",
    },
    {
      icon: MessageCircle,
      label: t.whatsapp,
      value: "920011626",
      href: `https://wa.me/${WHATSAPP_NUMBER}`,
      testId: "link-book-whatsapp",
    },
    {
      icon: Smartphone,
      label: t.mobileApp,
      value: t.title,
      href: MOBILE_APP_URL,
      testId: "link-book-app",
      isExternal: true,
    },
  ];

  return (
    <PageLayout dataTestId="page-book-now">
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-background min-h-[60vh]">
        <div className="max-w-4xl mx-auto overflow-x-hidden">
          <AnimatedContent variant="fadeInUp" className="text-center mb-12">
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-primary mb-4"
              data-testid="text-book-title"
            >
              {t.title}
            </h1>
            <p
              className="text-lg sm:text-xl text-muted-foreground mb-8"
              data-testid="text-book-subtitle"
            >
              {t.subtitle}
            </p>
          </AnimatedContent>

          <AnimatedContent variant="fadeInUp" className="text-center mb-12">
            <h2
              className="text-xl sm:text-2xl font-semibold font-heading text-foreground mb-2"
              data-testid="text-book-choose"
            >
              {t.chooseMethod}
            </h2>
            <p
              className="text-lg text-primary font-medium"
              data-testid="text-book-branches"
            >
              {t.riyadhBranches}
            </p>
          </AnimatedContent>

          <AnimatedContent variant="staggerGrid" className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {bookingOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <motion.div key={index} variants={fadeInUp}>
                  <a
                    href={option.href}
                    target={option.isExternal ? "_blank" : undefined}
                    rel={option.isExternal ? "noopener noreferrer" : undefined}
                    data-testid={option.testId}
                    className="block"
                  >
                    <Card
                      className="p-8 hover-elevate transition-all duration-300 h-full flex flex-col items-center text-center"
                      data-testid={`card-book-option-${index}`}
                    >
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold font-heading text-foreground mb-3">
                        {option.label}
                      </h3>
                      <p className="text-primary font-medium text-lg break-all">
                        {option.value}
                      </p>
                    </Card>
                  </a>
                </motion.div>
              );
            })}
          </AnimatedContent>
        </div>
      </section>
    </PageLayout>
  );
}
