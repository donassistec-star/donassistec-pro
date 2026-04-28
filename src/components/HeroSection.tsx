import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Monitor, Shield, MessageCircle } from "lucide-react";
import { useHomeContent } from "@/contexts/HomeContentContext";
import HeroImageCarousel from "@/components/HeroImageCarousel";
import { cn } from "@/lib/utils";
import { resolveMediaEmbed } from "@/utils/mediaEmbed";

const HeroSection = () => {
  const { content } = useHomeContent();
  const hasImageHero = content.heroMediaType === "image" && Boolean(content.heroImages?.length);
  const showHeroPanel = content.showHeroPanel !== false;
  const isMobileMediaOnlyHero = hasImageHero && !showHeroPanel;
  const heroSubtitle = content.heroSubtitle?.trim();

  const heroMedia = content.heroVideoUrl
    ? resolveMediaEmbed(content.heroVideoUrl, { autoplay: true })
    : null;

  return (
    <section
      className={cn(
        "relative isolate w-full overflow-x-hidden pt-16 lg:pt-20",
        isMobileMediaOnlyHero
          ? "min-h-0 md:flex md:min-h-[calc(100vh-4rem)] md:items-center lg:min-h-screen"
          : "flex min-h-[calc(100vh-4rem)] items-center overflow-y-hidden sm:min-h-[calc(100vh-4rem)] lg:min-h-screen"
      )}
    >
      {/* Background Media */}
      {isMobileMediaOnlyHero ? (
        <div className="relative h-[clamp(18rem,76vw,35rem)] w-full overflow-hidden bg-slate-100 md:absolute md:inset-0 md:h-full">
          <HeroImageCarousel
            images={content.heroImages || []}
            interval={content.heroImageInterval || 5000}
            imageClassName="object-contain object-center md:object-cover"
            overlayClassName="bg-transparent md:bg-black/10"
            className="bg-white"
          />
        </div>
      ) : (
        <div className="absolute inset-0">
          {content.heroMediaType === 'video' && content.heroVideoUrl ? (
            <>
              {/* Vídeo Background Fullscreen */}
              <div className="absolute inset-0 w-full h-full bg-black overflow-hidden">
                {heroMedia?.kind === "iframe" ? (
                  <iframe
                    src={heroMedia.src}
                    className="absolute inset-0 w-full h-full object-cover object-center"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Hero Video"
                    frameBorder="0"
                  />
                ) : heroMedia?.kind === "video" ? (
                  <video
                    className="absolute inset-0 w-full h-full object-cover object-center"
                    autoPlay
                    muted
                    loop
                    playsInline
                  >
                    <source src={heroMedia.src} type="video/mp4" />
                    <source src={heroMedia.src} type="video/webm" />
                    Seu navegador não suporta a tag de vídeo.
                  </video>
                ) : (
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
      )}

      {showHeroPanel ? (
        <div
          className="relative z-10 mx-auto w-full max-w-[1400px] py-6 sm:py-12 md:py-16 lg:py-20"
          style={{
            paddingLeft: "max(0.875rem, env(safe-area-inset-left))",
            paddingRight: "max(0.875rem, env(safe-area-inset-right))",
          }}
        >
          <div className="w-full max-w-full min-w-0 sm:max-w-2xl lg:max-w-3xl">
            <div className="relative w-full max-w-[calc(100vw-1.75rem)] overflow-hidden rounded-[1.5rem] bg-slate-950/60 p-3.5 shadow-xl backdrop-blur-sm sm:max-w-full sm:rounded-[2rem] sm:bg-slate-950/20 sm:p-7 md:p-8 lg:p-10">
              <Badge className="mb-3 inline-flex max-w-full whitespace-normal break-words text-left bg-secondary/25 px-3 py-1 text-[11px] font-medium leading-snug text-white hover:bg-secondary/35 sm:mb-4 sm:text-xs">
                <Shield className="w-3 h-3 mr-1.5 text-white" />
                {content.heroBadge || "O Laboratório Especializado"}
              </Badge>

              <h1 className="mb-3 max-w-[15ch] break-words text-[clamp(1.65rem,8vw,3.75rem)] font-bold leading-[1.02] tracking-tight text-white [overflow-wrap:anywhere] drop-shadow-lg sm:mb-4 md:mb-5 lg:max-w-2xl">
                {content.heroTitle || (
                  <>
                    Laboratório especializado em reparos avançados de telas para celulares, Apple Watch e tablets.
                  </>
                )}
              </h1>

              {heroSubtitle ? (
                <p className="mb-5 max-w-[34rem] break-words text-[clamp(0.92rem,3.8vw,1.125rem)] leading-relaxed text-white [overflow-wrap:anywhere] sm:mb-6">
                  {heroSubtitle}
                </p>
              ) : null}

              <div className="mb-3 flex flex-col gap-3 sm:mb-4 sm:flex-row sm:flex-wrap sm:items-center">
              {content.showHeroPrimaryCta !== false ? (
                <Button
                  variant="whatsapp"
                  size="lg"
                  asChild
                  className="h-auto min-h-12 w-full whitespace-normal justify-center gap-2 px-4 py-3 text-center text-sm leading-snug sm:w-auto sm:px-5 sm:text-base"
                >
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
                  className="h-auto min-h-12 w-full whitespace-normal justify-center border-white/25 px-4 py-3 text-center leading-snug text-white hover:bg-white/5 sm:w-auto sm:px-5"
                  asChild
                >
                  <Link to={content.heroSecondaryCtaLink || "/lojista/login"}>
                    {content.heroSecondaryCtaLabel || "Área do Lojista"}
                  </Link>
                </Button>
              ) : null}
              </div>

              <p className="mb-5 text-xs text-white sm:mb-6">
                Fale com um especialista agora →
              </p>

              {/* Quick Stats */}
              <div className="hidden min-[360px]:grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                    <Smartphone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-white">500+</p>
                    <p className="text-xs text-white">Modelos</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/20">
                    <Monitor className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-white">10k+</p>
                    <p className="text-xs text-white">Telas</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-white">180 dias</p>
                    <p className="text-xs text-white">Garantia</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

    </section>
  );
};

export default HeroSection;
