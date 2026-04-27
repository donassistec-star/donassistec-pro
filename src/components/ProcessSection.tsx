import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShoppingCart, 
  MessageCircle, 
  FileText, 
  CheckCircle2,
  ArrowRight,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";
import { useHomeContent } from "@/contexts/HomeContentContext";
import { useAuth } from "@/contexts/AuthContext";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "step-1": ShoppingCart,
  "step-2": MessageCircle,
  "step-3": FileText,
  "step-4": CheckCircle2,
};

const ProcessSection = () => {
  const { content } = useHomeContent();
  const { user } = useAuth();
  const isLojista = user?.role === "retailer";
  const processSubtitle = content.processSubtitle?.trim();

  return (
    <section className="bg-transparent py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Clock className="w-3 h-3 mr-1" />
            Processo
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {content.processTitle}
          </h2>
          {processSubtitle ? (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {processSubtitle}
            </p>
          ) : null}
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {content.steps.map((step, index) => {
              const Icon = iconMap[step.id] || ShoppingCart;
              const isLast = index === content.steps.length - 1;
              
              return (
                <div key={step.id} className="relative">
                  <Card className="group h-full border-white/10 bg-card/82 shadow-[0_18px_48px_rgba(2,8,23,0.16)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_24px_60px_rgba(14,165,233,0.14)]">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="text-4xl font-bold text-muted-foreground/20">
                          {step.number}
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        {step.description}
                      </p>
                      {step.action && step.href && (
                        <Link to={step.href === "/catalogo" && !isLojista ? "/lojista/login" : step.href}>
                          <Button variant="outline" size="sm" className="w-full group-hover:border-primary group-hover:text-primary transition-colors">
                            {step.href === "/catalogo" && !isLojista ? "Acessar como Lojista" : step.action}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Connector Arrow */}
                  {!isLast && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 z-10 transform -translate-y-1/2">
                      <ArrowRight className="w-6 h-6 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Timeline Connector (Mobile) */}
          <div className="lg:hidden relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-muted" />
            {content.steps.map((_, index) => (
              <div
                key={index}
                className="absolute left-5 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full bg-primary"
                style={{ top: `${(index * 100) / (content.steps.length - 1)}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
