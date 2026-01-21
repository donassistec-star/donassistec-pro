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

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "step-1": ShoppingCart,
  "step-2": MessageCircle,
  "step-3": FileText,
  "step-4": CheckCircle2,
};

const ProcessSection = () => {
  const { content } = useHomeContent();

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Clock className="w-3 h-3 mr-1" />
            Processo
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {content.processTitle}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {content.processSubtitle}
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {content.steps.map((step, index) => {
              const Icon = iconMap[step.id] || ShoppingCart;
              const isLast = index === content.steps.length - 1;
              
              return (
                <div key={step.id} className="relative">
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border group">
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
                        <Link to={step.href}>
                          <Button variant="outline" size="sm" className="w-full group-hover:border-primary group-hover:text-primary transition-colors">
                            {step.action}
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
