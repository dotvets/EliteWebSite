import HeroSlider from "@/components/HeroSlider";
import ECGAnimation from "@/components/ECGAnimation";
import IntroSection from "@/components/IntroSection";
import ServicesSection from "@/components/ServicesSection";
import WhyChooseSection from "@/components/WhyChooseSection";
import TeamSection from "@/components/TeamSection";
import PartnersSection from "@/components/PartnersSection";
import ContactSection from "@/components/ContactSection";
import HeartbeatDivider from "@/components/HeartbeatDivider";
import PageLayout from "@/components/PageLayout";

export default function Home() {
  return (
    <PageLayout>
      <HeroSlider />
      <ECGAnimation />
      <IntroSection />
      <ServicesSection />
      <WhyChooseSection />
      <TeamSection />
      <PartnersSection />
      <ContactSection />
      <HeartbeatDivider />
    </PageLayout>
  );
}
