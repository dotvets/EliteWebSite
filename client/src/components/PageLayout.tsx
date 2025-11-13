import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PetBackground from "@/components/PetBackground";

interface PageLayoutProps {
  children: React.ReactNode;
  dataTestId?: string;
}

export default function PageLayout({ children, dataTestId }: PageLayoutProps) {
  return (
    <div className="min-h-screen relative bg-gradient-to-br from-[#fbfbfb] via-[#f5f3f8] to-[#eae7f0]" data-testid={dataTestId}>
      <PetBackground />
      <Header />
      <div className="relative z-10">
        <main className="relative pt-20">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
