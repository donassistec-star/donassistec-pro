import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/ui/image-upload";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  retailerTrainingVideosService,
  RetailerTrainingVideo,
} from "@/services/retailerTrainingVideosService";
import { validation } from "@/utils/validation";
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  PlayCircle,
  Plus,
  Save,
  Trash2,
  Video,
} from "lucide-react";

const createEmptyVideo = (order: number): RetailerTrainingVideo => ({
  id: `video-${Date.now()}-${order}`,
  title: "",
  description: "",
  url: "",
  thumbnail: "",
  duration: "",
  category: "",
  order,
  published: true,
});

const getYoutubeThumbnail = (url: string) => {
  const trimmedUrl = url.trim();

  if (trimmedUrl.includes("youtube.com/watch?v=")) {
    const videoId = trimmedUrl.split("v=")[1]?.split("&")[0];
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "";
  }

  if (trimmedUrl.includes("youtu.be/")) {
    const videoId = trimmedUrl.split("youtu.be/")[1]?.split("?")[0];
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "";
  }

  if (trimmedUrl.includes("youtube.com/embed/")) {
    const videoId = trimmedUrl.split("embed/")[1]?.split("?")[0];
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "";
  }

  if (trimmedUrl.includes("youtube.com/shorts/")) {
    const videoId = trimmedUrl.split("shorts/")[1]?.split("?")[0];
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "";
  }

  return "";
};

const AdminRetailerTrainingVideos = () => {
  const [videos, setVideos] = useState<RetailerTrainingVideo[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVideos = async () => {
      try {
        const data = await retailerTrainingVideosService.getAdmin();
        setVideos(data);
      } catch (error) {
        console.error(error);
        toast.error("Erro ao carregar vídeos explicativos");
      } finally {
        setLoading(false);
      }
    };

    loadVideos();
  }, []);

  const updateVideo = (
    id: string,
    field: keyof RetailerTrainingVideo,
    value: string | boolean | number
  ) => {
    setVideos((current) =>
      current.map((video) =>
        video.id === id ? { ...video, [field]: value } : video
      )
    );
  };

  const addVideo = () => {
    setVideos((current) => [...current, createEmptyVideo(current.length)]);
  };

  const removeVideo = (id: string) => {
    setVideos((current) =>
      current
        .filter((video) => video.id !== id)
        .map((video, index) => ({ ...video, order: index }))
    );
  };

  const moveVideo = (index: number, direction: "up" | "down") => {
    setVideos((current) => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= current.length) return current;

      const next = [...current];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];

      return next.map((video, order) => ({ ...video, order }));
    });
  };

  const handleSave = async () => {
    const invalidVideo = videos.find((video) => !video.title.trim() || !video.url.trim());
    if (invalidVideo) {
      toast.error("Preencha título e URL de todos os vídeos antes de salvar");
      return;
    }

    const invalidUrl = videos.find((video) => !validation.isValidUrl(video.url));
    if (invalidUrl) {
      toast.error("Existe vídeo com URL inválida");
      return;
    }

    const invalidThumbnail = videos.find(
      (video) => video.thumbnail?.trim() && !validation.isValidUrl(video.thumbnail)
    );
    if (invalidThumbnail) {
      toast.error("Existe miniatura com URL inválida");
      return;
    }

    try {
      setSaving(true);
      const savedVideos = await retailerTrainingVideosService.save(videos);
      setVideos(savedVideos);
      toast.success("Vídeos explicativos atualizados com sucesso");
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar vídeos explicativos");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground">
              Vídeos do Lojista
            </h1>
            <p className="text-muted-foreground">
              Cadastre os vídeos explicativos exibidos na área do lojista.
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={addVideo}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar vídeo
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </div>

        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Como funciona</CardTitle>
            <CardDescription>
              Cada item pode ter título, descrição, categoria, miniatura e link de vídeo. Links do YouTube funcionam normalmente.
            </CardDescription>
          </CardHeader>
        </Card>

        {loading ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Carregando vídeos...
            </CardContent>
          </Card>
        ) : videos.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Video className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-foreground">
                  Nenhum vídeo cadastrado
                </p>
                <p className="text-sm text-muted-foreground">
                  Crie o primeiro vídeo explicativo para a área do lojista.
                </p>
              </div>
              <Button onClick={addVideo}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar vídeo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {videos.map((video, index) => (
              <Card key={video.id}>
                <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">
                        {video.title || `Vídeo ${index + 1}`}
                      </CardTitle>
                      <Badge variant={video.published ? "default" : "secondary"}>
                        {video.published ? "Publicado" : "Oculto"}
                      </Badge>
                    </div>
                    <CardDescription>
                      Ordem de exibição #{index + 1}
                    </CardDescription>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => moveVideo(index, "up")}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => moveVideo(index, "down")}
                      disabled={index === videos.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeVideo(video.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`title-${video.id}`}>Título</Label>
                    <Input
                      id={`title-${video.id}`}
                      value={video.title}
                      onChange={(event) =>
                        updateVideo(video.id, "title", event.target.value)
                      }
                      placeholder="Ex.: Como fazer um pedido"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`category-${video.id}`}>Categoria</Label>
                    <Input
                      id={`category-${video.id}`}
                      value={video.category || ""}
                      onChange={(event) =>
                        updateVideo(video.id, "category", event.target.value)
                      }
                      placeholder="Ex.: Compras, Cadastro, Financeiro"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`url-${video.id}`}>URL do vídeo</Label>
                    <div className="flex gap-2">
                      <Input
                        id={`url-${video.id}`}
                        value={video.url}
                        onChange={(event) =>
                          updateVideo(video.id, "url", event.target.value)
                        }
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          if (!video.url.trim()) {
                            toast.error("Informe a URL do vídeo primeiro");
                            return;
                          }
                          window.open(video.url, "_blank", "noopener,noreferrer");
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`description-${video.id}`}>Descrição</Label>
                    <Textarea
                      id={`description-${video.id}`}
                      value={video.description || ""}
                      onChange={(event) =>
                        updateVideo(video.id, "description", event.target.value)
                      }
                      placeholder="Explique rapidamente o que o lojista vai aprender neste vídeo."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Label>Miniatura</Label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const thumbnail = getYoutubeThumbnail(video.url);
                          if (!thumbnail) {
                            toast.error("Use um link do YouTube para gerar a miniatura automaticamente");
                            return;
                          }
                          updateVideo(video.id, "thumbnail", thumbnail);
                          toast.success("Miniatura preenchida automaticamente");
                        }}
                      >
                        Auto YouTube
                      </Button>
                    </div>
                    <ImageUpload
                      value={video.thumbnail || ""}
                      onChange={(url) => updateVideo(video.id, "thumbnail", url)}
                      label="Enviar miniatura"
                    />
                    {video.thumbnail ? (
                      <div className="overflow-hidden rounded-lg border bg-muted/30">
                        <img
                          src={video.thumbnail}
                          alt={video.title || "Miniatura do vídeo"}
                          className="aspect-video w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-video items-center justify-center rounded-lg border border-dashed bg-muted/20 text-sm text-muted-foreground">
                        Prévia da miniatura
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`duration-${video.id}`}>Duração</Label>
                    <Input
                      id={`duration-${video.id}`}
                      value={video.duration || ""}
                      onChange={(event) =>
                        updateVideo(video.id, "duration", event.target.value)
                      }
                      placeholder="05:42"
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border px-4 py-3 md:col-span-2">
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">Publicado</p>
                      <p className="text-sm text-muted-foreground">
                        Quando desligado, o vídeo fica salvo mas não aparece para o lojista.
                      </p>
                    </div>
                    <Switch
                      checked={video.published}
                      onCheckedChange={(checked) =>
                        updateVideo(video.id, "published", checked)
                      }
                    />
                  </div>

                  <div className="rounded-lg border bg-muted/30 p-4 md:col-span-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <PlayCircle className="h-4 w-4 text-primary" />
                      Prévia rápida
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {video.url
                        ? "O lojista verá este item na página de vídeos explicativos."
                        : "Informe a URL para disponibilizar este vídeo."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminRetailerTrainingVideos;
