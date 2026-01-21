import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Plus,
  Save,
  Trash2,
  Video,
  Loader2,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { modelsService } from "@/services/modelsService";
import {
  modelVideosService,
  ModelVideoFrontend,
} from "@/services/modelVideosService";
import { PhoneModel } from "@/data/models";
import { toast } from "sonner";
import { LoadingSkeleton } from "@/components/ui/loading";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ModelVideosAdmin = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const modelId = id || "";

  const [model, setModel] = useState<PhoneModel | null>(null);
  const [videos, setVideos] = useState<ModelVideoFrontend[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState<Partial<ModelVideoFrontend>>({
    title: "",
    url: "",
    thumbnail: "",
    duration: "",
    order: 0,
  });

  useEffect(() => {
    if (!modelId) return;
    loadData();
  }, [modelId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [modelData, videosData] = await Promise.all([
        modelsService.getById(modelId),
        modelVideosService.getAll(modelId),
      ]);
      if (!modelData) {
        toast.error("Modelo não encontrado");
        navigate("/admin/modelos");
        return;
      }
      setModel(modelData);
      setVideos(videosData);
    } catch (error) {
      toast.error("Erro ao carregar vídeos do modelo");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: "",
      url: "",
      thumbnail: "",
      duration: "",
      order: (videos[videos.length - 1]?.order ?? videos.length) + 1,
    });
  };

  const handleEdit = (video: ModelVideoFrontend) => {
    setEditingId(video.id || null);
    setFormData({
      title: video.title,
      url: video.url,
      thumbnail: video.thumbnail,
      duration: video.duration,
      order: video.order,
    });
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: number; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteClick = (videoId?: number, title?: string) => {
    if (!videoId) return;
    setItemToDelete({ id: videoId, title: title || "Sem título" });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete || !modelId) return;

    try {
      setDeleting(true);
      await modelVideosService.delete(modelId, itemToDelete.id);
      toast.success("Vídeo deletado com sucesso!");
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar vídeo");
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.url) {
      toast.error("Preencha pelo menos título e URL do vídeo");
      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        await modelVideosService.update(modelId, editingId, {
          title: formData.title!,
          url: formData.url!,
          thumbnail: formData.thumbnail,
          duration: formData.duration,
          order: formData.order,
          modelId,
          id: editingId,
        });
        toast.success("Vídeo atualizado com sucesso!");
      } else {
        await modelVideosService.create(modelId, {
          title: formData.title!,
          url: formData.url!,
          thumbnail: formData.thumbnail,
          duration: formData.duration,
          order: formData.order,
        });
        toast.success("Vídeo criado com sucesso!");
      }

      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar vídeo");
    } finally {
      setSaving(false);
    }
  };

  if (!modelId) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">
            ID do modelo não informado.
          </p>
        </div>
      </AdminLayout>
    );
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin/modelos")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Vídeos do Modelo
              </h1>
            </div>
          </div>
          <LoadingSkeleton count={4} className="h-24" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/modelos")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Vídeos do Modelo
            </h1>
            <p className="text-muted-foreground">
              Gerencie os vídeos tutoriais do modelo{" "}
              <span className="font-semibold">
                {model?.name || modelId}
              </span>
            </p>
          </div>
        </div>

        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              {editingId ? "Editar Vídeo" : "Novo Vídeo"}
            </CardTitle>
            <CardDescription>
              {editingId
                ? "Atualize as informações do vídeo selecionado"
                : "Adicione um novo vídeo ao modelo"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="ex: Reconstrução de Tela iPhone 15 Pro Max"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duração (opcional)</Label>
                  <Input
                    id="duration"
                    value={formData.duration || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        duration: e.target.value,
                      }))
                    }
                    placeholder="ex: 5:30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">URL do Vídeo</Label>
                <Input
                  id="url"
                  value={formData.url || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      url: e.target.value,
                    }))
                  }
                  placeholder="https://www.youtube.com/embed/..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail">URL da Thumbnail (opcional)</Label>
                <Input
                  id="thumbnail"
                  value={formData.thumbnail || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      thumbnail: e.target.value,
                    }))
                  }
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Ordem (opcional)</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      order: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    }))
                  }
                  placeholder="0, 1, 2..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    disabled={saving}
                  >
                    Cancelar edição
                  </Button>
                )}
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {editingId ? "Atualizar" : "Adicionar"} Vídeo
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Lista de vídeos */}
        <Card>
          <CardHeader>
            <CardTitle>Vídeos Cadastrados ({videos.length})</CardTitle>
            <CardDescription>
              Lista de vídeos tutoriais vinculados a este modelo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {videos.length === 0 ? (
              <div className="text-center py-10">
                <Video className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-2">
                  Nenhum vídeo cadastrado ainda para este modelo.
                </p>
                <p className="text-xs text-muted-foreground">
                  Use o formulário acima para adicionar o primeiro vídeo.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ordem</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Duração</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {videos.map((video) => (
                      <TableRow key={video.id}>
                        <TableCell>
                          <Badge variant="outline">
                            {video.order ?? 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="font-medium truncate">
                            {video.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ID: {video.id}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="text-xs text-muted-foreground truncate">
                            {video.url}
                          </div>
                        </TableCell>
                        <TableCell>
                          {video.duration ? (
                            <Badge variant="secondary">
                              {video.duration}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Não informado
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(video)}
                              title="Editar"
                            >
                              <Plus className="w-4 h-4 rotate-45" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleDeleteClick(video.id, video.title)
                              }
                              title="Deletar"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar o vídeo <strong>"{itemToDelete?.title}"</strong>?
              <br />
              <br />
              Esta ação não pode ser desfeita. O vídeo será permanentemente removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default ModelVideosAdmin;

