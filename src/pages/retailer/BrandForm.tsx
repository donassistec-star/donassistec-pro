import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Save,
  Loader2,
  Tag,
} from "lucide-react";
import RetailerLayout from "@/components/retailer/RetailerLayout";
import { brandsService } from "@/services/modelsService";
import { Brand } from "@/data/models";
import { toast } from "sonner";

const BrandForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Brand>>({
    id: "",
    name: "",
    logo: "",
    icon: "",
  });

  useEffect(() => {
    if (isEditing && id) {
      loadBrand(id);
    }
  }, [id, isEditing]);

  const loadBrand = async (brandId: string) => {
    try {
      setLoading(true);
      const brand = await brandsService.getById(brandId);
      if (brand) {
        setFormData(brand);
      } else {
        toast.error("Marca não encontrada");
        navigate("/lojista/marcas");
      }
    } catch (error) {
      toast.error("Erro ao carregar marca");
      navigate("/lojista/marcas");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error("Preencha o nome da marca");
      return;
    }

    try {
      setSaving(true);
      
      if (isEditing && id) {
        await brandsService.update(id, formData);
        toast.success("Marca atualizada com sucesso!");
      } else {
        // Gerar ID baseado no nome se não fornecido
        if (!formData.id) {
          const idBase = formData.name.toLowerCase().replace(/\s+/g, "-");
          formData.id = idBase;
        }
        
        await brandsService.create(formData);
        toast.success("Marca criada com sucesso!");
      }
      
      navigate("/lojista/marcas");
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar marca");
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
      <div className="space-y-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/lojista/marcas")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isEditing ? "Editar Marca" : "Nova Marca"}
            </h1>
            <p className="text-muted-foreground">
              {isEditing
                ? "Atualize as informações da marca"
                : "Adicione uma nova marca ao catálogo"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações da Marca</CardTitle>
              <CardDescription>
                Dados principais da marca de celular
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="id">
                    ID da Marca {!isEditing && <span className="text-muted-foreground">(opcional)</span>}
                  </Label>
                  <Input
                    id="id"
                    value={formData.id || ""}
                    onChange={(e) => handleChange("id", e.target.value)}
                    placeholder="ex: apple, samsung"
                    disabled={isEditing}
                    className={isEditing ? "bg-muted" : ""}
                  />
                  {!isEditing && (
                    <p className="text-xs text-muted-foreground">
                      Deixe vazio para gerar automaticamente baseado no nome
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">
                    Nome da Marca <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="ex: Apple, Samsung"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">URL do Logo</Label>
                <Input
                  id="logo"
                  value={formData.logo || ""}
                  onChange={(e) => handleChange("logo", e.target.value)}
                  placeholder="https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/apple.svg"
                />
                <p className="text-xs text-muted-foreground">
                  Recomendado: usar Simple Icons ou outro CDN de ícones SVG
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">Nome do Ícone (opcional)</Label>
                <Input
                  id="icon"
                  value={formData.icon || ""}
                  onChange={(e) => handleChange("icon", e.target.value)}
                  placeholder="ex: apple, samsung"
                />
                <p className="text-xs text-muted-foreground">
                  Nome do ícone para uso em componentes (opcional)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {formData.logo && (
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 flex items-center justify-center border border-border rounded-lg bg-muted/30">
                    {formData.logo ? (
                      <img
                        src={formData.logo}
                        alt={formData.name || "Preview"}
                        className="w-16 h-16 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <Tag className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold">{formData.name || "Nome da marca"}</div>
                    <div className="text-sm text-muted-foreground">
                      ID: {formData.id || "gerado automaticamente"}
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
              onClick={() => navigate("/lojista/marcas")}
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
                  {isEditing ? "Atualizar" : "Criar"} Marca
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </RetailerLayout>
  );
};

export default BrandForm;
