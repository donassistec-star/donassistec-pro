import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Monitor, Shield, ArrowRight } from "lucide-react";
import { useHomeContent } from "@/contexts/HomeContentContext";
import VideoPlayer from "@/components/video/VideoPlayer";

const HeroSection = () => {
  const { content } = useHomeContent();

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Media */}
      <div className="absolute inset-0">
        {content.heroMediaType === 'image' && content.heroImageUrl ? (
          <>
            <img
              src={content.heroImageUrl}
              alt="Laboratório DonAssistec"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/95 via-foreground/85 to-foreground/60" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground to-foreground/95" />
        )}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className={`grid ${content.heroMediaType === 'video' && content.heroVideoUrl ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-12 items-center`}>
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
              {content.heroSubtitle || "Peças premium e telas reconstruídas para lojistas e assistências técnicas. Máquinas de última geração e atendimento exclusivo B2B."}
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              {content.showHeroPrimaryCta !== false ? (
                <Button variant="hero" size="xl" asChild>
                  <Link to={content.heroCtaLink || "/catalogo"}>
                    {content.heroCtaLabel || "Explorar Catálogo"}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
              ) : null}
              {content.showHeroSecondaryCta !== false ? (
                <Button
                  variant="outline"
                  size="xl"
                  className="border-card/40 text-card hover:bg-card hover:text-foreground"
                  asChild
                >
                  <Link to={content.heroSecondaryCtaLink || "/lojista/login"}>
                    {content.heroSecondaryCtaLabel || "Área do Lojista"}
                  </Link>
                </Button>
              ) : null}
            </div>

            {/* Quick Stats */}
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

          {/* Video Section */}
          {content.heroMediaType === 'video' && content.heroVideoUrl && (
            <div className="flex items-center justify-center">
              <div className="rounded-lg overflow-hidden bg-black/20 backdrop-blur-sm border border-card/20 p-6">
                <VideoPlayer
                  videoUrl={content.heroVideoUrl}
                  title="Conheça a DonAssistec"
                  trigger={
                    <div className="relative group cursor-pointer">
                      <div className="w-64 h-80 rounded-lg overflow-hidden bg-gradient-to-br from-secondary/30 to-primary/30 flex items-center justify-center">
                        <div className="absolute inset-0 group-hover:bg-black/40 transition-colors" />
                        <div className="relative z-10 w-16 h-16 rounded-full bg-card/90 flex items-center justify-center group-hover:bg-card transition-colors">
                          <ArrowRight className="w-6 h-6 text-foreground group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
