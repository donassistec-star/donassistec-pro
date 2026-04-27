import { Smartphone, Monitor, Battery, HelpCircle, MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "5551999999999";
const whatsappLink = (text: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

const triageCards = [
  {
    icon: Smartphone,
    title: "Só o vidro quebrou?",
    description: "Reconstruímos o vidro mantendo a tela original.",
    whatsappText: "Olá! O vidro do meu celular trincou. Gostaria de um orçamento.",
  },
  {
    icon: Monitor,
    title: "Tela com manchas ou preta?",
    description: "Analisamos o display e indicamos a melhor solução.",
    whatsappText: "Olá! A tela do meu celular está com manchas/preta. Podem me ajudar?",
  },
  {
    icon: Battery,
    title: "Bateria ou Carga?",
    description: "Troca de bateria com peças de qualidade e garantia.",
    whatsappText: "Olá! Preciso trocar a bateria do meu celular. Qual o valor?",
  },
  {
    icon: HelpCircle,
    title: "Outros Problemas?",
    description: "Fale com nosso suporte para qualquer outra necessidade.",
    whatsappText: "Olá! Tenho um problema com meu celular e gostaria de ajuda.",
  },
];

const TriageSection = () => {
  return (
    <section className="py-16 md:py-24 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
            Qual é o problema do seu celular?
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
            Selecione abaixo e fale direto com nosso time pelo WhatsApp.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {triageCards.map((card) => {
            const Icon = card.icon;
            return (
              <a
                key={card.title}
                href={whatsappLink(card.whatsappText)}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-card rounded-lg p-6 text-center shadow-sm hover:shadow-md border border-border hover:border-primary/40 transition-all duration-200"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-foreground text-base mb-2">
                  {card.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">{card.description}</p>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:underline">
                  <MessageCircle className="w-4 h-4" />
                  Falar no WhatsApp
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TriageSection;
