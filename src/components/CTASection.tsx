import { Button } from "@/components/ui/button";
import { MessageCircle, Phone } from "lucide-react";

const CTASection = () => {
  const whatsappNumber = "5511999999999";
  const whatsappMessage = encodeURIComponent(
    "Olá! Sou lojista e gostaria de saber mais sobre peças e serviços de reconstrução de telas da DonAssistec."
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <section id="contato" className="py-20 bg-gradient-to-br from-primary to-primary/80">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
          Precisa de Peças ou Reconstrução?
        </h2>
        <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
          Fale com nossa equipe especializada e receba um orçamento sem compromisso. 
          Atendimento exclusivo para lojistas e assistências técnicas.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="whatsapp"
            size="xl"
            onClick={() => window.open(whatsappUrl, "_blank")}
            className="gap-3"
          >
            <MessageCircle className="w-6 h-6" />
            Chamar no WhatsApp
          </Button>
          <Button
            variant="outline"
            size="xl"
            className="border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground hover:text-primary"
          >
            <Phone className="w-5 h-5" />
            (11) 99999-9999
          </Button>
        </div>

        {/* Info Strip */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/20">
          <div className="flex flex-wrap justify-center gap-8 text-primary-foreground/80">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              <span>(11) 99999-9999</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📍 São Paulo - SP</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✅ Garantia de 90 dias</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
