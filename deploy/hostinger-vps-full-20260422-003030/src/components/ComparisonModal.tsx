import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { X, Monitor, Wrench, Package, Download, Eye, ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import { PhoneModel, Brand, brands as defaultBrands } from "@/data/models";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { productViewsService } from "@/services/productViewsService";
import { servicesService, ModelService } from "@/services/servicesService";
import { formatCurrency } from "@/utils/format";
import { toast } from "sonner";

interface ComparisonModalProps {
  models: PhoneModel[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Marcas (da API ou estáticas). Se não informado, usa marcas padrão. */
  brands?: Brand[];
}

const ComparisonModal = ({ models, open, onOpenChange, brands = defaultBrands }: ComparisonModalProps) => {
  const navigate = useNavigate();
  const [viewStats, setViewStats] = useState<Record<string, { total_views: number }>>({});
  const [modelServices, setModelServices] = useState<Record<string, ModelService[]>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && models.length > 0) {
      loadComparisonData();
    }
  }, [open, models]);

  const loadComparisonData = async () => {
    setLoading(true);
    try {
      // Carregar estatísticas de visualização
      const statsPromises = models.map((model) =>
        productViewsService.getModelStats(model.id).then((stats) => ({
          modelId: model.id,
          stats: stats || { total_views: 0 },
        }))
      );

      // Carregar serviços dinâmicos
      const servicesPromises = models.map((model) =>
        servicesService.getModelServices(model.id).then((services) => ({
          modelId: model.id,
          services: services.filter((s) => s.available),
        }))
      );

      const [statsResults, servicesResults] = await Promise.all([
        Promise.all(statsPromises),
        Promise.all(servicesPromises),
      ]);

      const statsMap: Record<string, { total_views: number }> = {};
      statsResults.forEach(({ modelId, stats }) => {
        statsMap[modelId] = stats;
      });
      setViewStats(statsMap);

      const servicesMap: Record<string, ModelService[]> = {};
      servicesResults.forEach(({ modelId, services }) => {
        servicesMap[modelId] = services;
      });
      setModelServices(servicesMap);
    } catch (error) {
      console.error("Erro ao carregar dados de comparação:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    try {
      const csvRows = [];
      csvRows.push(["Característica", ...models.map((m) => m.name)].join(","));
      
      // Adicionar dados
      csvRows.push(["Marca", ...models.map((m) => {
        const brand = brands.find((b) => b.id === m.brand);
        return brand?.name || "-";
      })].join(","));

      csvRows.push(["Disponibilidade", ...models.map((m) => {
        const config = {
          in_stock: "Em Estoque",
          order: "Sob Encomenda",
          out_of_stock: "Indisponível",
        };
        return config[m.availability];
      })].join(","));

      csvRows.push(["Premium", ...models.map((m) => m.premium ? "Sim" : "Não")].join(","));
      csvRows.push(["Popular", ...models.map((m) => m.popular ? "Sim" : "Não")].join(","));

      // Adicionar visualizações
      csvRows.push(["Total de Visualizações", ...models.map((m) => 
        viewStats[m.id]?.total_views || 0
      )].join(","));

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `comparacao-${Date.now()}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Comparação exportada com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar comparação");
    }
  };

  if (models.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">Comparar Modelos</DialogTitle>
              <DialogDescription>
                Compare características, serviços e disponibilidade dos {models.length} modelos selecionados
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Característica</TableHead>
                {models.map((model) => {
                  const brand = brands.find((b) => b.id === model.brand);
                  return (
                    <TableHead key={model.id} className="text-center min-w-[200px]">
                      <div className="flex flex-col items-center gap-2">
                        {model.image && (
                          <img
                            src={model.image}
                            alt={model.name}
                            className="h-16 w-16 object-contain rounded-lg border"
                          />
                        )}
                        {brand?.logo && (
                          <img
                            src={brand.logo}
                            alt={brand.name}
                            className="h-5 w-auto object-contain opacity-70"
                          />
                        )}
                        <span className="font-semibold text-sm">{model.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigate(`/modelo/${model.id}`);
                            onOpenChange(false);
                          }}
                          className="h-7 text-xs"
                        >
                          Ver detalhes <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Marca</TableCell>
                {models.map((model) => {
                  const brand = brands.find((b) => b.id === model.brand);
                  return (
                    <TableCell key={model.id} className="text-center">
                      {brand?.name}
                    </TableCell>
                  );
                })}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Disponibilidade</TableCell>
                {models.map((model) => {
                  const availabilityConfig = {
                    in_stock: { label: "Em Estoque", variant: "default" as const },
                    order: { label: "Sob Encomenda", variant: "secondary" as const },
                    out_of_stock: { label: "Indisponível", variant: "outline" as const },
                  };
                  const availability = availabilityConfig[model.availability];
                  return (
                    <TableCell key={model.id} className="text-center">
                      <Badge variant={availability.variant}>{availability.label}</Badge>
                    </TableCell>
                  );
                })}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Premium</TableCell>
                {models.map((model) => (
                  <TableCell key={model.id} className="text-center">
                    {model.premium ? (
                      <Badge variant="secondary">Premium</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Popular</TableCell>
                {models.map((model) => (
                  <TableCell key={model.id} className="text-center">
                    {model.popular ? (
                      <Badge variant="outline">🔥 Popular</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Reconstrução de Tela</TableCell>
                {models.map((model) => (
                  <TableCell key={model.id} className="text-center">
                    {(model.services?.reconstruction || (model as any).modelServices?.some((ms: any) => ms.service_id === "service_reconstruction" && ms.available)) ? (
                      <div className="flex items-center justify-center gap-2">
                        <Monitor className="w-4 h-4 text-primary" />
                        <Badge variant="outline">Disponível</Badge>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Não disponível</span>
                    )}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Troca de Vidro</TableCell>
                {models.map((model) => (
                  <TableCell key={model.id} className="text-center">
                    {(model.services?.glassReplacement || (model as any).modelServices?.some((ms: any) => ms.service_id === "service_glass" && ms.available)) ? (
                      <div className="flex items-center justify-center gap-2">
                        <Wrench className="w-4 h-4 text-primary" />
                        <Badge variant="outline">Disponível</Badge>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Não disponível</span>
                    )}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Peças Disponíveis</TableCell>
                {models.map((model) => (
                  <TableCell key={model.id} className="text-center">
                    {(model.services?.partsAvailable || (model as any).modelServices?.some((ms: any) => ms.service_id === "service_parts" && ms.available)) ? (
                      <div className="flex items-center justify-center gap-2">
                        <Package className="w-4 h-4 text-primary" />
                        <Badge variant="outline">Disponível</Badge>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Não disponível</span>
                    )}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Vídeos Tutoriais</TableCell>
                {models.map((model) => (
                  <TableCell key={model.id} className="text-center">
                    {model.videos && model.videos.length > 0 ? (
                      <Badge variant="outline">{model.videos.length} vídeo(s)</Badge>
                    ) : model.videoUrl ? (
                      <Badge variant="outline">1 vídeo</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Total de Visualizações</TableCell>
                {models.map((model) => {
                  const views = viewStats[model.id]?.total_views || 0;
                  return (
                    <TableCell key={model.id} className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{views.toLocaleString()}</span>
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
              {Object.keys(modelServices).length > 0 && (
                <>
                  <TableRow>
                    <TableCell colSpan={models.length + 1} className="font-bold bg-muted/50">
                      Serviços Dinâmicos Disponíveis
                    </TableCell>
                  </TableRow>
                  {(() => {
                    // Coletar todos os serviços únicos
                    const allServices = new Set<string>();
                    Object.values(modelServices).forEach((services) => {
                      services.forEach((s) => {
                        if (s.service) {
                          allServices.add(s.service.id);
                        }
                      });
                    });

                    return Array.from(allServices).map((serviceId) => {
                      const service = Object.values(modelServices)
                        .flat()
                        .find((s) => s.service?.id === serviceId)?.service;

                      if (!service) return null;

                      return (
                        <TableRow key={serviceId}>
                          <TableCell className="font-medium pl-6">{service.name}</TableCell>
                          {models.map((model) => {
                            const modelService = modelServices[model.id]?.find(
                              (s) => s.service_id === serviceId
                            );
                            return (
                              <TableCell key={model.id} className="text-center">
                                {modelService ? (
                                  <div className="flex flex-col items-center gap-1">
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                    {modelService.price > 0 && (
                                      <span className="text-sm font-semibold text-primary">
                                        {formatCurrency(modelService.price)}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <XCircle className="w-5 h-5 text-muted-foreground mx-auto" />
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    });
                  })()}
                </>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ComparisonModal;
