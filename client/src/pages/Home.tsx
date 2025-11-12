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

export default function Home() {
  return (
    <div className="min-h-screen relative bg-gradient-to-br from-[#fbfbfb] via-[#f5f3f8] to-[#eae7f0]">
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
