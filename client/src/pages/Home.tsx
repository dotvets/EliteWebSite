import Header from "@/components/Header";
import HeroSlider from "@/components/HeroSlider";
import IntroSection from "@/components/IntroSection";
import ServicesSection from "@/components/ServicesSection";
import WhyChooseSection from "@/components/WhyChooseSection";
import TeamSection from "@/components/TeamSection";
import PartnersSection from "@/components/PartnersSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <HeroSlider />
        <IntroSection />
        <ServicesSection />
        <WhyChooseSection />
        <TeamSection />
        <PartnersSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
