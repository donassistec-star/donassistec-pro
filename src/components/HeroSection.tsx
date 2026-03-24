import { MessageCircle, Shield, Clock, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-b2c.jpg";

const WHATSAPP_NUMBER = "5551999999999";
const whatsappLink = (text: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

const HeroSection = () => {
  return (
    <section className="relative min-h-[100svh] flex items-center pt-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Técnico reconstruindo tela de celular"
          className="w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/95 via-secondary/80 to-secondary/50" />
      </div>

      <div className="container mx-auto px-4 relative z-10 py-12">
        <div className="max-w-2xl">
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-card leading-tight mb-6">
            Não troque sua tela original por uma paralela.{" "}
            <span className="text-primary-foreground/90">Recupere-a na Don Tech.</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-card/85 mb-8 leading-relaxed max-w-xl">
            Única assistência no RS com tecnologia de fábrica para reconstrução
            de vidro. Economize até 70% mantendo o toque e as cores originais.
          </p>

          <Button
            size="lg"
            className="bg-[hsl(142,72%,40%)] hover:bg-[hsl(142,72%,35%)] text-card font-heading font-bold text-base sm:text-lg px-8 py-6 rounded-lg shadow-lg"
            asChild
          >
            <a
              href={whatsappLink("Olá! Gostaria de fazer um orçamento grátis.")}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Fazer Orçamento Grátis no WhatsApp
            </a>
          </Button>

          {/* Quick trust badges */}
          <div className="flex flex-wrap gap-6 mt-10">
            {[
              { icon: Clock, text: "No mesmo dia" },
              { icon: Shield, text: "90 dias garantia" },
              { icon: Award, text: "Qualidade de fábrica" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-card/80">
                <Icon className="w-5 h-5 text-primary-foreground/70" />
                <span className="text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
