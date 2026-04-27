import { useEffect, useMemo, useState } from "react";
import RetailerLayout from "@/components/retailer/RetailerLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import VideoPlayer from "@/components/video/VideoPlayer";
import {
  retailerTrainingVideosService,
  RetailerTrainingVideo,
} from "@/services/retailerTrainingVideosService";
import {
  Clock3,
  PlayCircle,
  Search,
  Video,
} from "lucide-react";
import { toast } from "sonner";

const RetailerTrainingVideos = () => {
  const [videos, setVideos] = useState<RetailerTrainingVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  useEffect(() => {
    const loadVideos = async () => {
      try {
        const data = await retailerTrainingVideosService.getPublic();
        setVideos(data.filter((video) => video.published));
      } catch (error) {
        console.error(error);
        toast.error("Erro ao carregar vídeos explicativos");
      } finally {
        setLoading(false);
      }
    };

    loadVideos();
  }, []);

  const categories = useMemo(() => {
    const values = Array.from(
      new Set(
        videos
          .map((video) => video.category?.trim())
          .filter((category): category is string => Boolean(category))
      )
    ).sort((a, b) => a.localeCompare(b, "pt-BR"));

    return ["Todos", ...values];
  }, [videos]);

  const categoryCount = Math.max(categories.length - 1, 0);

  const filteredVideos = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return videos.filter((video) => {
      const matchesQuery =
        !normalizedQuery ||
        [video.title, video.description, video.category]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesCategory =
        selectedCategory === "Todos" || video.category?.trim() === selectedCategory;

      return matchesQuery && matchesCategory;
    });
  }, [query, selectedCategory, videos]);

  const totalDuration = useMemo(() => {
    return videos.reduce((total, video) => {
      const value = (video.duration || "").trim();
      if (!/^\d{1,2}:\d{2}$/.test(value)) return total;

      const [minutes, seconds] = value.split(":").map(Number);
      return total + minutes * 60 + seconds;
    }, 0);
  }, [videos]);

  const totalDurationLabel = useMemo(() => {
    if (!totalDuration) return null;

    const hours = Math.floor(totalDuration / 3600);
    const minutes = Math.floor((totalDuration % 3600) / 60);

    if (hours > 0) return `${hours}h ${minutes}min`;
    return `${minutes} min`;
  }, [totalDuration]);

  return (
    <RetailerLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/10 via-background to-background p-6 md:p-8">
          <div className="max-w-3xl space-y-3">
            <Badge variant="secondary" className="w-fit">
              Central de Treinamento
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Vídeos explicativos para lojistas
            </h1>
            <p className="text-muted-foreground md:text-lg">
              Aprenda o fluxo da plataforma com vídeos curtos organizados pela equipe administrativa.
            </p>
          </div>

          <div className="mt-6 max-w-md">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por assunto"
                className="pl-9"
              />
            </div>
          </div>

          {categories.length > 1 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  type="button"
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          ) : null}

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Card className="border-primary/10 bg-background/80">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Vídeos disponíveis</p>
                <p className="text-2xl font-semibold text-foreground">{videos.length}</p>
              </CardContent>
            </Card>
            <Card className="border-primary/10 bg-background/80">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Categorias</p>
                <p className="text-2xl font-semibold text-foreground">
                  {categoryCount}
                </p>
              </CardContent>
            </Card>
            <Card className="border-primary/10 bg-background/80">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Tempo estimado</p>
                <p className="text-2xl font-semibold text-foreground">
                  {totalDurationLabel || "N/D"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Carregando vídeos...
            </CardContent>
          </Card>
        ) : filteredVideos.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Video className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-foreground">
                  Nenhum vídeo disponível
                </p>
                <p className="text-sm text-muted-foreground">
                  {query
                    ? "Nenhum vídeo corresponde ao termo pesquisado."
                    : "A equipe administrativa ainda não cadastrou vídeos explicativos."}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredVideos.map((video) => (
              <Card key={video.id} className="overflow-hidden border-border/70 shadow-sm">
                <div className="aspect-video bg-muted/30">
                  {video.thumbnail ? (
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/20">
                      <PlayCircle className="h-14 w-14 text-primary/80" />
                    </div>
                  )}
                </div>

                <CardHeader className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {video.category ? <Badge variant="outline">{video.category}</Badge> : null}
                    {video.duration ? (
                      <Badge variant="secondary" className="gap-1">
                        <Clock3 className="h-3 w-3" />
                        {video.duration}
                      </Badge>
                    ) : null}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{video.title}</CardTitle>
                    {video.description ? (
                      <CardDescription className="mt-2 line-clamp-3">
                        {video.description}
                      </CardDescription>
                    ) : null}
                  </div>
                </CardHeader>

                <CardContent>
                  <VideoPlayer
                    videoUrl={video.url}
                    title={video.title}
                    className="w-full"
                    trigger={
                      <Button className="w-full">
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Assistir vídeo
                      </Button>
                    }
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </RetailerLayout>
  );
};

export default RetailerTrainingVideos;
