import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User, Building2, Phone, Mail, Package, AlertCircle } from "lucide-react";
import RetailerLayout from "@/components/retailer/RetailerLayout";
import { prePedidosService, PrePedidoRecord } from "@/services/prePedidosService";
import { ordersService } from "@/services/ordersService";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency, formatPrePedidoNumero, formatPedidoNumero } from "@/utils/format";
import { toast } from "sonner";

const RetailerPrePedidoDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [prePedido, setPrePedido] = useState<PrePedidoRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    if (id) load(id);
  }, [id]);

  const load = async (prePedidoId: string) => {
    try {
      setLoading(true);
      const data = await prePedidosService.getById(prePedidoId);
      setPrePedido(data);
    } catch (e) {
      console.error("Erro ao carregar pré-pedido:", e);
      setPrePedido(null);
      toast.error("Erro ao carregar pré-pedido.");
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToOrder = async () => {
    if (!prePedido) return;
    try {
      setConverting(true);
      const order = await ordersService.createFromPrePedido(prePedido.id);
      const num = order?.numero != null ? formatPedidoNumero(order.numero) : order?.id;
      toast.success(`Pedido ${num} criado.`);
      navigate(`/lojista/pedidos/${order.id}`);
    } catch (e: any) {
      toast.error(e?.message || "Erro ao converter em pedido");
    } finally {
      setConverting(false);
    }
  };

  if (loading) {
    return (
      <RetailerLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" text="Carregando pré-pedido..." />
        </div>
      </RetailerLayout>
    );
  }

  if (!prePedido) {
    return (
      <RetailerLayout>
        <EmptyState
          icon={AlertCircle}
          title="Pré-pedido não encontrado"
          description="O pré-pedido não existe ou você não tem permissão para acessá-lo."
        />
        <div className="mt-4">
          <Link to="/lojista/pre-pedidos">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Pré-pedidos
            </Button>
          </Link>
        </div>
      </RetailerLayout>
    );
  }

  const items = prePedido.items_json || [];

  return (
    <RetailerLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link to="/lojista/pre-pedidos">
              <Button variant="ghost" size="sm" className="mb-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Pré-pedidos
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              {prePedido.numero != null ? formatPrePedidoNumero(prePedido.numero) : prePedido.id}
              {prePedido.is_urgent && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-sm font-medium bg-amber-500/20 text-amber-700 dark:text-amber-400">
                  <AlertCircle className="w-4 h-4" />
                  Urgente
                </span>
              )}
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {format(new Date(prePedido.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>
          <div>
            {prePedido.order_id ? (
              <Link to={`/lojista/pedidos/${prePedido.order_id}`}>
                <Button variant="secondary">
                  <Package className="w-4 h-4 mr-2" />
                  Convertido em {prePedido.order_numero != null ? formatPedidoNumero(prePedido.order_numero) : "pedido"}
                </Button>
              </Link>
            ) : (
              <Button onClick={handleConvertToOrder} disabled={converting}>
                <Package className="w-4 h-4 mr-2" />
                {converting ? "Convertendo…" : "Converter em pedido"}
              </Button>
            )}
          </div>
        </div>

        {(prePedido.contact_name || prePedido.contact_company || prePedido.contact_phone || prePedido.contact_email || prePedido.notes || prePedido.need_by) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Dados de contato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {prePedido.contact_name && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>{prePedido.contact_name}</span>
                  </div>
                )}
                {prePedido.contact_company && (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span>{prePedido.contact_company}</span>
                  </div>
                )}
                {prePedido.contact_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{prePedido.contact_phone}</span>
                  </div>
                )}
                {prePedido.contact_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{prePedido.contact_email}</span>
                  </div>
                )}
                {prePedido.need_by && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Preciso até: {prePedido.need_by}</span>
                  </div>
                )}
              </div>
              {prePedido.notes && (
                <div className="pt-3 border-t">
                  <p className="text-sm font-medium">Observações</p>
                  <p className="text-sm text-muted-foreground">{prePedido.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Itens ({items.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-muted-foreground">Nenhum item.</p>
            ) : (
              <div className="border rounded-lg divide-y">
                {items.map((it, i) => (
                  <div key={i} className="p-4">
                    <p className="font-medium">
                      {it.model_name}
                      {it.brand_name ? ` (${it.brand_name})` : ""} × {it.quantity}
                    </p>
                    {it.selected_services && it.selected_services.length > 0 && (
                      <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                        {it.selected_services.map((s, j) => (
                          <li key={j}>
                            • {s.name}: {s.price > 0 ? formatCurrency(s.price) : "Sob consulta"}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RetailerLayout>
  );
};

export default RetailerPrePedidoDetail;
