import { Badge } from "@/components/ui/badge";
import { Truck, Calculator, Headphones, Shield, Clock, Award } from "lucide-react";

const differentials = [
  {
    icon: Truck,
    title: "Retiramos e Entregamos",
    description: "Logística própria para retirada e entrega em sua loja com rapidez e segurança.",
  },
  {
    icon: Calculator,
    title: "Orçamento Online",
    description: "Sistema rápido de cotação online com preços B2B transparentes e competitivos.",
  },
  {
    icon: Headphones,
    title: "Suporte 24h",
    description: "Atendimento especializado para lojistas via WhatsApp, telefone e chat.",
  },
  {
    icon: Shield,
    title: "Garantia 90 dias",
    description: "Cobertura completa em todas as peças e serviços de reconstrução.",
  },
  {
    icon: Clock,
    title: "Entrega Express",
    description: "Peças em estoque com envio imediato. Receba em até 24 horas.",
  },
  {
    icon: Award,
    title: "Qualidade Premium",
    description: "Máquinas industriais de última geração para reconstrução perfeita.",
  },
];

const DifferentialsSection = () => {
  return (
    <section id="diferenciais" className="py-20 bg-foreground">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
            Por que a DonAssistec?
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-card mb-4">
            Diferenciais que <span className="text-secondary">Fazem a Diferença</span>
          </h2>
          <p className="text-lg text-card/70 max-w-2xl mx-auto">
            Infraestrutura completa e atendimento exclusivo para lojistas 
            e assistências técnicas parceiras.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {differentials.map((item) => (
            <div
              key={item.title}
              className="group p-6 rounded-2xl bg-card/5 border border-card/10 hover:bg-card/10 hover:border-primary/30 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                <item.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card mb-2">{item.title}</h3>
              <p className="text-card/70">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DifferentialsSection;
