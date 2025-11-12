import Header from "@/components/Header";
import HeroSlider from "@/components/HeroSlider";
import ECGAnimation from "@/components/ECGAnimation";
import IntroSection from "@/components/IntroSection";
import ServicesSection from "@/components/ServicesSection";
import WhyChooseSection from "@/components/WhyChooseSection";
import TeamSection from "@/components/TeamSection";
import PartnersSection from "@/components/PartnersSection";
import ContactSection from "@/components/ContactSection";
import HeartbeatDivider from "@/components/HeartbeatDivider";
import Footer from "@/components/Footer";
import PetBackground from "@/components/PetBackground";

export default function Home() {
  return (
    <div className="min-h-screen relative">
      <PetBackground />
      <Header />
      <main className="pt-20">
        <HeroSlider />
        <ECGAnimation />
        <IntroSection />
        <ServicesSection />
        <WhyChooseSection />
        <TeamSection />
        <PartnersSection />
        <ContactSection />
        <HeartbeatDivider />
      </main>
      <Footer />
    </div>
  );
}
