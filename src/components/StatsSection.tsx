import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Smartphone, 
  TrendingUp, 
  Users, 
  Award,
} from "lucide-react";
import { useHomeContent } from "@/contexts/HomeContentContext";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  models: Smartphone,
  screens: TrendingUp,
  retailers: Users,
  awards: Award,
};

const StatsSection = () => {
  const { content } = useHomeContent();

  return (
    <section className="py-20 bg-gradient-to-br from-primary to-primary/80">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
            <TrendingUp className="w-3 h-3 mr-1" />
            Números
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            {content.statsTitle}
          </h2>
          <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
            {content.statsSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-6xl mx-auto">
          {content.stats.map((stat) => {
            const Icon = iconMap[stat.id] || Smartphone;
            return (
              <Card
                key={stat.id}
                className="bg-card/90 backdrop-blur-sm border-card/20 hover:shadow-lg transition-all duração-300 hover:-translate-y-1 group text-center"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {stat.value}
                  </div>
                  <div className="text-sm font-semibold text-foreground mb-1">
                    {stat.label}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {stat.description}
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

export default StatsSection;
