import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";

export default function PartnersSection() {
  const { language } = useLanguage();
  const t = translations[language].partners;

  return (
    <section className="py-20 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false, amount: 0.3 }}
        >
          <h2
            className="text-3xl lg:text-4xl font-bold font-heading text-foreground mb-4"
            data-testid="text-partners-title"
          >
            {t.title}
          </h2>
        </motion.div>

        <div className="flex flex-wrap justify-center items-center gap-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: false, amount: 0.3 }}
          >
            <Card className="p-8 w-64 h-32 flex items-center justify-center hover-elevate">
              <div className="text-center">
                <p className="text-2xl font-semibold text-primary">Vest Van</p>
              </div>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: false, amount: 0.3 }}
          >
            <Card className="p-8 w-64 h-32 flex items-center justify-center hover-elevate">
              <div className="text-center">
                <p className="text-2xl font-semibold text-primary">Elite Falcons</p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
