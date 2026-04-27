import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Monitor, Wrench, Package, Zap, Clock, Shield, ArrowRight } from "lucide-react";
import screenReconstructionImage from "@/assets/screen-reconstruction.jpg";
import { useHomeContent } from "@/contexts/HomeContentContext";

const serviceIcons = [Monitor, Wrench, Package];
const highlightIcons = [Zap, Clock, Shield];

const ServicesSection = () => {
  const { content } = useHomeContent();
  const featuredImage = content.servicesImage || screenReconstructionImage;
  const servicesSubtitle = content.servicesSubtitle?.trim();

  return (
    <section id="servicos" className="bg-transparent py-16 sm:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">{content.servicesBadge}</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {content.servicesTitle}
          </h2>
          {servicesSubtitle ? (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {servicesSubtitle}
            </p>
          ) : null}
        </div>

        {/* Featured Image */}
        <div className="relative mb-16 overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950 shadow-[0_25px_80px_rgba(2,8,23,0.48)] sm:rounded-[2rem]">
          <img
            src={featuredImage}
            alt="Processo de reconstrução de tela"
            className="h-[18rem] w-full object-cover sm:h-[22rem] md:h-[26rem] lg:h-[30rem]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(2,6,23,0.94)_0%,rgba(15,23,42,0.76)_45%,rgba(15,23,42,0.28)_100%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/30 to-slate-950/15" />
          <div className="absolute inset-0 flex items-center justify-center p-5 sm:p-8 lg:p-12">
            <div className="w-full max-w-3xl rounded-[1.5rem] border border-white/10 bg-slate-950/30 px-5 py-6 text-center shadow-xl backdrop-blur-[3px] sm:px-8 sm:py-8 lg:px-10 lg:py-10">
              <h3 className="mx-auto mb-3 max-w-2xl text-2xl font-bold leading-tight text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.55)] sm:text-3xl lg:text-4xl">
                {content.servicesImageTitle}
              </h3>
              <p className="mx-auto max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base lg:text-lg">
                {content.servicesImageDescription}
              </p>
            </div>
          </div>
        </div>

        {/* Service Cards */}
        <div className="mb-16 grid items-stretch gap-6 md:auto-rows-fr md:grid-cols-3">
          {content.servicesCards.map((service, index) => {
            const Icon = serviceIcons[index] || Package;
            const color = index === 1 ? "secondary" : "primary";

            return (
            <Card key={service.title} className="group flex h-full min-h-[24rem] flex-col border-white/10 bg-card/85 shadow-[0_18px_50px_rgba(2,8,23,0.18)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_24px_60px_rgba(14,165,233,0.16)] md:min-h-[30rem]">
              <CardHeader className="min-h-[8.5rem] flex-none">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    color === "primary" ? "bg-primary/10" : "bg-secondary/10"
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      color === "primary" ? "text-primary" : "text-secondary"
                    }`} />
                  </div>
                  <Badge variant={color === "primary" ? "default" : "secondary"}>
                    {service.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl leading-tight text-foreground">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-6">
                <div className="flex flex-1 flex-col">
                  <p className="mb-4 text-muted-foreground">{service.description}</p>
                  <ul className="space-y-2">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex justify-center pt-6">
                  <Button variant="outline" className="w-full max-w-[200px] justify-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary">
                    Ver Detalhes
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>

        {/* Highlights */}
        <div className="grid md:grid-cols-3 gap-6">
          {content.servicesHighlights.map((highlight, index) => {
            const Icon = highlightIcons[index] || Shield;

            return (
            <div
              key={highlight.label}
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-card/80 p-6 shadow-[0_16px_42px_rgba(2,8,23,0.16)] backdrop-blur-sm"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{highlight.label}</p>
                <p className="text-lg font-semibold text-foreground">{highlight.value}</p>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
