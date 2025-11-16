import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";
import { SectionHeader } from "./SectionHeader";
import { TeamMemberCard } from "./TeamMemberCard";
import { AnimatedContent } from "./AnimatedContent";

export default function TeamSection() {
  const { language } = useLanguage();
  const t = translations[language].team;

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto overflow-x-hidden">
        <SectionHeader 
          title={t.title} 
          description={t.description} 
          titleTestId="text-team-title" 
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {t.members.map((member, index) => (
            <AnimatedContent
              key={index}
              variant="custom"
              customVariants={{
                hidden: { opacity: 0, scale: 0.9 },
                visible: { opacity: 1, scale: 1, transition: { duration: 0.5, delay: index * 0.1 } }
              }}
            >
              <TeamMemberCard
                name={member.name}
                role={member.role}
                initials={member.initials}
                testId={`card-team-${index}`}
              />
            </AnimatedContent>
          ))}
        </div>
      </div>
    </section>
  );
}
