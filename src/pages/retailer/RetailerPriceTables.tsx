import { useEffect, useMemo, useState } from "react";
import RetailerLayout from "@/components/retailer/RetailerLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { retailerPriceTablesService, RetailerPriceTableCategory } from "@/services/retailerPriceTablesService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";
import {
  Search,
  Smartphone,
  Tablet,
  Watch,
  ShieldAlert,
  Apple,
  Cpu,
  PackageSearch,
  ChevronRight,
  Download,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Layers3,
  Star,
} from "lucide-react";

const slugifyCategory = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getCategoryTheme = (categoryName: string) => {
  const normalized = categoryName.toLowerCase();

  if (normalized.includes("samsung")) {
    return {
      iconBg: "bg-blue-500/10",
      iconText: "text-blue-600",
      badge: "border-blue-200 bg-blue-50 text-blue-700",
      dot: "bg-blue-500/70",
      price: "bg-blue-500/10 text-blue-700",
      chip: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
    };
  }

  if (normalized.includes("apple")) {
    return {
      iconBg: "bg-slate-500/10",
      iconText: "text-slate-700",
      badge: "border-slate-200 bg-slate-50 text-slate-700",
      dot: "bg-slate-500/70",
      price: "bg-slate-500/10 text-slate-700",
      chip: "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100",
    };
  }

  if (normalized.includes("motorola")) {
    return {
      iconBg: "bg-indigo-500/10",
      iconText: "text-indigo-600",
      badge: "border-indigo-200 bg-indigo-50 text-indigo-700",
      dot: "bg-indigo-500/70",
      price: "bg-indigo-500/10 text-indigo-700",
      chip: "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
    };
  }

  if (normalized.includes("xiaomi")) {
    return {
      iconBg: "bg-orange-500/10",
      iconText: "text-orange-600",
      badge: "border-orange-200 bg-orange-50 text-orange-700",
      dot: "bg-orange-500/70",
      price: "bg-orange-500/10 text-orange-700",
      chip: "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100",
    };
  }

  if (normalized.includes("tablet")) {
    return {
      iconBg: "bg-cyan-500/10",
      iconText: "text-cyan-600",
      badge: "border-cyan-200 bg-cyan-50 text-cyan-700",
      dot: "bg-cyan-500/70",
      price: "bg-cyan-500/10 text-cyan-700",
      chip: "border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100",
    };
  }

  if (normalized.includes("watch")) {
    return {
      iconBg: "bg-emerald-500/10",
      iconText: "text-emerald-600",
      badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
      dot: "bg-emerald-500/70",
      price: "bg-emerald-500/10 text-emerald-700",
      chip: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    };
  }

  return {
    iconBg: "bg-primary/10",
    iconText: "text-primary",
    badge: "border-primary/20 bg-primary/5 text-primary",
    dot: "bg-primary/70",
    price: "bg-primary/10 text-primary",
    chip: "border-primary/20 bg-primary/5 text-primary hover:bg-primary/10",
  };
};

const getCategoryIcon = (categoryName: string) => {
  const normalized = categoryName.toLowerCase();

  if (normalized.includes("tablet")) return Tablet;
  if (normalized.includes("watch")) return Watch;
  if (normalized.includes("apple")) return Apple;
  if (normalized.includes("traseiro")) return PackageSearch;
  if (normalized.includes("samsung")) return Smartphone;
  if (normalized.includes("motorola")) return Smartphone;
  if (normalized.includes("xiaomi")) return Smartphone;
  if (normalized.includes("realme")) return Smartphone;
  if (normalized.includes("infinix")) return Smartphone;
  if (normalized.includes("asus")) return Cpu;
  if (normalized.includes("nokia")) return Smartphone;
  if (normalized.includes("lg")) return Smartphone;
  return Smartphone;
};

const getTableSummary = (table: {
  parsed_data: {
    intro: string[];
  };
}) =>
  table.parsed_data?.intro?.find((line) => line.trim().length > 0) ||
  "Tabela organizada para consulta rapida durante o atendimento.";

const RetailerPriceTables = () => {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("Tabela de Preços");
  const [effectiveDate, setEffectiveDate] = useState<string | null>(null);
  const [intro, setIntro] = useState<string[]>([]);
  const [categories, setCategories] = useState<RetailerPriceTableCategory[]>([]);
  const [collapsedCategories, setCollapsedCategories] = useState<string[]>([]);
  const [allTables, setAllTables] = useState<Array<{
    slug: string;
    title: string;
    effective_date: string | null;
    featured_to_retailers?: boolean;
    parsed_data: {
      intro: string[];
      categories: RetailerPriceTableCategory[];
    };
  }>>([]);
  const [selectedSlug, setSelectedSlug] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const records = await retailerPriceTablesService.listRetailer();
      if (!records.length) {
        toast.error("Tabela de preços indisponível no momento");
        setLoading(false);
        return;
      }

      setAllTables(records);
      const nextSelectedSlug =
        records.find((record) => record.featured_to_retailers)?.slug ||
        records.find((record) => record.slug === "tabela-vidros")?.slug ||
        records[0].slug;
      setSelectedSlug(nextSelectedSlug);
      setLoading(false);
    };

    load();
  }, []);

  const selectedTable = useMemo(
    () => allTables.find((record) => record.slug === selectedSlug) || allTables[0] || null,
    [allTables, selectedSlug]
  );

  useEffect(() => {
    if (!selectedTable) return;

    setTitle(selectedTable.title);
    setEffectiveDate(selectedTable.effective_date);
    setIntro(selectedTable.parsed_data.intro || []);
    setCategories(selectedTable.parsed_data.categories || []);
    setSearch("");
    setCollapsedCategories([]);
  }, [selectedTable]);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return categories;

    return categories
      .map((category) => ({
        ...category,
        items: category.items.filter((item) => item.name.toLowerCase().includes(query)),
      }))
      .filter((category) => category.items.length > 0);
  }, [categories, search]);

  const totalItems = useMemo(
    () => filteredCategories.reduce((total, category) => total + category.items.length, 0),
    [filteredCategories]
  );

  const toggleCategory = (categoryName: string) => {
    setCollapsedCategories((current) =>
      current.includes(categoryName)
        ? current.filter((name) => name !== categoryName)
        : [...current, categoryName]
    );
  };

  const expandAllCategories = () => {
    setCollapsedCategories([]);
  };

  const collapseAllCategories = () => {
    setCollapsedCategories(filteredCategories.map((category) => category.name));
  };

  const handleExportPdf = () => {
    if (filteredCategories.length === 0) {
      toast.error("Não há itens para exportar");
      return;
    }

    const doc = new jsPDF();
    let y = 16;

    doc.setFontSize(18);
    doc.text(title, 14, y);
    y += 8;

    doc.setFontSize(10);
    doc.text("Tabela exclusiva para lojistas", 14, y);
    y += 6;

    if (effectiveDate) {
      doc.text(`Data de referência: ${effectiveDate}`, 14, y);
      y += 6;
    }

    if (search.trim()) {
      doc.text(`Filtro aplicado: ${search.trim()}`, 14, y);
      y += 6;
    }

    if (intro.length > 0) {
      doc.setFontSize(12);
      doc.text("Informações Importantes", 14, y);
      y += 6;
      doc.setFontSize(9);

      intro.forEach((line) => {
        const wrapped = doc.splitTextToSize(`- ${line}`, 180);
        wrapped.forEach((part: string) => {
          if (y > 280) {
            doc.addPage();
            y = 16;
          }
          doc.text(part, 14, y);
          y += 5;
        });
      });
      y += 4;
    }

    filteredCategories.forEach((category) => {
      if (y > 260) {
        doc.addPage();
        y = 16;
      }

      doc.setFontSize(12);
      doc.text(`${category.name} (${category.items.length})`, 14, y);
      y += 6;
      doc.setFontSize(9);

      category.items.forEach((item) => {
        if (y > 280) {
          doc.addPage();
          y = 16;
        }
        const itemLines = doc.splitTextToSize(item.name, 130);
        doc.text(itemLines, 14, y);
        doc.text(item.priceText || "-", 160, y);
        y += Math.max(itemLines.length * 5, 6);
      });

      y += 4;
    });

    doc.save(`${slugifyCategory(title || "tabela-precos")}.pdf`);
    toast.success("PDF exportado com sucesso");
  };

  return (
    <RetailerLayout>
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-[28px] border border-border bg-[radial-gradient(circle_at_top_left,rgba(0,112,243,0.18),transparent_35%),linear-gradient(135deg,rgba(11,25,53,1)_0%,rgba(20,41,79,1)_48%,rgba(248,250,252,0.98)_100%)] p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)] sm:p-8">
          <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-secondary/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative z-10 space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="border-white/20 bg-white/10 text-white hover:bg-white/15">
                Tabela exclusiva para lojistas
              </Badge>
              {effectiveDate ? (
                <Badge className="border-secondary/40 bg-secondary/15 text-secondary-foreground hover:bg-secondary/20" variant="outline">
                  Atualizada em {effectiveDate}
                </Badge>
              ) : null}
            </div>

            <div className="max-w-3xl space-y-3">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
              <p className="max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
                Consulte valores organizados por categoria, filtre rapidamente por modelo e use a tabela
                como apoio comercial no atendimento do dia a dia.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.24em] text-white/60">Tabelas Ativas</p>
                <p className="mt-2 text-2xl font-semibold">{allTables.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.24em] text-white/60">Categorias</p>
                <p className="mt-2 text-2xl font-semibold">{filteredCategories.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.24em] text-white/60">Itens Visíveis</p>
                <p className="mt-2 text-2xl font-semibold">{totalItems}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm sm:col-span-3">
                <p className="text-xs uppercase tracking-[0.24em] text-white/60">Busca Ativa</p>
                <p className="mt-2 text-sm font-medium text-white/85">
                  {search.trim() ? `“${search.trim()}”` : "Mostrando tudo"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {!loading && allTables.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers3 className="h-5 w-5 text-primary" />
                Tabelas Disponíveis
              </CardTitle>
              <CardDescription>
                Escolha a tabela que deseja consultar. A busca, o PDF e a navegação são aplicados na tabela selecionada.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {allTables.map((table) => {
                  const isActive = table.slug === (selectedTable?.slug || "");
                  const categoryCount = table.parsed_data.categories?.length || 0;
                  const itemCount = (table.parsed_data.categories || []).reduce(
                    (total, category) => total + category.items.length,
                    0
                  );

                  return (
                    <button
                      key={table.slug}
                      type="button"
                      onClick={() => setSelectedSlug(table.slug)}
                      className={`rounded-2xl border p-4 text-left transition-all ${
                        isActive
                          ? "border-primary bg-primary/5 shadow-[0_10px_30px_rgba(2,132,199,0.10)]"
                          : "border-border bg-background hover:border-primary/40 hover:bg-muted/30"
                      }`}
                      >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-base font-semibold text-foreground">{table.title}</p>
                            {table.featured_to_retailers ? (
                              <Badge className="bg-amber-500 text-white hover:bg-amber-500">
                                <Star className="mr-1 h-3.5 w-3.5" />
                                Principal
                              </Badge>
                            ) : null}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {table.effective_date ? `Atualizada em ${table.effective_date}` : "Sem data informada"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {getTableSummary(table)}
                          </p>
                        </div>
                        {isActive ? <Badge className="bg-primary text-primary-foreground">Ativa</Badge> : null}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Badge variant="outline">{categoryCount} categorias</Badge>
                        <Badge variant="outline">{itemCount} itens</Badge>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Buscar item</CardTitle>
                <CardDescription>
                  Digite o modelo para filtrar rapidamente a tabela de preços.
                </CardDescription>
              </div>
              <Button type="button" variant="outline" onClick={handleExportPdf}>
                <Download className="mr-2 h-4 w-4" />
                Exportar PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Ex.: A15, iPhone 13, Moto G84..."
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={expandAllCategories}>
                  <ChevronDown className="mr-2 h-4 w-4" />
                  Expandir todas
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={collapseAllCategories}>
                  <ChevronUp className="mr-2 h-4 w-4" />
                  Recolher todas
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {!loading && filteredCategories.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Navegação Rápida</CardTitle>
              <CardDescription>
                Pule direto para a categoria desejada.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {filteredCategories.map((category) => {
                  const theme = getCategoryTheme(category.name);
                  const Icon = getCategoryIcon(category.name);

                  return (
                    <a
                      key={category.name}
                      href={`#categoria-${slugifyCategory(category.name)}`}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-colors ${theme.chip}`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{category.name}</span>
                    </a>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {intro.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-secondary" />
                Informações Importantes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {intro.map((line, index) => (
                <div key={index} className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/30 p-3">
                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="text-sm leading-6 text-muted-foreground">{line}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}

        {loading ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              Carregando tabela de preços...
            </CardContent>
          </Card>
        ) : filteredCategories.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              Nenhum item encontrado para a busca informada.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
            <div className="space-y-6">
              {filteredCategories.map((category) => (
                <Card
                  key={category.name}
                  id={`categoria-${slugifyCategory(category.name)}`}
                  className="scroll-mt-24 overflow-hidden border-border/80 shadow-sm"
                >
                  <CardHeader className="border-b border-border/60 bg-gradient-to-r from-muted/40 via-background to-background">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${getCategoryTheme(category.name).iconBg} ${getCategoryTheme(category.name).iconText}`}
                        >
                          {(() => {
                            const Icon = getCategoryIcon(category.name);
                            return <Icon className="h-6 w-6" />;
                          })()}
                        </div>
                    <div>
                      <CardTitle>{category.name}</CardTitle>
                      <CardDescription>{category.items.length} item(ns)</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`bg-background/80 ${getCategoryTheme(category.name).badge}`}
                    >
                      {category.items.length} registros
                    </Badge>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => toggleCategory(category.name)}
                      aria-label={collapsedCategories.includes(category.name) ? "Expandir categoria" : "Recolher categoria"}
                    >
                      {collapsedCategories.includes(category.name) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronUp className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {!collapsedCategories.includes(category.name) ? (
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left">
                          <th className="py-3 pr-4 font-semibold text-foreground">Item</th>
                          <th className="py-3 font-semibold text-foreground">Preço</th>
                        </tr>
                      </thead>
                      <tbody>
                        {category.items.map((item, index) => (
                          <tr
                            key={`${category.name}-${index}`}
                            className="border-b border-border/60 transition-colors hover:bg-muted/30"
                          >
                            <td className="py-3 pr-4 text-foreground">
                              <div className="flex items-start gap-3">
                                <div className={`mt-1 h-2.5 w-2.5 rounded-full ${getCategoryTheme(category.name).dot}`} />
                                <span>{item.name}</span>
                              </div>
                            </td>
                            <td className="py-3">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getCategoryTheme(category.name).price}`}
                              >
                                {item.priceText || "-"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              ) : (
                <CardContent className="text-sm text-muted-foreground">
                  Categoria recolhida. Clique na seta para expandir.
                </CardContent>
              )}
                </Card>
              ))}
            </div>

            <aside className="hidden xl:block">
              <div className="sticky top-24 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Resumo Rápido</CardTitle>
                    <CardDescription>
                      Navegue pelas categorias e acompanhe a quantidade de itens.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {filteredCategories.map((category) => {
                      const theme = getCategoryTheme(category.name);
                      const Icon = getCategoryIcon(category.name);
                      return (
                        <a
                          key={category.name}
                          href={`#categoria-${slugifyCategory(category.name)}`}
                          className="flex items-center justify-between gap-3 rounded-xl border border-border/70 p-3 transition-colors hover:bg-muted/40"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${theme.iconBg} ${theme.iconText}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{category.name}</p>
                              <p className="text-xs text-muted-foreground">{category.items.length} item(ns)</p>
                            </div>
                          </div>
                          <Badge variant="outline" className={theme.badge}>
                            {category.items.length}
                          </Badge>
                        </a>
                      );
                    })}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    >
                      <ArrowUp className="mr-2 h-4 w-4" />
                      Voltar ao topo
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </aside>
          </div>
        )}
      </div>
    </RetailerLayout>
  );
};

export default RetailerPriceTables;
