import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import BrandsSection from "@/components/BrandsSection";
import ServicesSection from "@/components/ServicesSection";
import FeaturesSection from "@/components/FeaturesSection";
import StatsSection from "@/components/StatsSection";
import ProcessSection from "@/components/ProcessSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import DifferentialsSection from "@/components/DifferentialsSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { useHomeContent } from "@/contexts/HomeContentContext";

const Index = () => {
  const { content } = useHomeContent();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content">
        {content.showHero !== false && <HeroSection />}
        {content.showBrands !== false && <BrandsSection />}
        {content.showServices !== false && <ServicesSection />}
        {content.showFeatures !== false && <FeaturesSection />}
        {content.showStats !== false && <StatsSection />}
        {content.showProcess !== false && <ProcessSection />}
        {content.showTestimonials !== false && <TestimonialsSection />}
        {content.showDifferentials !== false && <DifferentialsSection />}
        {content.showCta !== false && <CTASection />}
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default Index;
