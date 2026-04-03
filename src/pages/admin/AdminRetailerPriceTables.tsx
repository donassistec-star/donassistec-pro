import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { retailerPriceTablesService, RetailerPriceTableRecord } from "@/services/retailerPriceTablesService";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Copy, Download, FileSearch, Plus, RotateCcw, Save, Star, Trash2, Upload, Wand2 } from "lucide-react";

const DEFAULT_SLUG = "tabela-vidros";
const SAMPLE_TEMPLATE = `TABELA DOS VIDROS: 13/11/25

Reconstrução de telas é um serviço de risco.

Peças com o cristal exposto possuem um risco maior de estar parando durante o processo por conta da possível exposição a umidade.

Não cobrimos com nenhum tipo de garantia, caso a peça pare ou danifique durante o processo, reservamos o aparelho para a retirada montado.

Serviço feito por ordem de chegada.

Em caso de duvidas entrar em contato.

(V/T) = Vidro Touch.

📱 SAMSUNG 📱

Samg A5 2016 (A510) = R$90,00
Samg A15 = R$100,00
Samg A24 = R$150,00

📱 MOTOROLA 📱

Moto G24 = R$90,00
Moto G52 = R$130,00
Moto Edge 50 Ultra = R$350,00

📱 APPLE 📱

IPhone 11 (VT) = R$200,00
IPhone 15 Pro = R$600,00
IPhone 16 Pro Max = R$900,00`;

const categoryLineRegex =
  /^(?:[\p{Extended_Pictographic}\s]*)?[A-ZÀ-Ý0-9][A-ZÀ-Ý0-9\s./()+-]*?(?:[\p{Extended_Pictographic}\s]*)?$|^>[^<]+<$/u;

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, " ").trim();

const normalizeCategoryName = (line: string) =>
  normalizeWhitespace(line.replace(/[>\p{Extended_Pictographic}]/gu, "").replace(/\s{2,}/g, " "));

const parseRetailerPriceTablePreview = (input: string) => {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const firstLine = lines[0] || "Tabela de Preços";
  const titleMatch = firstLine.match(/^(.*?)(?::\s*([0-9]{2}\/[0-9]{2}\/[0-9]{2,4}))?$/);
  const inferredTitle = normalizeWhitespace(titleMatch?.[1] || firstLine);
  const inferredDate = titleMatch?.[2] || null;

  const intro: string[] = [];
  const categories: Array<{
    name: string;
    items: Array<{ name: string; priceText: string; priceValue: number | null }>;
  }> = [];
  let currentCategory: (typeof categories)[number] | null = null;

  for (let index = 1; index < lines.length; index += 1) {
    const line = lines[index];

    if (!currentCategory && !line.includes("=") && !categoryLineRegex.test(line)) {
      intro.push(line);
      continue;
    }

    if (categoryLineRegex.test(line) && !line.includes("=")) {
      currentCategory = { name: normalizeCategoryName(line), items: [] };
      categories.push(currentCategory);
      continue;
    }

    if (line.includes("=")) {
      if (!currentCategory) {
        currentCategory = { name: "Geral", items: [] };
        categories.push(currentCategory);
      }

      const [rawName, ...rest] = line.split("=");
      const name = normalizeWhitespace(rawName);
      const priceText = normalizeWhitespace(rest.join("=")).replace(/^\$\s*/, "R$");
      const match = priceText.match(/(\d+(?:[.,]\d{1,2})?)/);
      const priceValue = match ? Number(match[1].replace(".", "").replace(",", ".")) : null;

      if (!name || !priceText) continue;

      currentCategory.items.push({
        name,
        priceText,
        priceValue: Number.isFinite(priceValue) ? priceValue : null,
      });
      continue;
    }

    if (currentCategory) {
      currentCategory.items.push({
        name: normalizeWhitespace(line),
        priceText: "",
        priceValue: null,
      });
    } else {
      intro.push(line);
    }
  }

  return {
    title: inferredTitle || "Tabela de Preços",
    effectiveDate: inferredDate,
    intro,
    categories: categories.filter((category) => category.items.length > 0),
  };
};

const serializeRetailerPriceTablePreview = (table: {
  title: string;
  effectiveDate?: string | null;
  intro: string[];
  categories: Array<{
    name: string;
    items: Array<{ name: string; priceText: string; priceValue: number | null }>;
  }>;
}) => {
  const lines: string[] = [];
  const header = table.effectiveDate ? `${table.title}: ${table.effectiveDate}` : table.title;
  lines.push(header);

  if (table.intro.length > 0) {
    lines.push("", ...table.intro);
  }

  table.categories.forEach((category) => {
    lines.push("", category.name);
    category.items.forEach((item) => {
      if (item.priceText) {
        lines.push(`${item.name} = ${item.priceText}`);
      } else {
        lines.push(item.name);
      }
    });
  });

  return lines.join("\n").trim();
};

const getTableSummary = (table: Pick<RetailerPriceTableRecord, "parsed_data" | "raw_text">) => {
  const firstIntroLine = table.parsed_data?.intro?.find((line) => line.trim().length > 0);
  if (firstIntroLine) return firstIntroLine;

  const lines = table.raw_text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines[1] || "Tabela pronta para consulta dos lojistas.";
};

const normalizeSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const buildDuplicateSlug = (sourceSlug: string, existingSlugs: string[]) => {
  const baseSlug = normalizeSlug(`${sourceSlug}-copia`) || "nova-tabela-copia";
  let nextSlug = baseSlug;
  let suffix = 2;

  while (existingSlugs.includes(nextSlug)) {
    nextSlug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return nextSlug;
};

const AdminRetailerPriceTables = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tableSlug, setTableSlug] = useState(DEFAULT_SLUG);
  const [allTables, setAllTables] = useState<RetailerPriceTableRecord[]>([]);
  const [tableSearch, setTableSearch] = useState("");
  const [tableFilter, setTableFilter] = useState<"all" | "visible" | "hidden" | "featured">("all");
  const [newSlug, setNewSlug] = useState("");
  const [title, setTitle] = useState("Tabela dos Vidros");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [visibleToRetailers, setVisibleToRetailers] = useState(true);
  const [featuredToRetailers, setFeaturedToRetailers] = useState(false);
  const [rawText, setRawText] = useState("");
  const [record, setRecord] = useState<RetailerPriceTableRecord | null>(null);
  const [previewQuery, setPreviewQuery] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [targetCategoryName, setTargetCategoryName] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const tables = await retailerPriceTablesService.listAdmin();
      setAllTables(tables);

      const activeSlug = tables.some((table) => table.slug === tableSlug)
        ? tableSlug
        : tables[0]?.slug || tableSlug;

      if (activeSlug !== tableSlug) {
        setTableSlug(activeSlug);
      }

      const data = await retailerPriceTablesService.getAdmin(activeSlug);
      if (data) {
        setRecord(data);
        setTitle(data.title || "Tabela dos Vidros");
        setEffectiveDate(data.effective_date || "");
        setVisibleToRetailers(data.visible_to_retailers);
        setFeaturedToRetailers(data.featured_to_retailers);
        setRawText(data.raw_text || "");
      } else {
        setRecord(null);
        setTitle("Tabela dos Vidros");
        setEffectiveDate("");
        setVisibleToRetailers(true);
        setFeaturedToRetailers(false);
        setRawText("");
      }
      setLoading(false);
    };

    load();
  }, [tableSlug]);

  const parsedPreview = useMemo(
    () => (rawText.trim() ? parseRetailerPriceTablePreview(rawText) : record?.parsed_data || null),
    [rawText, record]
  );

  const totalItems = parsedPreview?.categories.reduce((total, category) => total + category.items.length, 0) || 0;

  const filteredPreviewCategories = useMemo(() => {
    if (!parsedPreview) return [];

    const normalizedQuery = previewQuery.trim().toLowerCase();
    if (!normalizedQuery) return parsedPreview.categories;

    return parsedPreview.categories
      .map((category) => ({
        ...category,
        items: category.items.filter((item) =>
          `${category.name} ${item.name} ${item.priceText}`.toLowerCase().includes(normalizedQuery)
        ),
      }))
      .filter((category) => category.items.length > 0);
  }, [parsedPreview, previewQuery]);

  const previewMatches = filteredPreviewCategories.reduce(
    (total, category) => total + category.items.length,
    0
  );

  const filteredTables = useMemo(() => {
    const normalizedQuery = tableSearch.trim().toLowerCase();

    return allTables.filter((table) => {
      const matchesFilter =
        tableFilter === "all" ||
        (tableFilter === "visible" && table.visible_to_retailers) ||
        (tableFilter === "hidden" && !table.visible_to_retailers) ||
        (tableFilter === "featured" && table.featured_to_retailers);

      if (!matchesFilter) return false;
      if (!normalizedQuery) return true;

      return `${table.title} ${table.slug} ${getTableSummary(table)}`
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [allTables, tableFilter, tableSearch]);

  const hasUnsavedChanges =
    title !== (record?.title || "Tabela dos Vidros") ||
    effectiveDate !== (record?.effective_date || "") ||
    visibleToRetailers !== (record?.visible_to_retailers ?? true) ||
    featuredToRetailers !== (record?.featured_to_retailers ?? false) ||
    rawText !== (record?.raw_text || "");

  const handleSave = async () => {
    if (!rawText.trim()) {
      toast.error("Cole o texto da tabela ou importe um arquivo .txt");
      return;
    }

    try {
      setSaving(true);
      const saved = await retailerPriceTablesService.save(tableSlug, {
        title,
        effectiveDate: effectiveDate || null,
        visibleToRetailers,
        featuredToRetailers,
        rawText,
      });
      if (saved) {
        setRecord(saved);
        setAllTables((current) => {
          const existingIndex = current.findIndex((table) => table.slug === saved.slug);
          if (existingIndex === -1) return [saved, ...current];
          const next = [...current];
          next[existingIndex] = saved;
          return next;
        });
        setTitle(saved.title);
        setEffectiveDate(saved.effective_date || "");
        setVisibleToRetailers(saved.visible_to_retailers);
        setFeaturedToRetailers(saved.featured_to_retailers);
        toast.success("Tabela de preços salva com sucesso");
      } else {
        toast.error("Não foi possível salvar a tabela");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Erro ao salvar a tabela");
    } finally {
      setSaving(false);
    }
  };

  const handleTxtImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setRawText(String(e.target?.result || ""));
      toast.success("Arquivo .txt carregado. Agora clique em salvar para importar.");
    };
    reader.readAsText(file, "utf-8");
  };

  const handleExportTxt = () => {
    if (!rawText.trim()) {
      toast.error("Não há conteúdo para exportar");
      return;
    }

    const blob = new Blob([rawText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${tableSlug}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Arquivo .txt exportado");
  };

  const handleLoadTemplate = () => {
    setRawText(SAMPLE_TEMPLATE);
    if (!title.trim()) {
      setTitle("Tabela dos Vidros");
    }
    if (!effectiveDate.trim()) {
      setEffectiveDate("13/11/25");
    }
    toast.success("Modelo-base carregado. Ajuste o texto e clique em salvar.");
  };

  const handleAutoFillFromText = () => {
    if (!rawText.trim()) {
      toast.error("Cole ou importe um texto antes de usar o preenchimento automático");
      return;
    }

    const parsed = parseRetailerPriceTablePreview(rawText);
    setTitle(parsed.title || "Tabela dos Vidros");
    setEffectiveDate(parsed.effectiveDate || "");
    toast.success("Título e data preenchidos com base no texto importado");
  };

  const handleClearText = () => {
    setRawText("");
    setPreviewQuery("");
    toast.success("Texto da tabela limpo");
  };

  const handleResetForm = () => {
    setTitle(record?.title || "Tabela dos Vidros");
    setEffectiveDate(record?.effective_date || "");
    setVisibleToRetailers(record?.visible_to_retailers ?? true);
    setFeaturedToRetailers(record?.featured_to_retailers ?? false);
    setRawText(record?.raw_text || "");
    setPreviewQuery("");
    toast.success("Campos restaurados para a última versão salva");
  };

  const handleCreateNewTable = () => {
    const normalizedSlug = normalizeSlug(newSlug);

    if (!normalizedSlug) {
      toast.error("Informe um slug valido");
      return;
    }

    if (allTables.some((table) => table.slug === normalizedSlug)) {
      toast.error("Ja existe uma tabela com esse slug");
      return;
    }

    setTableSlug(normalizedSlug);
    setRecord(null);
    setTitle("Nova Tabela de Preços");
    setEffectiveDate("");
    setVisibleToRetailers(true);
    setFeaturedToRetailers(false);
    setRawText("");
    setPreviewQuery("");
    setNewSlug("");
    toast.success("Nova tabela criada no editor. Preencha e salve quando quiser.");
  };

  const handleDuplicateTable = async (sourceTable: RetailerPriceTableRecord) => {
    try {
      setSaving(true);
      const duplicateSlug = buildDuplicateSlug(
        sourceTable.slug,
        allTables.map((table) => table.slug)
      );

      const duplicated = await retailerPriceTablesService.save(duplicateSlug, {
        title: `${sourceTable.title} - Copia`,
        effectiveDate: sourceTable.effective_date || null,
        visibleToRetailers: sourceTable.visible_to_retailers,
        featuredToRetailers: false,
        rawText: sourceTable.raw_text,
      });

      if (!duplicated) {
        toast.error("Nao foi possivel duplicar a tabela");
        return;
      }

      const tables = await retailerPriceTablesService.listAdmin();
      setAllTables(tables);
      setTableSlug(duplicated.slug);
      setRecord(duplicated);
      setTitle(duplicated.title);
      setEffectiveDate(duplicated.effective_date || "");
      setVisibleToRetailers(duplicated.visible_to_retailers);
      setFeaturedToRetailers(duplicated.featured_to_retailers);
      setRawText(duplicated.raw_text || "");
      setPreviewQuery("");
      toast.success(`Tabela duplicada como ${duplicated.slug}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Erro ao duplicar a tabela");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTable = async (tableToDelete?: RetailerPriceTableRecord | null) => {
    const targetTable = tableToDelete || record;

    if (!targetTable) {
      toast.error("Selecione uma tabela salva para remover");
      return;
    }

    const confirmed = window.confirm(
      `Deseja remover a tabela "${targetTable.title}" (${targetTable.slug})? Esta acao nao pode ser desfeita.`
    );

    if (!confirmed) {
      return;
    }

    try {
      await retailerPriceTablesService.deleteAdmin(targetTable.slug);
      const remaining = allTables.filter((table) => table.slug !== targetTable.slug);
      setAllTables(remaining);
      const nextSlug = remaining[0]?.slug || DEFAULT_SLUG;
      setTableSlug(nextSlug);
      if (remaining.length === 0) {
        setRecord(null);
        setTitle("Tabela dos Vidros");
        setEffectiveDate("");
        setVisibleToRetailers(true);
        setFeaturedToRetailers(false);
        setRawText("");
        setPreviewQuery("");
      }
      toast.success("Tabela removida com sucesso");
    } catch (error: any) {
      toast.error(error.message || "Erro ao remover tabela");
    }
  };

  const handleReorderTables = async (slug: string, direction: "up" | "down") => {
    const currentIndex = allTables.findIndex((table) => table.slug === slug);
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= allTables.length) return;

    const next = [...allTables];
    [next[currentIndex], next[targetIndex]] = [next[targetIndex], next[currentIndex]];

    setAllTables(next);

    try {
      const savedOrder = await retailerPriceTablesService.reorderAdmin(next.map((table) => table.slug));
      setAllTables(savedOrder);
      toast.success("Ordem das tabelas atualizada");
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Erro ao reordenar tabelas");
      const tables = await retailerPriceTablesService.listAdmin();
      setAllTables(tables);
    }
  };

  const replacePreviewTable = (
    updater: (table: NonNullable<typeof parsedPreview>) => NonNullable<typeof parsedPreview>
  ) => {
    if (!parsedPreview) {
      toast.error("Carregue ou digite uma tabela antes de editar");
      return;
    }

    const updated = updater(parsedPreview);
    setRawText(serializeRetailerPriceTablePreview(updated));
  };

  const handleNormalizeText = () => {
    if (!parsedPreview) {
      toast.error("Nao ha tabela para normalizar");
      return;
    }
    setRawText(serializeRetailerPriceTablePreview(parsedPreview));
    toast.success("Texto reorganizado com base na estrutura da tabela");
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error("Informe o nome da categoria");
      return;
    }

    replacePreviewTable((table) => ({
      ...table,
      categories: [
        ...table.categories,
        { name: newCategoryName.trim(), items: [] },
      ],
    }));
    setNewCategoryName("");
    toast.success("Categoria adicionada");
  };

  const handleRemoveCategory = (categoryName: string) => {
    const confirmed = window.confirm(
      `Deseja remover a categoria "${categoryName}" da tabela em edicao?`
    );

    if (!confirmed) {
      return;
    }

    replacePreviewTable((table) => ({
      ...table,
      categories: table.categories.filter((category) => category.name !== categoryName),
    }));
    toast.success("Categoria removida");
  };

  const handleRenameCategory = (currentName: string, nextName: string) => {
    if (!nextName.trim()) return;
    replacePreviewTable((table) => ({
      ...table,
      categories: table.categories.map((category) =>
        category.name === currentName
          ? {
              ...category,
              name: nextName.trim(),
            }
          : category
      ),
    }));
  };

  const handleMoveCategory = (categoryName: string, direction: "up" | "down") => {
    replacePreviewTable((table) => {
      const categories = [...table.categories];
      const index = categories.findIndex((category) => category.name === categoryName);
      if (index === -1) return table;
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= categories.length) return table;
      [categories[index], categories[targetIndex]] = [categories[targetIndex], categories[index]];
      return { ...table, categories };
    });
  };

  const handleAddItem = () => {
    if (!targetCategoryName) {
      toast.error("Selecione a categoria de destino");
      return;
    }
    if (!newItemName.trim()) {
      toast.error("Informe o nome do item");
      return;
    }

    replacePreviewTable((table) => ({
      ...table,
      categories: table.categories.map((category) =>
        category.name === targetCategoryName
          ? {
              ...category,
              items: [
                ...category.items,
                {
                  name: newItemName.trim(),
                  priceText: newItemPrice.trim(),
                  priceValue: null,
                },
              ],
            }
          : category
      ),
    }));
    setNewItemName("");
    setNewItemPrice("");
    toast.success("Item adicionado");
  };

  const handleRemoveItem = (categoryName: string, itemName: string, itemPriceText: string) => {
    const confirmed = window.confirm(
      `Deseja remover o item "${itemName}" da categoria "${categoryName}"?`
    );

    if (!confirmed) {
      return;
    }

    replacePreviewTable((table) => ({
      ...table,
      categories: table.categories.map((category) =>
        category.name === categoryName
          ? {
              ...category,
              items: category.items.filter(
                (item) => !(item.name === itemName && item.priceText === itemPriceText)
              ),
            }
          : category
      ),
    }));
    toast.success("Item removido");
  };

  const handleUpdateItem = (
    categoryName: string,
    currentItemName: string,
    currentItemPriceText: string,
    field: "name" | "priceText",
    value: string
  ) => {
    replacePreviewTable((table) => ({
      ...table,
      categories: table.categories.map((category) =>
        category.name === categoryName
          ? {
              ...category,
              items: category.items.map((item) =>
                item.name === currentItemName && item.priceText === currentItemPriceText
                  ? {
                      ...item,
                      [field]: value,
                    }
                  : item
              ),
            }
          : category
      ),
    }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tabela de Preços</h1>
          <p className="text-muted-foreground mt-2">
            Importe a tabela via texto bruto ou arquivo `.txt`. Esta página ficará visível apenas para lojistas logados.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Gerenciar Tabelas</CardTitle>
            <CardDescription>
              Trabalhe com múltiplas tabelas usando slugs separados, como vidros, traseiros ou watches.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr_auto_auto] gap-3">
            <select
              value={tableSlug}
              onChange={(e) => setTableSlug(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              {allTables.length === 0 ? (
                <option value={tableSlug}>{tableSlug}</option>
              ) : (
                allTables.map((table) => (
                  <option key={table.slug} value={table.slug}>
                    {table.title} ({table.slug})
                  </option>
                ))
              )}
            </select>
            <Input
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              placeholder="novo-slug"
            />
            <Button type="button" variant="outline" onClick={handleCreateNewTable}>
              <Plus className="w-4 h-4 mr-2" />
              Nova tabela
            </Button>
            <Button type="button" variant="destructive" onClick={() => handleDeleteTable()} disabled={!record}>
              <Trash2 className="w-4 h-4 mr-2" />
              Remover
            </Button>
          </CardContent>
        </Card>

        {allTables.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Ordem e Destaque</CardTitle>
              <CardDescription>
                Defina a sequência exibida na área do lojista e marque a tabela principal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
                <Input
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  placeholder="Buscar por titulo, slug ou resumo..."
                />
                <select
                  value={tableFilter}
                  onChange={(e) => setTableFilter(e.target.value as "all" | "visible" | "hidden" | "featured")}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="all">Todas</option>
                  <option value="visible">Somente visiveis</option>
                  <option value="hidden">Somente ocultas</option>
                  <option value="featured">Somente destaque</option>
                </select>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{filteredTables.length} tabela(s)</Badge>
                <Badge variant="outline">
                  {allTables.filter((table) => table.visible_to_retailers).length} visivel(is)
                </Badge>
                <Badge variant="outline">
                  {allTables.filter((table) => !table.visible_to_retailers).length} oculta(s)
                </Badge>
                <Badge variant="outline">
                  {allTables.filter((table) => table.featured_to_retailers).length} destaque(s)
                </Badge>
              </div>

              {filteredTables.map((table) => {
                const index = allTables.findIndex((entry) => entry.slug === table.slug);
                return (
                <div
                  key={table.slug}
                  className={`flex flex-col gap-3 rounded-xl border p-4 md:flex-row md:items-center md:justify-between ${
                    tableSlug === table.slug ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">{table.title}</p>
                      {table.featured_to_retailers ? (
                        <Badge className="bg-amber-500 text-white hover:bg-amber-500">
                          <Star className="mr-1 h-3.5 w-3.5" />
                          Destaque
                        </Badge>
                      ) : null}
                      {!table.visible_to_retailers ? <Badge variant="outline">Oculta</Badge> : null}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {table.slug} · ordem {table.sort_order || index + 1}
                    </p>
                    <p className="max-w-3xl text-sm text-muted-foreground">
                      {getTableSummary(table)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setTableSlug(table.slug)}>
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteTable(table)}
                      disabled={saving}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicateTable(table)}
                      disabled={saving}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleReorderTables(table.slug, "up")}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleReorderTables(table.slug, "down")}
                      disabled={index === allTables.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                );
              })}
              {filteredTables.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                  Nenhuma tabela encontrada para esse filtro.
                </div>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Categorias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{parsedPreview?.categories.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Itens</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalItems}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{parsedPreview?.intro.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant={hasUnsavedChanges ? "secondary" : "outline"}>
                  {hasUnsavedChanges ? "Alteracoes pendentes" : "Tudo salvo"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Importação e Configuração</CardTitle>
              <CardDescription>
                Cole o texto completo no formato que você já usa no WhatsApp ou em arquivo `.txt`.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Título</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data de Referência</label>
                  <Input
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    placeholder="13/11/25"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="text-sm font-medium">Visível para lojistas</p>
                  <p className="text-xs text-muted-foreground">
                    Se desativado, a página deixa de aparecer para lojistas.
                  </p>
                </div>
                <Checkbox checked={visibleToRetailers} onCheckedChange={(value) => setVisibleToRetailers(Boolean(value))} />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="text-sm font-medium">Tabela em destaque</p>
                  <p className="text-xs text-muted-foreground">
                    A tabela destacada aparece primeiro para o lojista e substitui automaticamente qualquer destaque anterior.
                  </p>
                </div>
                <Checkbox checked={featuredToRetailers} onCheckedChange={(value) => setFeaturedToRetailers(Boolean(value))} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Texto bruto da tabela</label>
                <Textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  rows={24}
                  placeholder="Cole aqui a tabela completa..."
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <label>
                  <Button variant="outline" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Importar .txt
                    </span>
                  </Button>
                  <input type="file" accept=".txt" className="hidden" onChange={handleTxtImport} />
                </label>
                <Button type="button" variant="outline" onClick={handleLoadTemplate}>
                  Carregar Modelo
                </Button>
                <Button type="button" variant="outline" onClick={handleAutoFillFromText}>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Preencher titulo/data
                </Button>
                <Button type="button" variant="outline" onClick={handleExportTxt}>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar .txt
                </Button>
                <Button type="button" variant="outline" onClick={handleResetForm} disabled={!record}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restaurar salvo
                </Button>
                <Button type="button" variant="outline" onClick={handleClearText}>
                  Limpar texto
                </Button>
                <Button onClick={handleSave} disabled={saving || loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Tabela"}
                </Button>
              </div>

              <div className="sticky bottom-4 z-10 rounded-2xl border border-primary/20 bg-background/95 p-3 shadow-lg backdrop-blur">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Salvar alteracoes da tabela</p>
                    <p className="text-xs text-muted-foreground">
                      Use este botao fixo quando estiver editando itens, categorias ou o texto bruto.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={hasUnsavedChanges ? "secondary" : "outline"}>
                      {hasUnsavedChanges ? "Alteracoes pendentes" : "Tudo salvo"}
                    </Badge>
                    <Button onClick={handleSave} disabled={saving || loading}>
                      <Save className="mr-2 h-4 w-4" />
                      {saving ? "Salvando..." : "Salvar agora"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview Estruturado</CardTitle>
              <CardDescription>
                O sistema converte automaticamente o texto em categorias e itens para os lojistas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {parsedPreview ? (
                <>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{parsedPreview.categories.length} categoria(s)</Badge>
                    <Badge variant="outline">{totalItems} item(ns)</Badge>
                    {previewQuery ? (
                      <Badge variant="secondary">{previewMatches} resultado(s)</Badge>
                    ) : null}
                    <Button type="button" variant="outline" size="sm" onClick={handleNormalizeText}>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Normalizar texto
                    </Button>
                  </div>

                  <div className="relative">
                    <FileSearch className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={previewQuery}
                      onChange={(e) => setPreviewQuery(e.target.value)}
                      placeholder="Buscar no preview por categoria, item ou preco..."
                      className="pl-10"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-lg border border-border p-4 space-y-3">
                      <p className="text-sm font-semibold">Adicionar categoria</p>
                      <Input
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Ex.: APPLE WATCH"
                      />
                      <Button type="button" size="sm" onClick={handleAddCategory}>
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar categoria
                      </Button>
                    </div>

                    <div className="rounded-lg border border-border p-4 space-y-3">
                      <p className="text-sm font-semibold">Adicionar item</p>
                      <select
                        value={targetCategoryName}
                        onChange={(e) => setTargetCategoryName(e.target.value)}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                      >
                        <option value="">Selecione a categoria</option>
                        {parsedPreview.categories.map((category) => (
                          <option key={category.name} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      <Input
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder="Nome do item"
                      />
                      <Input
                        value={newItemPrice}
                        onChange={(e) => setNewItemPrice(e.target.value)}
                        placeholder="R$90,00"
                      />
                      <Button type="button" size="sm" onClick={handleAddItem}>
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar item
                      </Button>
                    </div>
                  </div>

                  {parsedPreview.intro.length > 0 ? (
                    <div className="rounded-lg border border-border p-4 space-y-2">
                      <p className="text-sm font-semibold">Observações</p>
                      {parsedPreview.intro.slice(0, 5).map((line, index) => (
                        <p key={index} className="text-sm text-muted-foreground">{line}</p>
                      ))}
                    </div>
                  ) : null}

                  <div className="space-y-3 max-h-[620px] overflow-auto pr-2">
                    {filteredPreviewCategories.map((category) => (
                      <div key={category.name} className="rounded-lg border border-border p-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div className="flex-1 space-y-2">
                            <Input
                              value={category.name}
                              onChange={(e) => handleRenameCategory(category.name, e.target.value)}
                              className="h-9 font-semibold"
                            />
                            <p className="text-xs text-muted-foreground">{category.items.length} item(ns)</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => handleMoveCategory(category.name, "up")}
                            >
                              <ArrowUp className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => handleMoveCategory(category.name, "down")}
                            >
                              <ArrowDown className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveCategory(category.name)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remover categoria
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {category.items.slice(0, 8).map((item, index) => (
                            <div key={`${category.name}-${index}`} className="flex items-center gap-3 text-sm">
                              <Input
                                value={item.name}
                                onChange={(e) =>
                                  handleUpdateItem(category.name, item.name, item.priceText, "name", e.target.value)
                                }
                                className="h-9 flex-1"
                              />
                              <div className="flex items-center gap-2">
                                <Input
                                  value={item.priceText}
                                  onChange={(e) =>
                                    handleUpdateItem(category.name, item.name, item.priceText, "priceText", e.target.value)
                                  }
                                  className="h-9 w-36 font-medium text-primary"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveItem(category.name, item.name, item.priceText)}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          {category.items.length > 8 ? (
                            <p className="text-xs text-muted-foreground">
                              + {category.items.length - 8} item(ns) nesta categoria
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ))}
                    {filteredPreviewCategories.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
                        Nenhum item encontrado para a busca informada.
                      </div>
                    ) : null}
                  </div>
                </>
              ) : (
                <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
                  Salve uma tabela para visualizar o preview estruturado aqui.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminRetailerPriceTables;
