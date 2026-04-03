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

  return (
    <section id="servicos" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">{content.servicesBadge}</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {content.servicesTitle}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {content.servicesSubtitle}
          </p>
        </div>

        {/* Featured Image */}
        <div className="mb-16 relative rounded-2xl overflow-hidden shadow-xl">
          <img
            src={featuredImage}
            alt="Processo de reconstrução de tela"
            className="w-full h-64 md:h-96 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <h3 className="text-2xl md:text-3xl font-bold text-card mb-2">
              {content.servicesImageTitle}
            </h3>
            <p className="text-card/80 max-w-lg">
              {content.servicesImageDescription}
            </p>
          </div>
        </div>

        {/* Service Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {content.servicesCards.map((service, index) => {
            const Icon = serviceIcons[index] || Package;
            const color = index === 1 ? "secondary" : "primary";

            return (
            <Card key={service.title} className="group hover:shadow-lg transition-all duration-300 border-border hover:border-primary/50">
              <CardHeader>
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
                <CardTitle className="text-xl text-foreground">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{service.description}</p>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary">
                  Ver Detalhes
                  <ArrowRight className="w-4 h-4" />
                </Button>
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
              className="flex items-center gap-4 p-6 bg-card rounded-xl border border-border"
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
