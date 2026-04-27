import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Shield, 
  Award, 
  Clock, 
  Users, 
  TrendingUp,
} from "lucide-react";
import { useHomeContent } from "@/contexts/HomeContentContext";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "fast-delivery": Zap,
  "full-warranty": Shield,
  "premium-quality": Award,
  "support": Clock,
  "partnership": Users,
  "pricing": TrendingUp,
};

const FeaturesSection = () => {
  const { content } = useHomeContent();
  const featuresSubtitle = content.featuresSubtitle?.trim();

  return (
    <section className="bg-transparent py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            Diferenciais
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {content.featuresTitle || (
              <>
                Por Que Escolher a <span className="text-primary">DonAssistec</span>?
              </>
            )}
          </h2>
          {featuresSubtitle ? (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {featuresSubtitle}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {content.features.map((feature) => {
            const Icon = iconMap[feature.id] || Zap;
            return (
              <Card
                key={feature.id}
                className="group border-white/10 bg-card/82 shadow-[0_18px_48px_rgba(2,8,23,0.16)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_24px_60px_rgba(14,165,233,0.14)]"
              >
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
