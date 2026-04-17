import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Monitor, Shield, MessageCircle } from "lucide-react";
import { useHomeContent } from "@/contexts/HomeContentContext";
import HeroImageCarousel from "@/components/HeroImageCarousel";

const HeroSection = () => {
  const { content } = useHomeContent();

  // Converter URL do vídeo para formato embed com autoplay
  const getEmbedUrl = (url: string, autoplay: boolean = true) => {
    const params = new URLSearchParams();
    if (autoplay) params.append('autoplay', '1');
    params.append('mute', '1');
    params.append('loop', '1');

    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1].split("&")[0];
      return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1].split("?")[0];
      return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
    }
    if (url.includes("youtube.com/shorts/")) {
      const videoId = url.split("youtube.com/shorts/")[1].split("?")[0];
      return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
    }
    if (url.includes("instagram.com/reel/") || url.includes("instagram.com/p/") || url.includes("instagram.com/tv/")) {
      try {
        const parsed = new URL(url);
        const cleanPath = parsed.pathname.replace(/\/$/, "");
        return `https://www.instagram.com${cleanPath}/embed`;
      } catch {
        return url;
      }
    }
    return url;
  };

  return (
    <section className="relative min-h-[50vh] sm:min-h-[60vh] md:min-h-[72vh] lg:min-h-screen flex items-center overflow-hidden">
      {/* Background Media */}
      <div className="absolute inset-0">
        {content.heroMediaType === 'video' && content.heroVideoUrl ? (
          <>
            {/* Vídeo Background Fullscreen */}
            <div className="absolute inset-0 w-full h-full bg-black overflow-hidden">
              {content.heroVideoUrl.startsWith('http') && (content.heroVideoUrl.includes('youtube') || content.heroVideoUrl.includes('instagram') || content.heroVideoUrl.includes('vimeo')) ? (
                // URLs externas (YouTube, Instagram, Vimeo) - usar iframe
                <iframe
                  src={getEmbedUrl(content.heroVideoUrl, true)}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Hero Video"
                  frameBorder="0"
                />
              ) : (
                // Vídeos locais - usar tag video
                <video
                  className="absolute inset-0 w-full h-full object-cover object-center"
                  autoPlay
                  muted
                  loop
                  playsInline
                >
                  <source src={content.heroVideoUrl} type="video/mp4" />
                  <source src={content.heroVideoUrl} type="video/webm" />
                  Seu navegador não suporta a tag de vídeo.
                </video>
              )}
            </div>
            {/* Overlay para melhorar legibilidade do texto */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-black/90" />
          </>
        ) : content.heroMediaType === 'image' && content.heroImages && content.heroImages.length > 0 ? (
          <>
            <HeroImageCarousel 
              images={content.heroImages} 
              interval={content.heroImageInterval || 5000}
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        )}
      </div>

      <div className="container mx-auto px-4 relative z-10 py-6 sm:py-8 md:py-12 lg:py-20">
        <div className="max-w-2xl">
          {content.showHeroPanel !== false && (
          <div className="relative overflow-hidden rounded-3xl bg-slate-950/0 sm:bg-slate-950/5 p-5 sm:p-7 md:p-8 shadow-xl backdrop-blur-sm">
            <Badge className="mb-3 sm:mb-4 bg-secondary/25 text-secondary border-secondary/50 hover:bg-secondary/35 text-xs sm:text-xs font-medium">
              <Shield className="w-3 h-3 mr-1.5" />
              {content.heroBadge || "O Laboratório Especializado"}
            </Badge>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 md:mb-5 leading-tight tracking-tight drop-shadow-lg">
              {content.heroTitle || (
                <>
                  Laboratório especializado em reparos avançados de telas para celulares, Apple Watch e tablets.
                </>
              )}
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-white/85 mb-5 sm:mb-6 max-w-2xl leading-relaxed">
              {content.heroSubtitle || "Trabalhamos com técnicas de reconstrução que preservam a originalidade do seu aparelho, utilizando materiais de alta qualidade e garantindo excelência em cada serviço realizado. Nosso compromisso é entregar resultados precisos, duráveis e com acabamento impecável."}
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center mb-3 sm:mb-4">
              {content.showHeroPrimaryCta !== false ? (
                <Button variant="whatsapp" size="lg" asChild className="w-full sm:w-auto justify-center gap-2 text-sm sm:text-base">
                  <Link to={content.heroCtaLink || "/catalogo"}>
                    <MessageCircle className="w-5 h-5" />
                    {content.heroCtaLabel || "Fazer orçamento no WhatsApp"}
                  </Link>
                </Button>
              ) : null}
              {content.showHeroSecondaryCta !== false ? (
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto justify-center border-white/25 text-white hover:bg-white/5"
                  asChild
                >
                  <Link to={content.heroSecondaryCtaLink || "/lojista/login"}>
                    {content.heroSecondaryCtaLabel || "Área do Lojista"}
                  </Link>
                </Button>
              ) : null}
            </div>

            <p className="text-xs text-white/60 mb-4 sm:mb-5">
              Fale com um especialista agora →
            </p>

            {/* Quick Stats */}
            <div className="hidden lg:grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-base font-bold text-white">500+</p>
                <p className="text-xs text-white/60">Modelos</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                <Monitor className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-base font-bold text-white">10k+</p>
                <p className="text-xs text-white/60">Telas</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-base font-bold text-white">90 dias</p>
                <p className="text-xs text-white/60">Garantia</p>
              </div>
            </div>
          </div>
          </div>
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute right-4 bottom-4 hidden lg:flex items-center justify-center w-16 h-16 rounded-full bg-[#25d366] shadow-[0_24px_52px_-20px_rgba(37,211,102,0.95)] border border-white/20">
        <MessageCircle className="w-7 h-7 text-white" />
      </div>
    </section>
  );
};

export default HeroSection;
