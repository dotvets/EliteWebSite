import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";

export default function TeamSection() {
  const { language } = useLanguage();
  const t = translations[language].team;

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false, amount: 0.3 }}
        >
          <h2
            className="text-xl sm:text-2xl lg:text-3xl font-bold font-heading text-foreground mb-4"
            data-testid="text-team-title"
          >
            {t.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t.description}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {t.members.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: false, amount: 0.3 }}
            >
              <Card
                className="p-6 text-center hover-elevate h-full"
                data-testid={`card-team-${index}`}
              >
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src="" alt={member.name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-semibold font-heading text-foreground mb-1">
                  {member.name}
                </h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
