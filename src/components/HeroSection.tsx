import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Monitor, Shield, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-laboratory.jpg";
import { useHomeContent } from "@/contexts/HomeContentContext";
import { useAuth } from "@/contexts/AuthContext";

const HeroSection = () => {
  const { content } = useHomeContent();
  const { user } = useAuth();
  const isLojista = user?.role === "retailer";
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={content.heroImage || heroImage}
          alt="Laboratório DonAssistec"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/95 via-foreground/85 to-foreground/60" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <Badge className="mb-6 bg-secondary/20 text-secondary border-secondary/40 hover:bg-secondary/30">
            <Shield className="w-3 h-3 mr-1" />
            {content.heroBadge || "Laboratório Premium B2B"}
          </Badge>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-card mb-6 leading-tight">
            {content.heroTitle || (
              <>
                Reconstrução de Telas com{" "}
                <span className="text-secondary">Tecnologia Industrial</span>
              </>
            )}
          </h1>

          <p className="text-lg md:text-xl text-card/80 mb-8 leading-relaxed">
            {content.heroSubtitle ||
              "Peças premium e telas reconstruídas para lojistas e assistências técnicas. Máquinas de última geração e atendimento exclusivo B2B."}
          </p>

          <div className="flex flex-wrap gap-4 mb-12">
            <Button variant="hero" size="xl" asChild>
              <Link to={isLojista ? (content.heroCtaLink || "/catalogo") : "/lojista/login"}>
                {isLojista ? (content.heroCtaLabel || "Consultar Catálogo") : "Área do Lojista"}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="outline" size="xl" className="border-card/40 text-card hover:bg-card hover:text-foreground">
              {content.heroSecondaryCtaLabel || "Falar no WhatsApp"}
            </Button>
          </div>

          <div className="flex flex-wrap gap-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card">500+</p>
                <p className="text-sm text-card/70">Modelos Compatíveis</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                <Monitor className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card">10k+</p>
                <p className="text-sm text-card/70">Telas Reconstruídas</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card">90 dias</p>
                <p className="text-sm text-card/70">Garantia Total</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
