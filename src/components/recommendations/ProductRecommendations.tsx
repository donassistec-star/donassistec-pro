import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingUp, Star, Package } from "lucide-react";
import { PhoneModel } from "@/data/models";
import { useNavigate } from "react-router-dom";

interface ProductRecommendationsProps {
  recommendations: Array<{
    model: PhoneModel;
    reason: string;
    score: number;
  }>;
}

const ProductRecommendations = ({ recommendations }: ProductRecommendationsProps) => {
  const navigate = useNavigate();

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Produtos Recomendados para Você
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.slice(0, 6).map((rec) => (
            <Card
              key={rec.model.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/modelo/${rec.model.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="relative w-16 h-16 bg-muted/30 rounded-lg overflow-hidden shrink-0">
                    {rec.model.image && (
                      <img
                        src={rec.model.image}
                        alt={rec.model.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {!rec.model.image && (
                      <Package className="w-8 h-8 text-muted-foreground m-auto mt-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate mb-1">
                      {rec.model.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {rec.reason}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        <Star className="w-3 h-3 mr-1" />
                        {rec.score.toFixed(1)}
                      </Badge>
                      {rec.model.popular && (
                        <Badge variant="secondary" className="text-xs">
                          Popular
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/modelo/${rec.model.id}`);
                  }}
                >
                  Ver Detalhes
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductRecommendations;
