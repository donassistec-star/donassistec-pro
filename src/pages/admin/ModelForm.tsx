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
import AdminLayout from "@/components/admin/AdminLayout";
import { modelsService, brandsService } from "@/services/modelsService";
import { servicesService, Service, ModelService } from "@/services/servicesService";
import { PhoneModel, Brand } from "@/data/models";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/image-upload";
import { formatCurrency } from "@/utils/format";
import { Plus, X, Trash2 } from "lucide-react";

const ModelForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [modelServices, setModelServices] = useState<ModelService[]>([]);
  
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
    loadServices();
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

  const loadServices = async () => {
    try {
      const servicesData = await servicesService.getAll();
      setAllServices(servicesData);
    } catch (error) {
      toast.error("Erro ao carregar serviços");
    }
  };

  const loadModel = async (modelId: string) => {
    try {
      setLoading(true);
      const [model, services] = await Promise.all([
        modelsService.getById(modelId),
        servicesService.getModelServices(modelId),
      ]);
      if (model) {
        setFormData(model);
        setModelServices(services);
      } else {
        toast.error("Modelo não encontrado");
        navigate("/admin/modelos");
      }
    } catch (error) {
      toast.error("Erro ao carregar modelo");
      navigate("/admin/modelos");
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
      let modelId: string;
      
      if (isEditing && id) {
        await modelsService.update(id, formData);
        modelId = id;
        toast.success("Modelo atualizado com sucesso!");
      } else {
        // Gerar ID baseado no nome e marca se não fornecido
        if (!formData.id) {
          const brandName = brands.find((b) => b.id === formData.brand)?.name || "";
          const idBase = `${formData.brand}-${formData.name.toLowerCase().replace(/\s+/g, "-")}`;
          formData.id = idBase;
        }
        
        await modelsService.create(formData);
        modelId = formData.id!;
        toast.success("Modelo criado com sucesso!");
      }

      // Salvar serviços do modelo
      if (modelServices.length > 0) {
        for (const modelService of modelServices) {
          try {
            await servicesService.setModelService(
              modelId,
              modelService.service_id,
              modelService.price,
              modelService.available
            );
          } catch (serviceError: any) {
            console.error("Erro ao salvar serviço:", serviceError);
            // Continuar com os outros serviços mesmo se um falhar
            toast.error(`Erro ao salvar serviço ${modelService.service?.name || modelService.service_id}: ${serviceError.message || "Erro desconhecido"}`);
          }
        }
      }
      
      navigate("/admin/modelos");
    } catch (error: any) {
      console.error("Erro ao salvar modelo:", error);
      const errorMessage = error.response?.data?.error || error.message || "Erro ao salvar modelo";
      toast.error(errorMessage);
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

  const handleAddService = (serviceId: string) => {
    const service = allServices.find((s) => s.id === serviceId);
    if (!service) return;

    // Verificar se já existe
    if (modelServices.some((ms) => ms.service_id === serviceId)) {
      toast.info("Este serviço já foi adicionado");
      return;
    }

    const newModelService: ModelService = {
      model_id: id || "",
      service_id: serviceId,
      price: 0,
      available: true,
      service,
    };

    setModelServices([...modelServices, newModelService]);
  };

  const handleRemoveService = (serviceId: string) => {
    setModelServices(modelServices.filter((ms) => ms.service_id !== serviceId));
  };

  const handleServicePriceChange = (serviceId: string, price: number) => {
    setModelServices(
      modelServices.map((ms) =>
        ms.service_id === serviceId ? { ...ms, price } : ms
      )
    );
  };

  const handleServiceAvailableChange = (serviceId: string, available: boolean) => {
    setModelServices(
      modelServices.map((ms) =>
        ms.service_id === serviceId ? { ...ms, available } : ms
      )
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/modelos")}>
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
                  <Label htmlFor="image">Imagem do Modelo</Label>
                  <ImageUpload
                    value={formData.image}
                    onChange={(url) => handleChange("image", url)}
                    label="Upload da Imagem do Modelo"
                  />
                  {formData.image && (
                    <p className="text-xs text-muted-foreground mt-1">
                      URL atual: {formData.image}
                    </p>
                  )}
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

          {/* Serviços Dinâmicos */}
          <Card>
            <CardHeader>
              <CardTitle>Serviços e Preços</CardTitle>
              <CardDescription>
                Adicione serviços disponíveis e defina os preços para este modelo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Adicionar Serviço */}
              <div className="flex gap-2">
                <Select onValueChange={handleAddService}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecione um serviço para adicionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {allServices
                      .filter((service) => !modelServices.some((ms) => ms.service_id === service.id))
                      .map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Lista de Serviços Adicionados */}
              <div className="space-y-3">
                {modelServices.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum serviço adicionado. Selecione um serviço acima para começar.
                  </p>
                ) : (
                  modelServices.map((modelService) => (
                    <Card key={modelService.service_id} className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">
                                {modelService.service?.name || "Serviço"}
                              </h4>
                              {modelService.service?.description && (
                                <p className="text-sm text-muted-foreground">
                                  {modelService.service.description}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveService(modelService.service_id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`price-${modelService.service_id}`}>
                                Preço (R$)
                              </Label>
                              <Input
                                id={`price-${modelService.service_id}`}
                                type="number"
                                step="0.01"
                                min="0"
                                value={modelService.price}
                                onChange={(e) =>
                                  handleServicePriceChange(
                                    modelService.service_id,
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                placeholder="0.00"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`available-${modelService.service_id}`}>
                                Status
                              </Label>
                              <div className="flex items-center space-x-2 pt-2">
                                <Checkbox
                                  id={`available-${modelService.service_id}`}
                                  checked={modelService.available}
                                  onCheckedChange={(checked) =>
                                    handleServiceAvailableChange(
                                      modelService.service_id,
                                      checked as boolean
                                    )
                                  }
                                />
                                <Label
                                  htmlFor={`available-${modelService.service_id}`}
                                  className="cursor-pointer"
                                >
                                  {modelService.available ? "Disponível" : "Indisponível"}
                                </Label>
                              </div>
                            </div>
                          </div>

                          {modelService.price > 0 && (
                            <div className="text-sm font-semibold text-primary">
                              Preço: {formatCurrency(modelService.price)}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
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
              onClick={() => navigate("/admin/modelos")}
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
    </AdminLayout>
  );
};

export default ModelForm;
