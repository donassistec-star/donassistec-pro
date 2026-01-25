import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, ChevronDown, ChevronUp, Calendar, Search, Download, User, Building2, Phone, Mail, AlertCircle } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { prePedidosService, PrePedidoRecord } from "@/services/prePedidosService";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@/utils/format";

const escapeCsv = (v: string) => {
  const s = String(v ?? "").replace(/"/g, '""');
  return /[",\n\r]/.test(s) ? `"${s}"` : s;
};

const AdminPrePedidos = () => {
  const [list, setList] = useState<PrePedidoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const data = await prePedidosService.getAll();
      setList(data);
    } catch (e) {
      console.error("Erro ao carregar pré-pedidos:", e);
    } finally {
      setLoading(false);
    }
  };

  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        (r.session_id || "").toLowerCase().includes(q) ||
        (r.contact_name || "").toLowerCase().includes(q) ||
        (r.contact_company || "").toLowerCase().includes(q) ||
        (r.contact_email || "").toLowerCase().includes(q)
    );
  }, [list, searchQuery]);

  const handleExportCsv = () => {
    const headers = ["ID", "Data", "Sessão", "Contato", "Empresa", "Telefone", "E-mail", "Urgente", "Observações", "Qtd itens", "Resumo itens"];
    const rows = filteredList.map((r) => {
      const itens = (r.items_json || [])
        .map(
          (i) =>
            `${i.model_name}${i.brand_name ? ` (${i.brand_name})` : ""} × ${i.quantity}`
        )
        .join("; ");
      return [
        r.id,
        format(new Date(r.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR }),
        r.session_id || "",
        r.contact_name || "",
        r.contact_company || "",
        r.contact_phone || "",
        r.contact_email || "",
        r.is_urgent ? "Sim" : "",
        (r.notes || "").replace(/\s+/g, " ").trim(),
        String((r.items_json || []).length),
        itens,
      ].map(escapeCsv);
    });
    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `pre-pedidos-${format(new Date(), "yyyy-MM-dd-HHmm")}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" text="Carregando pré-pedidos..." />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pré-pedidos</h1>
          <p className="text-muted-foreground mt-2">
            Registros de pré-pedidos enviados pelo fluxo Finalizar (Pré-orçamento)
          </p>
        </div>

        {list.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
              <CardDescription>Buscar por ID, sessão, nome, empresa ou e-mail</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por ID, nome, empresa, e-mail..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" onClick={handleExportCsv}>
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            </CardContent>
          </Card>
        )}

        {list.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Nenhum pré-pedido"
            description="Ainda não há pré-pedidos registrados. Eles aparecem aqui quando um lojista clica em Finalizar e enviar pré-pedido no pré-orçamento."
          />
        ) : (
          <div className="space-y-4">
            {filteredList.length === 0 ? (
              <EmptyState
                icon={Search}
                title="Nenhum resultado"
                description="Nenhum pré-pedido corresponde à busca. Tente outro termo."
              />
            ) : (
            filteredList.map((rec) => {
              const items = rec.items_json || [];
              const isExpanded = expandedId === rec.id;
              return (
                <Card key={rec.id} className="hover:bg-muted/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {rec.id}
                          {rec.is_urgent ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-700 dark:text-amber-400">
                              <AlertCircle className="w-3 h-3" />
                              Urgente
                            </span>
                          ) : null}
                        </CardTitle>
                        <CardDescription className="flex flex-wrap items-center gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(rec.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </span>
                          {rec.contact_name && (
                            <span className="flex items-center gap-1" title={rec.contact_name}>
                              <User className="w-4 h-4" />
                              {rec.contact_name}
                            </span>
                          )}
                          {rec.session_id && (
                            <span className="text-xs font-mono truncate max-w-[180px]" title={rec.session_id}>
                              {rec.session_id}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {items.length} {items.length === 1 ? "item" : "itens"}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          {isExpanded ? "Ocultar" : "Ver detalhes"}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {isExpanded && (
                    <CardContent className="pt-0">
                      {(rec.contact_name || rec.contact_company || rec.contact_phone || rec.contact_email || rec.notes) && (
                        <div className="mb-4 p-4 border rounded-lg bg-muted/30 space-y-2">
                          <p className="text-sm font-medium flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Dados de contato
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            {rec.contact_name && (
                              <span className="flex items-center gap-1"><User className="w-3 h-3" /> {rec.contact_name}</span>
                            )}
                            {rec.contact_company && (
                              <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {rec.contact_company}</span>
                            )}
                            {rec.contact_phone && (
                              <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {rec.contact_phone}</span>
                            )}
                            {rec.contact_email && (
                              <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {rec.contact_email}</span>
                            )}
                          </div>
                          {rec.notes && (
                            <p className="text-sm pt-1 border-t border-border/50"><span className="font-medium">Observações:</span> {rec.notes}</p>
                          )}
                        </div>
                      )}
                      {items.length > 0 && (
                      <div className="border rounded-lg divide-y bg-muted/30">
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
                  )}
                </Card>
              );
            })
            )}
          </div>
        )}

        {list.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {searchQuery.trim() ? `${filteredList.length} de ${list.length}` : list.length}
              </div>
              <div className="text-sm text-muted-foreground">
                {searchQuery.trim() ? "Exibindo resultados da busca" : "Total de pré-pedidos"}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPrePedidos;
