import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Carlos Silva",
    role: "Proprietário - TechCell SP",
    content: "Excelente qualidade nas telas reconstruídas! Meus clientes não percebem diferença do original. Parceria de anos com a DonAssistec.",
    rating: 5,
    avatar: "CS",
  },
  {
    name: "Marina Santos",
    role: "Gerente - Celular Express",
    content: "O tempo de entrega é impressionante. Preciso das peças e em 24h já está na loja. Estoque sempre completo e preços B2B reais.",
    rating: 5,
    avatar: "MS",
  },
  {
    name: "Roberto Almeida",
    role: "Técnico - Mobile Fix",
    content: "A garantia de 90 dias dá segurança total. Já testei outras empresas, mas a DonAssistec é referência em reconstrução premium.",
    rating: 5,
    avatar: "RA",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">Depoimentos</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Feedback dos <span className="text-primary">Nossos Parceiros</span>
          </h2>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-secondary text-secondary" />
              ))}
            </div>
            <span className="text-muted-foreground">4.9/5 de 1.500+ avaliações</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="border-border hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <Quote className="w-8 h-8 text-primary/20 mb-4" />
                <p className="text-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mt-4 pt-4 border-t border-border">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
