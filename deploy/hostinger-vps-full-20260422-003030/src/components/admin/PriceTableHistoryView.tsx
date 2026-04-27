import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import {
  retailerPriceTablesService,
  RetailerPriceTableHistoryRecord,
  VersionDiffInfo,
} from "@/services/retailerPriceTablesService";
import { formatDistanceToNow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface PriceTableHistoryViewProps {
  slug: string;
  currentVersion: number;
  onRollback?: (version: number) => void;
}

export function PriceTableHistoryView({
  slug,
  currentVersion,
  onRollback,
}: PriceTableHistoryViewProps) {
  const [history, setHistory] = useState<RetailerPriceTableHistoryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedVersion, setExpandedVersion] = useState<number | null>(null);
  const [comparing, setComparing] = useState<{ v1: number; v2: number } | null>(null);
  const [diff, setDiff] = useState<VersionDiffInfo | null>(null);
  const [rollingBack, setRollingBack] = useState(false);

  useEffect(() => {
    loadHistory();
  }, [slug]);

  async function loadHistory() {
    setLoading(true);
    try {
      const data = await retailerPriceTablesService.getHistory(slug, 50);
      setHistory(data);
    } catch (error) {
      toast.error((error as Error).message || "Erro ao carregar histórico");
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleRollback(version: number) {
    setRollingBack(true);
    try {
      await retailerPriceTablesService.rollbackToVersion(
        slug,
        version,
        `Revertido via interface de histórico`
      );
      toast.success(`Tabela revertida para versão ${version}`);
      onRollback?.(version);
      loadHistory();
    } catch (error) {
      toast.error((error as Error).message || "Erro ao reverter");
    } finally {
      setRollingBack(false);
    }
  }

  async function handleCompareVersions(v1: number, v2: number) {
    try {
      setComparing({ v1, v2 });
      const comparison = await retailerPriceTablesService.compareVersions(slug, v1, v2);
      setDiff(comparison);
    } catch (error) {
      toast.error((error as Error).message || "Erro ao comparar versões");
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Versões</CardTitle>
          <CardDescription>Carregando histórico...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Versões</CardTitle>
          <CardDescription>Nenhuma versão anterior encontrada</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Histórico de Versões ({history.length})
          </CardTitle>
          <CardDescription>
            Versão atual: <Badge>{currentVersion}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {history.map((record, idx) => (
            <div
              key={`${record.table_id}-${record.version}`}
              className="border rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant={
                        record.version === currentVersion ? "default" : "outline"
                      }
                    >
                      v{record.version}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {record.version === currentVersion && "(Atual)"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(parseISO(record.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-medium">{record.title}</p>

                  {record.change_reason && (
                    <p className="mt-1 text-sm text-muted-foreground italic">
                      "{record.change_reason}"
                    </p>
                  )}

                  {record.visible_to_retailers !== undefined && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {record.visible_to_retailers ? (
                        <Badge variant="secondary" className="text-xs">
                          👁️ Visível
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          🔒 Oculta
                        </Badge>
                      )}
                      {record.featured_to_retailers && (
                        <Badge variant="default" className="text-xs">
                          ⭐ Destacada
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 flex-col sm:flex-row">
                  {record.version !== currentVersion && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRollback(record.version)}
                      disabled={rollingBack}
                      className="whitespace-nowrap"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Reverter
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setExpandedVersion(
                        expandedVersion === record.version ? null : record.version
                      )
                    }
                  >
                    {expandedVersion === record.version ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {expandedVersion === record.version && (
                <div className="mt-4 pt-4 border-t space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Resumo</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Categorias:</span>
                        <span className="ml-2 font-medium">
                          {record.parsed_data?.categories?.length || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Serviços:</span>
                        <span className="ml-2 font-medium">
                          {record.parsed_data?.categories?.reduce(
                            (sum, cat) => sum + (cat.items?.length || 0),
                            0
                          ) || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {idx > 0 && history[idx - 1] && (
                    <div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleCompareVersions(
                            record.version,
                            history[idx - 1].version
                          )
                        }
                        className="w-full"
                      >
                        Comparar com v{history[idx - 1].version}
                      </Button>
                    </div>
                  )}

                  {record.effective_date && (
                    <div className="text-xs text-muted-foreground bg-slate-100 dark:bg-slate-800 p-2 rounded">
                      Data efetiva: {record.effective_date}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {comparing && diff && (
        <Card className="border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              Comparação: v{diff.previousVersion} → v{diff.currentVersion}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(diff.changes).length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma mudança detectada</p>
            ) : (
              <>
                {diff.changes.title && (
                  <div className="text-sm">
                    <span className="font-semibold">Título:</span>
                    <div className="mt-1 space-y-1">
                      <div className="text-red-600 dark:text-red-400">
                        ✗ {diff.changes.title.old}
                      </div>
                      <div className="text-green-600 dark:text-green-400">
                        ✓ {diff.changes.title.new}
                      </div>
                    </div>
                  </div>
                )}

                {diff.changes.visible_to_retailers && (
                  <div className="text-sm">
                    <span className="font-semibold">Visibilidade:</span>
                    <span className="ml-2">
                      {diff.changes.visible_to_retailers.old ? "Visível" : "Oculta"} →{" "}
                      {diff.changes.visible_to_retailers.new ? "Visível" : "Oculta"}
                    </span>
                  </div>
                )}

                {diff.changes.featured_to_retailers && (
                  <div className="text-sm">
                    <span className="font-semibold">Destaque:</span>
                    <span className="ml-2">
                      {diff.changes.featured_to_retailers.old
                        ? "Destacada"
                        : "Normal"}{" "}
                      →{" "}
                      {diff.changes.featured_to_retailers.new
                        ? "Destacada"
                        : "Normal"}
                    </span>
                  </div>
                )}

                {diff.changes.prices_changed && (
                  <div className="text-sm bg-amber-100 dark:bg-amber-900 p-2 rounded">
                    <span className="font-semibold">Preços alterados:</span>
                    <span className="ml-2">{diff.changes.prices_changed} serviço(s)</span>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
