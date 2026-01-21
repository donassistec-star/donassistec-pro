import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Save,
  Loader2,
  Smartphone,
} from "lucide-react";
import RetailerLayout from "@/components/retailer/RetailerLayout";
import { modelsService, brandsService } from "@/services/modelsService";
import { PhoneModel, Brand } from "@/data/models";
import { toast } from "sonner";

const ModelForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  
  const [formData, setFormData] = useState<Partial<PhoneModel>>({
    id: "",
    brand: "",
    name: "",
    image: "",
    videoUrl: "",
    availability: "in_stock",
    premium: false,
    popular: false,
    services: {
      reconstruction: false,
      glassReplacement: false,
      partsAvailable: false,
    },
  });

  useEffect(() => {
    loadBrands();
    if (isEditing && id) {
      loadModel(id);
    }
  }, [id, isEditing]);

  const loadBrands = async () => {
    try {
      const brandsData = await brandsService.getAll();
      setBrands(brandsData);
    } catch (error) {
      toast.error("Erro ao carregar marcas");
    }
  };

  const loadModel = async (modelId: string) => {
    try {
      setLoading(true);
      const model = await modelsService.getById(modelId);
      if (model) {
        setFormData(model);
      } else {
        toast.error("Modelo não encontrado");
        navigate("/lojista/modelos");
      }
    } catch (error) {
      toast.error("Erro ao carregar modelo");
      navigate("/lojista/modelos");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.brand) {
      toast.error("Preencha pelo menos o nome e a marca do modelo");
      return;
    }

    try {
      setSaving(true);
      
      if (isEditing && id) {
        await modelsService.update(id, formData);
        toast.success("Modelo atualizado com sucesso!");
      } else {
        // Gerar ID baseado no nome e marca se não fornecido
        if (!formData.id) {
          const brandName = brands.find((b) => b.id === formData.brand)?.name || "";
          const idBase = `${formData.brand}-${formData.name.toLowerCase().replace(/\s+/g, "-")}`;
          formData.id = idBase;
        }
        
        await modelsService.create(formData);
        toast.success("Modelo criado com sucesso!");
      }
      
      navigate("/lojista/modelos");
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar modelo");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleServiceChange = (service: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      services: {
        ...prev.services,
        [service]: checked,
      },
    }));
  };

  if (loading) {
    return (
      <RetailerLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </RetailerLayout>
    );
  }

  return (
    <RetailerLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/lojista/modelos")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isEditing ? "Editar Modelo" : "Novo Modelo"}
            </h1>
            <p className="text-muted-foreground">
              {isEditing
                ? "Atualize as informações do modelo"
                : "Adicione um novo modelo ao catálogo"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>
                Dados principais do modelo de celular
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="id">
                    ID do Modelo {!isEditing && <span className="text-muted-foreground">(opcional)</span>}
                  </Label>
                  <Input
                    id="id"
                    value={formData.id || ""}
                    onChange={(e) => handleChange("id", e.target.value)}
                    placeholder="ex: iphone-15-pro-max"
                    disabled={isEditing}
                    className={isEditing ? "bg-muted" : ""}
                  />
                  {!isEditing && (
                    <p className="text-xs text-muted-foreground">
                      Deixe vazio para gerar automaticamente
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">
                    Marca <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.brand || ""}
                    onValueChange={(value) => handleChange("brand", value)}
                  >
                    <SelectTrigger id="brand">
                      <SelectValue placeholder="Selecione a marca" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">
                  Nome do Modelo <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="ex: iPhone 15 Pro Max"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="image">URL da Imagem</Label>
                  <Input
                    id="image"
                    value={formData.image || ""}
                    onChange={(e) => handleChange("image", e.target.value)}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="videoUrl">URL do Vídeo Principal</Label>
                  <Input
                    id="videoUrl"
                    value={formData.videoUrl || ""}
                    onChange={(e) => handleChange("videoUrl", e.target.value)}
                    placeholder="https://youtube.com/..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disponibilidade e Status */}
          <Card>
            <CardHeader>
              <CardTitle>Disponibilidade e Status</CardTitle>
              <CardDescription>
                Configure a disponibilidade e status do modelo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="availability">Disponibilidade</Label>
                <Select
                  value={formData.availability || "in_stock"}
                  onValueChange={(value: any) => handleChange("availability", value)}
                >
                  <SelectTrigger id="availability">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_stock">Em Estoque</SelectItem>
                    <SelectItem value="order">Sob Encomenda</SelectItem>
                    <SelectItem value="out_of_stock">Indisponível</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="premium"
                    checked={formData.premium || false}
                    onCheckedChange={(checked) => handleChange("premium", checked)}
                  />
                  <Label htmlFor="premium" className="cursor-pointer">
                    Modelo Premium
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="popular"
                    checked={formData.popular || false}
                    onCheckedChange={(checked) => handleChange("popular", checked)}
                  />
                  <Label htmlFor="popular" className="cursor-pointer">
                    Modelo Popular
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Serviços Disponíveis */}
          <Card>
            <CardHeader>
              <CardTitle>Serviços Disponíveis</CardTitle>
              <CardDescription>
                Selecione quais serviços estão disponíveis para este modelo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="reconstruction"
                    checked={formData.services?.reconstruction || false}
                    onCheckedChange={(checked) =>
                      handleServiceChange("reconstruction", checked as boolean)
                    }
                  />
                  <Label htmlFor="reconstruction" className="cursor-pointer">
                    Reconstrução de Tela
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="glassReplacement"
                    checked={formData.services?.glassReplacement || false}
                    onCheckedChange={(checked) =>
                      handleServiceChange("glassReplacement", checked as boolean)
                    }
                  />
                  <Label htmlFor="glassReplacement" className="cursor-pointer">
                    Troca de Vidro
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="partsAvailable"
                    checked={formData.services?.partsAvailable || false}
                    onCheckedChange={(checked) =>
                      handleServiceChange("partsAvailable", checked as boolean)
                    }
                  />
                  <Label htmlFor="partsAvailable" className="cursor-pointer">
                    Peças Disponíveis
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {formData.image && (
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <img
                    src={formData.image}
                    alt={formData.name || "Preview"}
                    className="w-24 h-24 object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div>
                    <div className="font-semibold">{formData.name || "Nome do modelo"}</div>
                    <div className="text-sm text-muted-foreground">
                      {brands.find((b) => b.id === formData.brand)?.name || "Marca"}
                    </div>
                    <div className="flex gap-2 mt-2">
                      {formData.premium && <Badge>Premium</Badge>}
                      {formData.popular && <Badge variant="secondary">Popular</Badge>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/lojista/modelos")}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? "Atualizar" : "Criar"} Modelo
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </RetailerLayout>
  );
};

export default ModelForm;
