import { Clock, Shield, Award, DollarSign } from "lucide-react";

const benefits = [
  {
    icon: Clock,
    title: "Conserto no Mesmo Dia",
    description: "Agilidade no serviço para você não ficar sem o celular.",
  },
  {
    icon: Shield,
    title: "90 Dias de Garantia",
    description: "Confiança total com garantia em todos os serviços.",
  },
  {
    icon: Award,
    title: "Qualidade de Fábrica",
    description: "Tecnologia exclusiva que preserva a peça original.",
  },
  {
    icon: DollarSign,
    title: "Preço Justo",
    description: "Economize até 70% comparado à troca da tela completa.",
  },
];

const BenefitsSection = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
            Por que escolher a Don Tech?
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto">
            Qualidade, rapidez e economia em um só lugar.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="bg-card rounded-lg p-6 text-center shadow-sm border border-border"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-foreground text-sm md:text-base mb-2">
                  {b.title}
                </h3>
                <p className="text-muted-foreground text-xs md:text-sm">{b.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
