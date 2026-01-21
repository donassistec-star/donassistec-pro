import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, User } from "lucide-react";
import { reviewsService, Review } from "@/services/reviewsService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatDate } from "@/utils/format";

interface ReviewsSectionProps {
  modelId: string;
}

const ReviewsSection = ({ modelId }: ReviewsSectionProps) => {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [modelId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewsService.getByModel(modelId, true); // Apenas aprovadas
      setReviews(data.reviews);
      setAverageRating(data.averageRating);
    } catch (error) {
      console.error("Erro ao carregar avaliações:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated || !user) {
      toast.error("Você precisa estar logado para avaliar");
      return;
    }

    if (rating < 1 || rating > 5) {
      toast.error("Selecione uma avaliação de 1 a 5 estrelas");
      return;
    }

    try {
      setSubmitting(true);
      await reviewsService.create({
        model_id: modelId,
        retailer_id: user.email || "",
        rating,
        comment: comment.trim() || undefined,
      });
      toast.success("Avaliação enviada! Aguarde aprovação do administrador.");
      setShowForm(false);
      setComment("");
      setRating(5);
      loadReviews();
    } catch (error: any) {
      toast.error(error.message || "Erro ao enviar avaliação");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (value: number, interactive = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && setRating(star)}
            disabled={!interactive}
            className={interactive ? "cursor-pointer" : "cursor-default"}
          >
            <Star
              className={`w-5 h-5 ${
                star <= value
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Avaliações</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {renderStars(Math.round(averageRating))}
                  <span className="text-lg font-semibold">
                    {averageRating > 0 ? averageRating.toFixed(1) : "0"}
                  </span>
                  <span className="text-muted-foreground">
                    ({reviews.length} {reviews.length === 1 ? "avaliação" : "avaliações"})
                  </span>
                </div>
              </div>
            </div>
            {isAuthenticated && !showForm && (
              <Button onClick={() => setShowForm(true)}>
                <Star className="w-4 h-4 mr-2" />
                Avaliar Produto
              </Button>
            )}
          </div>

          {/* Formulário de Avaliação */}
          {showForm && isAuthenticated && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Avaliar Produto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Avaliação (1-5 estrelas)
                  </label>
                  {renderStars(rating, true)}
                </div>
                <div>
                  <label htmlFor="comment" className="text-sm font-medium mb-2 block">
                    Comentário (opcional)
                  </label>
                  <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Compartilhe sua experiência com este produto..."
                    rows={4}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSubmit} disabled={submitting}>
                    {submitting ? "Enviando..." : "Enviar Avaliação"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setComment("");
                      setRating(5);
                    }}
                    disabled={submitting}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de Avaliações */}
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando avaliações...
            </div>
          ) : reviews.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  Ainda não há avaliações para este produto.
                  {isAuthenticated && " Seja o primeiro a avaliar!"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">Lojista</div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(review.created_at || "")}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        <Badge variant="outline">{review.rating}/5</Badge>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-muted-foreground mt-3 whitespace-pre-wrap">
                        {review.comment}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
