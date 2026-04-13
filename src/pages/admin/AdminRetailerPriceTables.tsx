import { useEffect, useMemo, useRef, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  retailerPriceTablesService,
  RetailerPriceTableRecord,
  RetailerPriceTableServiceTemplate,
} from "@/services/retailerPriceTablesService";
import {
  buildBrandsFromCategories,
  buildStructuredCategories,
  countBrandDevices,
  countBrandServices,
  parsePriceValue,
  structuredCategoriesToFlatCategories,
} from "@/utils/retailerPriceTable";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  Plus,
  RotateCcw,
  Save,
  Star,
  Trash2,
  Upload,
  Wand2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PriceAnalyticsView } from "@/components/admin/PriceAnalyticsView";

const DEFAULT_SLUG = "tabela-vidros";
const SAMPLE_TEMPLATE = `TABELA DOS VIDROS: 13/11/25

Reconstrução de telas é um serviço de risco.

Peças com o cristal exposto possuem um risco maior de estar parando durante o processo por conta da possível exposição a umidade.

Não cobrimos com nenhum tipo de garantia, caso a peça pare ou danifique durante o processo, reservamos o aparelho para a retirada montado.

Serviço feito por ordem de chegada.

Em caso de duvidas entrar em contato.

(V/T) = Vidro Touch.

📱 SAMSUNG 📱

Samg A5 2016 (A510) > Troca de Vidro = R$90,00
Samg A15 > Troca de Vidro = R$100,00
Samg A15 > Troca de Bateria = R$80,00
Samg A24 > Troca de Vidro = R$150,00

📱 MOTOROLA 📱

Moto G24 > Troca de Vidro = R$90,00
Moto G52 > Troca de Vidro = R$130,00
Moto G52 > Troca de Bateria = R$95,00
Moto Edge 50 Ultra > Troca de Vidro = R$350,00

📱 APPLE 📱

IPhone 11 (VT) > Troca de Vidro = R$200,00
IPhone 11 (VT) > Troca de Bateria = R$150,00
IPhone 15 Pro > Troca de Vidro = R$600,00
IPhone 16 Pro Max > Troca de Vidro = R$900,00`;

const SERVICE_PRESETS = [
  "Troca de Vidro",
  "Troca de Bateria",
  "Troca de Tela",
  "Troca de Touch",
  "Display",
  "Face ID",
] as const;

const categoryLineRegex =
  /^(?:[\p{Extended_Pictographic}\s]*)?[A-ZÀ-Ý0-9][A-ZÀ-Ý0-9\s./()+-]*?(?:[\p{Extended_Pictographic}\s]*)?$|^>[^<]+<$/u;

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, " ").trim();

const normalizeCategoryName = (line: string) =>
  normalizeWhitespace(line.replace(/[<>\p{Extended_Pictographic}]/gu, "").replace(/\s{2,}/g, " "));

const formatPriceText = (value: number) =>
  `R$${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

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
    categories,
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
    lines.push("", `> ${category.name} <`);
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

const normalizeParsedTable = (table: {
  title?: string;
  effectiveDate?: string | null;
  intro?: string[];
  categories?: Array<{
    name: string;
    items: Array<{ name: string; priceText: string; priceValue: number | null }>;
  }>;
} | null | undefined) => {
  if (!table) {
    return {
      title: "Tabela de Preços",
      effectiveDate: null,
      intro: [],
      categories: [],
    };
  }

  return {
    title: table.title || "Tabela de Preços",
    effectiveDate: table.effectiveDate || null,
    intro: [...(table.intro || [])],
    categories: (table.categories || []).map((category) => ({
      ...category,
      name: normalizeCategoryName(category.name || ""),
      items: (category.items || []).map((item) => ({
        ...item,
        name: normalizeWhitespace(item.name || ""),
        priceText: normalizeWhitespace(item.priceText || ""),
      })),
    })),
  };
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
  const [isDraftTable, setIsDraftTable] = useState(false);
  const [allTables, setAllTables] = useState<RetailerPriceTableRecord[]>([]);
  const [tableSearch, setTableSearch] = useState("");
  const [tableFilter, setTableFilter] = useState<"all" | "visible" | "hidden" | "featured">("all");
  const [newTableTitle, setNewTableTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newSlugTouched, setNewSlugTouched] = useState(false);
  const [newTableMode, setNewTableMode] = useState<"blank" | "template">("blank");
  const [title, setTitle] = useState("Tabela dos Vidros");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [visibleToRetailers, setVisibleToRetailers] = useState(true);
  const [featuredToRetailers, setFeaturedToRetailers] = useState(false);
  const [rawText, setRawText] = useState("");
  const [record, setRecord] = useState<RetailerPriceTableRecord | null>(null);
  const [previewQuery, setPreviewQuery] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [collapsedDevices, setCollapsedDevices] = useState<Record<string, boolean>>({});
  const [deviceBulkMode, setDeviceBulkMode] = useState<Record<string, "percent" | "set">>({});
  const [deviceBulkValue, setDeviceBulkValue] = useState<Record<string, string>>({});
  const [deviceServiceSource, setDeviceServiceSource] = useState<Record<string, string>>({});
  const [emptyCategoryDrafts, setEmptyCategoryDrafts] = useState<
    Record<number, { deviceName: string; serviceName: string; priceText: string }>
  >({});
  const [serviceTemplates, setServiceTemplates] = useState<RetailerPriceTableServiceTemplate[]>([]);
  const [deviceTemplateSelection, setDeviceTemplateSelection] = useState<Record<string, string>>({});
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editingTemplateName, setEditingTemplateName] = useState("");
  const [pendingIntroFocusIndex, setPendingIntroFocusIndex] = useState<number | null>(null);
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const newCategoryInputRef = useRef<HTMLInputElement | null>(null);
  const introLineRefs = useRef<Record<number, HTMLTextAreaElement | null>>({});
  const categoryNameRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const emptyCategoryDeviceRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const deviceNameRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [pendingStructureFocus, setPendingStructureFocus] = useState<{
    categoryIndex: number;
    deviceIndex: number;
  } | null>(null);
  const serviceNameRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const servicePriceRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [pendingCategoryFocusIndex, setPendingCategoryFocusIndex] = useState<number | null>(null);
  const [pendingServiceFocus, setPendingServiceFocus] = useState<{
    categoryIndex: number;
    deviceIndex: number;
    serviceIndex: number;
  } | null>(null);
  const [pendingServicePriceFocus, setPendingServicePriceFocus] = useState<{
    categoryIndex: number;
    deviceIndex: number;
    serviceIndex: number;
  } | null>(null);

  const resetTransientEditorState = () => {
    setPreviewQuery("");
    setNewCategoryName("");
    setCollapsedCategories({});
    setCollapsedDevices({});
    setDeviceBulkMode({});
    setDeviceBulkValue({});
    setDeviceServiceSource({});
    setEmptyCategoryDrafts({});
    setDeviceTemplateSelection({});
    setEditingTemplateId(null);
    setEditingTemplateName("");
    setPendingIntroFocusIndex(null);
    setPendingCategoryFocusIndex(null);
    setPendingStructureFocus(null);
    setPendingServiceFocus(null);
    setPendingServicePriceFocus(null);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const tables = await retailerPriceTablesService.listAdmin();
      setAllTables(tables);

      const hasCurrentSlug = tables.some((table) => table.slug === tableSlug);

      if (!hasCurrentSlug && isDraftTable) {
        setRecord(null);
        setLoading(false);
        return;
      }

      const activeSlug = hasCurrentSlug ? tableSlug : tables[0]?.slug || tableSlug;

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
        setServiceTemplates(data.service_templates || []);
        setIsDraftTable(false);
        resetTransientEditorState();
      } else {
        setRecord(null);
        setTitle("Tabela dos Vidros");
        setEffectiveDate("");
        setVisibleToRetailers(true);
        setFeaturedToRetailers(false);
        setRawText("");
        setServiceTemplates([]);
        resetTransientEditorState();
      }
      setLoading(false);
    };

    load();
  }, [isDraftTable, tableSlug]);

  const parsedPreview = useMemo(() => {
    const baseTable = normalizeParsedTable(
      rawText.trim() ? parseRetailerPriceTablePreview(rawText) : record?.parsed_data
    );

    return {
      title: title.trim() || baseTable.title || tableSlug || "Tabela de Preços",
      effectiveDate: effectiveDate.trim() || baseTable.effectiveDate || null,
      intro: [...baseTable.intro],
      categories: [...baseTable.categories],
    };
  }, [effectiveDate, rawText, record, tableSlug, title]);

  const previewBrands = useMemo(
    () => buildBrandsFromCategories(parsedPreview.categories || []),
    [parsedPreview]
  );

  const structuredPreviewCategories = useMemo(
    () => buildStructuredCategories(parsedPreview.categories || []),
    [parsedPreview]
  );

  useEffect(() => {
    if (pendingIntroFocusIndex === null) return;

    const target = introLineRefs.current[pendingIntroFocusIndex];
    if (!target) return;

    target.focus();
    target.setSelectionRange(target.value.length, target.value.length);
    setPendingIntroFocusIndex(null);
  }, [parsedPreview.intro, pendingIntroFocusIndex]);

  useEffect(() => {
    if (pendingCategoryFocusIndex === null) return;

    const target = categoryNameRefs.current[pendingCategoryFocusIndex];
    if (!target) return;

    target.focus();
    target.setSelectionRange(target.value.length, target.value.length);
    setPendingCategoryFocusIndex(null);
  }, [pendingCategoryFocusIndex, structuredPreviewCategories]);

  useEffect(() => {
    if (!pendingStructureFocus) return;

    const target = deviceNameRefs.current[
      `${pendingStructureFocus.categoryIndex}-${pendingStructureFocus.deviceIndex}`
    ];
    if (!target) return;

    target.focus();
    target.setSelectionRange(target.value.length, target.value.length);
    setPendingStructureFocus(null);
  }, [pendingStructureFocus, structuredPreviewCategories]);

  useEffect(() => {
    if (!pendingServiceFocus) return;

    const target = serviceNameRefs.current[
      `${pendingServiceFocus.categoryIndex}-${pendingServiceFocus.deviceIndex}-${pendingServiceFocus.serviceIndex}`
    ];
    if (!target) return;

    target.focus();
    target.setSelectionRange(target.value.length, target.value.length);
    setPendingServiceFocus(null);
  }, [pendingServiceFocus, structuredPreviewCategories]);

  useEffect(() => {
    if (!pendingServicePriceFocus) return;

    const target = servicePriceRefs.current[
      `${pendingServicePriceFocus.categoryIndex}-${pendingServicePriceFocus.deviceIndex}-${pendingServicePriceFocus.serviceIndex}`
    ];
    if (!target) return;

    target.focus();
    target.setSelectionRange(target.value.length, target.value.length);
    setPendingServicePriceFocus(null);
  }, [pendingServicePriceFocus, structuredPreviewCategories]);

  const totalItems = parsedPreview.categories.reduce((total, category) => total + category.items.length, 0);
  const totalDevices = countBrandDevices(previewBrands);
  const totalServices = countBrandServices(previewBrands);
  const pricedServices =
    structuredPreviewCategories.reduce(
      (total, category) =>
        total +
        category.devices.reduce(
          (deviceTotal, device) =>
            deviceTotal +
            device.services.filter((service) => {
              const priceText = service.priceText.trim();
              return priceText.length > 0 && parsePriceValue(priceText) !== null;
            }).length,
          0
        ),
      0
    ) || 0;
  const pendingServices =
    structuredPreviewCategories.reduce(
      (total, category) =>
        total +
        category.devices.reduce(
          (deviceTotal, device) =>
            deviceTotal + device.services.filter((service) => service.priceText.trim().length === 0).length,
          0
        ),
      0
    ) || 0;
  const invalidServices =
    structuredPreviewCategories.reduce(
      (total, category) =>
        total +
        category.devices.reduce(
          (deviceTotal, device) =>
            deviceTotal +
            device.services.filter((service) => {
              const priceText = service.priceText.trim();
              return priceText.length > 0 && parsePriceValue(priceText) === null;
            }).length,
          0
        ),
      0
    ) || 0;
  const completionRate =
    (totalServices || totalItems) > 0
      ? Math.round((pricedServices / (totalServices || totalItems)) * 100)
      : 0;

  const filteredStructuredCategories = useMemo(() => {
    if (!structuredPreviewCategories.length) return [];

    const normalizedQuery = previewQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return structuredPreviewCategories.map((category, categoryIndex) => ({
        ...category,
        categoryIndex,
        devices: category.devices.map((device, deviceIndex) => ({
          ...device,
          deviceIndex,
          services: device.services.map((service, serviceIndex) => ({
            ...service,
            serviceIndex,
          })),
        })),
      }));
    }

    return structuredPreviewCategories
      .map((category, categoryIndex) => ({
        ...category,
        categoryIndex,
        devices: category.devices
          .map((device, deviceIndex) => ({
            ...device,
            deviceIndex,
            services: device.services
              .map((service, serviceIndex) => ({
                ...service,
                serviceIndex,
              }))
              .filter((service) =>
                `${category.name} ${device.name} ${service.name} ${service.priceText}`
                  .toLowerCase()
                  .includes(normalizedQuery)
              ),
          }))
          .filter(
            (device) =>
              device.name.toLowerCase().includes(normalizedQuery) ||
              category.name.toLowerCase().includes(normalizedQuery) ||
              device.services.length > 0
          ),
      }))
      .filter((category) => category.devices.length > 0 || category.name.toLowerCase().includes(normalizedQuery));
  }, [structuredPreviewCategories, previewQuery]);

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

  const newTableDraftTitle = normalizeWhitespace(newTableTitle) || normalizeWhitespace(newSlug);
  const normalizedNewTableSlug = normalizeSlug(newSlug || newTableTitle);
  const suggestedNewTableSlug = normalizeSlug(newTableTitle);
  const newTableSlugConflict = allTables.some((table) => table.slug === normalizedNewTableSlug);

  const hasUnsavedChanges =
    title !== (record?.title || "Tabela dos Vidros") ||
    effectiveDate !== (record?.effective_date || "") ||
    visibleToRetailers !== (record?.visible_to_retailers ?? true) ||
    featuredToRetailers !== (record?.featured_to_retailers ?? false) ||
    rawText !== (record?.raw_text || "") ||
    JSON.stringify(serviceTemplates) !== JSON.stringify(record?.service_templates || []);

  const publicationChecks = useMemo(() => {
    const checks: Array<{ label: string; tone: "error" | "warning" }> = [];

    if (!title.trim()) {
      checks.push({ label: "Informe um titulo para a tabela", tone: "error" });
    }

    if (structuredPreviewCategories.length === 0) {
      checks.push({ label: "Cadastre ao menos uma categoria", tone: "error" });
    }

    // Verificar categorias com nomes duplicados
    const categoryNames = structuredPreviewCategories.map(cat => cat.name.toLowerCase().trim());
    const duplicateNames = categoryNames.filter((name, index) => categoryNames.indexOf(name) !== index);
    const uniqueDuplicates = [...new Set(duplicateNames)];
    if (uniqueDuplicates.length > 0) {
      checks.push({ label: `Categoria(s) duplicada(s): ${uniqueDuplicates.join(", ")}`, tone: "error" });
    }

    if ((totalServices || totalItems) === 0) {
      checks.push({ label: "Cadastre ao menos um servico com estrutura valida", tone: "error" });
    }

    if (featuredToRetailers && !visibleToRetailers) {
      checks.push({ label: "Tabela principal precisa estar visivel para lojistas", tone: "error" });
    }

    if (pendingServices > 0) {
      checks.push({
        label: visibleToRetailers
          ? `${pendingServices} servico(s) ainda sem preco para publicar`
          : `${pendingServices} servico(s) ainda sem preco no rascunho`,
        tone: visibleToRetailers ? "error" : "warning",
      });
    }

    if (invalidServices > 0) {
      checks.push({
        label: visibleToRetailers
          ? `${invalidServices} servico(s) com preco invalido impedem a publicacao`
          : `${invalidServices} servico(s) com preco invalido no rascunho`,
        tone: visibleToRetailers ? "error" : "warning",
      });
    }

    return checks;
  }, [
    featuredToRetailers,
    invalidServices,
    pendingServices,
    structuredPreviewCategories.length,
    title,
    totalItems,
    totalServices,
    visibleToRetailers,
  ]);

  const blockingPublicationChecks = publicationChecks.filter((check) => check.tone === "error");
  const publicationReady = blockingPublicationChecks.length === 0;
  const defaultCatalogCollapsed = !isDraftTable;

  const handleVisibleToRetailersChange = (nextValue: boolean) => {
    setVisibleToRetailers(nextValue);

    if (!nextValue && featuredToRetailers) {
      setFeaturedToRetailers(false);
      toast.success("Tabela principal desativada porque a tabela foi movida para rascunho");
    }
  };

  const handleFeaturedToRetailersChange = (nextValue: boolean) => {
    setFeaturedToRetailers(nextValue);

    if (nextValue && !visibleToRetailers) {
      setVisibleToRetailers(true);
      toast.success("Tabela marcada como principal e publicada automaticamente para lojistas");
    }
  };

  const expandIssuePath = (categoryIndex: number, deviceIndex?: number) => {
    const category = structuredPreviewCategories[categoryIndex];
    if (!category) return;

    setCollapsedCategories((current) => ({
      ...current,
      [getCategoryUiKey(categoryIndex)]: false,
    }));

    if (deviceIndex === undefined) return;

    const device = category.devices[deviceIndex];
    if (!device) return;

    setCollapsedDevices((current) => ({
      ...current,
      [getDeviceUiKey(categoryIndex, deviceIndex)]: false,
    }));
  };

  const revealFirstBlockingIssue = () => {
    if (!title.trim()) {
      titleInputRef.current?.focus();
      return;
    }

    if (structuredPreviewCategories.length === 0) {
      newCategoryInputRef.current?.focus();
      return;
    }

    for (let categoryIndex = 0; categoryIndex < structuredPreviewCategories.length; categoryIndex += 1) {
      const category = structuredPreviewCategories[categoryIndex];

      if (!category.name.trim()) {
        expandIssuePath(categoryIndex);
        setPendingCategoryFocusIndex(categoryIndex);
        return;
      }

      for (let deviceIndex = 0; deviceIndex < category.devices.length; deviceIndex += 1) {
        const device = category.devices[deviceIndex];

        if (!device.name.trim()) {
          expandIssuePath(categoryIndex, deviceIndex);
          setPendingStructureFocus({ categoryIndex, deviceIndex });
          return;
        }

        for (let serviceIndex = 0; serviceIndex < device.services.length; serviceIndex += 1) {
          const service = device.services[serviceIndex];
          const priceText = service.priceText.trim();

          if (!service.name.trim()) {
            expandIssuePath(categoryIndex, deviceIndex);
            setPendingServiceFocus({ categoryIndex, deviceIndex, serviceIndex });
            return;
          }

          if (!priceText || parsePriceValue(priceText) === null) {
            expandIssuePath(categoryIndex, deviceIndex);
            setPendingServicePriceFocus({ categoryIndex, deviceIndex, serviceIndex });
            return;
          }
        }
      }
    }
  };

  const handleSave = async () => {
    const nextRawText = rawText.trim() ? rawText : serializeRetailerPriceTablePreview(parsedPreview);

    if (!nextRawText.trim()) {
      toast.error("Monte a estrutura da tabela antes de salvar");
      return;
    }

    if (visibleToRetailers && blockingPublicationChecks.length > 0) {
      revealFirstBlockingIssue();
      toast.error(blockingPublicationChecks[0].label);
      return;
    }

    try {
      setSaving(true);
      const saved = await retailerPriceTablesService.save(tableSlug, {
        title,
        effectiveDate: effectiveDate || null,
        visibleToRetailers,
        featuredToRetailers,
        rawText: nextRawText,
        serviceTemplates,
      });
      if (saved) {
        setRecord(saved);
        setTableSlug(saved.slug);
        setIsDraftTable(false);
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
        setServiceTemplates(saved.service_templates || []);
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

  const handleQuickVisibilityToggle = async (
    table: RetailerPriceTableRecord,
    nextVisible: boolean
  ) => {
    try {
      setSaving(true);

      const saved = await retailerPriceTablesService.save(table.slug, {
        title: table.title,
        effectiveDate: table.effective_date || null,
        visibleToRetailers: nextVisible,
        featuredToRetailers: nextVisible ? table.featured_to_retailers : false,
        rawText: table.raw_text,
        serviceTemplates: table.service_templates || [],
      });

      if (!saved) {
        toast.error("Nao foi possivel atualizar a publicacao da tabela");
        return;
      }

      setAllTables((current) =>
        current.map((entry) => (entry.slug === saved.slug ? saved : entry))
      );

      if (tableSlug === saved.slug) {
        setRecord(saved);
        setVisibleToRetailers(saved.visible_to_retailers);
        setFeaturedToRetailers(saved.featured_to_retailers);
        setTitle(saved.title);
        setEffectiveDate(saved.effective_date || "");
        setRawText(saved.raw_text || "");
        setServiceTemplates(saved.service_templates || []);
      }

      toast.success(
        nextVisible
          ? "Tabela publicada para lojistas"
          : "Tabela movida para rascunho e removida da area do lojista"
      );
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Erro ao atualizar publicacao da tabela");
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
      event.target.value = "";
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
    if (rawText.trim()) {
      const confirmed = window.confirm(
        "Deseja limpar o texto bruto da tabela? A estrutura atual sera mantida apenas se voce nao salvar em seguida."
      );

      if (!confirmed) {
        return;
      }
    }

    setRawText("");
    setPreviewQuery("");
    toast.success("Texto da tabela limpo");
  };

  const handleCopyRawText = async () => {
    if (!rawText.trim()) {
      toast.error("Nao ha texto para copiar");
      return;
    }

    try {
      await navigator.clipboard.writeText(rawText);
      toast.success("Texto copiado");
    } catch {
      toast.error("Nao foi possivel copiar o texto");
    }
  };

  const handleResetForm = () => {
    setTitle(record?.title || "Tabela dos Vidros");
    setEffectiveDate(record?.effective_date || "");
    setVisibleToRetailers(record?.visible_to_retailers ?? true);
    setFeaturedToRetailers(record?.featured_to_retailers ?? false);
    setRawText(record?.raw_text || "");
    setServiceTemplates(record?.service_templates || []);
    resetTransientEditorState();
    toast.success("Campos restaurados para a última versão salva");
  };

  const handleNewTableTitleChange = (value: string) => {
    setNewTableTitle(value);

    if (!newSlugTouched) {
      setNewSlug(normalizeSlug(value));
    }
  };

  const handleNewTableSlugChange = (value: string) => {
    setNewSlugTouched(true);
    setNewSlug(value);
  };

  const handleCreateNewTable = () => {
    const draftTitle = normalizeWhitespace(newTableTitle) || normalizeWhitespace(newSlug);
    const normalizedSlug = normalizeSlug(newSlug || newTableTitle);
    const templatePreview = parseRetailerPriceTablePreview(SAMPLE_TEMPLATE);
    const seededRawText =
      newTableMode === "template"
        ? serializeRetailerPriceTablePreview({
            ...templatePreview,
            title: draftTitle || "Nova Tabela",
            effectiveDate: null,
          })
        : "";

    if (!normalizedSlug) {
      toast.error("Informe um nome ou slug valido para a nova tabela");
      return;
    }

    if (allTables.some((table) => table.slug === normalizedSlug)) {
      toast.error("Ja existe uma tabela com esse slug");
      return;
    }

    setIsDraftTable(true);
    setTableSlug(normalizedSlug);
    setRecord(null);
    setTitle(draftTitle || normalizedSlug);
    setEffectiveDate("");
    setVisibleToRetailers(false);
    setFeaturedToRetailers(false);
    setRawText(seededRawText);
    setServiceTemplates([]);
    resetTransientEditorState();
    setNewTableTitle("");
    setNewSlug("");
    setNewSlugTouched(false);
    setNewTableMode("blank");
    window.requestAnimationFrame(() => {
      if (seededRawText) {
        titleInputRef.current?.focus();
      } else {
        newCategoryInputRef.current?.focus();
      }
    });
    toast.success(
      seededRawText
        ? "Nova tabela criada com modelo-base em rascunho. Ajuste a estrutura e salve quando quiser."
        : "Nova tabela criada como rascunho. Monte a categoria e salve quando quiser."
    );
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
        serviceTemplates: sourceTable.service_templates || [],
      });

      if (!duplicated) {
        toast.error("Nao foi possivel duplicar a tabela");
        return;
      }

      const tables = await retailerPriceTablesService.listAdmin();
      setAllTables(tables);
      setIsDraftTable(false);
      setTableSlug(duplicated.slug);
      setRecord(duplicated);
      setTitle(duplicated.title);
      setEffectiveDate(duplicated.effective_date || "");
      setVisibleToRetailers(duplicated.visible_to_retailers);
      setFeaturedToRetailers(duplicated.featured_to_retailers);
      setRawText(duplicated.raw_text || "");
      setServiceTemplates(duplicated.service_templates || []);
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
      setIsDraftTable(false);
      const nextSlug = remaining[0]?.slug || DEFAULT_SLUG;
      setTableSlug(nextSlug);
      if (remaining.length === 0) {
        setRecord(null);
        setTitle("Tabela dos Vidros");
        setEffectiveDate("");
        setVisibleToRetailers(true);
        setFeaturedToRetailers(false);
        setRawText("");
        setServiceTemplates([]);
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
    const updated = updater(parsedPreview);
    setRawText(serializeRetailerPriceTablePreview(updated));
  };

  const replaceStructuredPreviewCategories = (
    updater: (categories: ReturnType<typeof buildStructuredCategories>) => ReturnType<typeof buildStructuredCategories>
  ) => {
    replacePreviewTable((table) => ({
      ...table,
      categories: structuredCategoriesToFlatCategories(
        updater(buildStructuredCategories(table.categories || []))
      ),
    }));
  };

  const handleNormalizeText = () => {
    setRawText(serializeRetailerPriceTablePreview(parsedPreview));
    toast.success("Texto reorganizado com base na estrutura da tabela");
  };

  const handleAddIntroLine = () => {
    const nextIndex = parsedPreview.intro.length;

    replacePreviewTable((table) => ({
      ...table,
      intro: [...(table.intro || []), ""],
    }));
    setPendingIntroFocusIndex(nextIndex);
    toast.success("Observacao adicionada");
  };

  const handleUpdateIntroLine = (lineIndex: number, value: string) => {
    replacePreviewTable((table) => ({
      ...table,
      intro: table.intro.map((line, index) => (index === lineIndex ? value : line)),
    }));
  };

  const handleMoveIntroLine = (lineIndex: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? lineIndex - 1 : lineIndex + 1;
    if (targetIndex < 0 || targetIndex >= parsedPreview.intro.length) return;

    replacePreviewTable((table) => {
      const nextIntro = [...table.intro];
      [nextIntro[lineIndex], nextIntro[targetIndex]] = [nextIntro[targetIndex], nextIntro[lineIndex]];

      return {
        ...table,
        intro: nextIntro,
      };
    });
    setPendingIntroFocusIndex(targetIndex);
  };

  const handleRemoveIntroLine = (lineIndex: number) => {
    replacePreviewTable((table) => ({
      ...table,
      intro: table.intro.filter((_, index) => index !== lineIndex),
    }));
    toast.success("Observacao removida");
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error("Informe o nome da categoria");
      return;
    }

    const trimmedCategoryName = newCategoryName.trim();
    const existingCategory = structuredPreviewCategories.find(
      (cat) => cat.name.toLowerCase() === trimmedCategoryName.toLowerCase()
    );

    if (existingCategory) {
      toast.error("Já existe uma categoria com este nome");
      return;
    }

    const createdCategoryIndex = structuredPreviewCategories.length;

    replaceStructuredPreviewCategories((categories) => {
      return [
        ...categories,
        {
          name: trimmedCategoryName,
          devices: [
            {
              name: "Aparelho exemplo",
              services: [{ name: "Preco base", priceText: "", priceValue: null }],
            },
          ],
        },
      ];
    });

    setCollapsedCategories((current) => ({
      ...current,
      [getCategoryUiKey(createdCategoryIndex)]: false,
    }));
    setCollapsedDevices((current) => ({
      ...current,
      [getDeviceUiKey(createdCategoryIndex, 0)]: false,
    }));
    setPendingStructureFocus({ categoryIndex: createdCategoryIndex, deviceIndex: 0 });
    setNewCategoryName("");

    toast.success("Categoria adicionada com aparelho exemplo");
  };

  const toggleCategoryCollapsed = (categoryKey: string) => {
    setCollapsedCategories((current) => ({
      ...current,
      [categoryKey]: !current[categoryKey],
    }));
  };

  const toggleDeviceCollapsed = (deviceKey: string) => {
    setCollapsedDevices((current) => ({
      ...current,
      [deviceKey]: !current[deviceKey],
    }));
  };

  const handleDeviceBulkModeChange = (deviceKey: string, mode: "percent" | "set") => {
    setDeviceBulkMode((current) => ({
      ...current,
      [deviceKey]: mode,
    }));
  };

  const handleDeviceBulkValueChange = (deviceKey: string, value: string) => {
    setDeviceBulkValue((current) => ({
      ...current,
      [deviceKey]: value,
    }));
  };

  const handleDeviceServiceSourceChange = (deviceKey: string, value: string) => {
    setDeviceServiceSource((current) => ({
      ...current,
      [deviceKey]: value,
    }));
  };

  const handleEmptyCategoryDraftChange = (
    categoryIndex: number,
    field: "deviceName" | "serviceName" | "priceText",
    value: string
  ) => {
    setEmptyCategoryDrafts((current) => ({
      ...current,
      [categoryIndex]: {
        deviceName: current[categoryIndex]?.deviceName || "",
        serviceName: current[categoryIndex]?.serviceName || "",
        priceText: current[categoryIndex]?.priceText || "",
        [field]: value,
      },
    }));
  };

  const handleEmptyCategoryDraftKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    categoryIndex: number
  ) => {
    if (event.key !== "Enter") return;

    event.preventDefault();
    handleCreateFirstDevice(categoryIndex);
  };

  const handleEmptyCategoryPriceBlur = (categoryIndex: number) => {
    const currentPriceText = emptyCategoryDrafts[categoryIndex]?.priceText?.trim() || "";
    if (!currentPriceText) return;

    const parsedValue = parsePriceValue(currentPriceText);
    if (parsedValue === null) return;

    setEmptyCategoryDrafts((current) => ({
      ...current,
      [categoryIndex]: {
        deviceName: current[categoryIndex]?.deviceName || "",
        serviceName: current[categoryIndex]?.serviceName || "",
        priceText: formatPriceText(parsedValue),
      },
    }));
  };

  const handleEmptyCategoryServiceBlur = (categoryIndex: number) => {
    const currentDraft = emptyCategoryDrafts[categoryIndex];
    if (!currentDraft) return;

    if (currentDraft.serviceName.trim()) return;

    setEmptyCategoryDrafts((current) => ({
      ...current,
      [categoryIndex]: {
        deviceName: current[categoryIndex]?.deviceName || "",
        serviceName: "Preco base",
        priceText: current[categoryIndex]?.priceText || "",
      },
    }));
  };

  const handleDeviceTemplateSelectionChange = (deviceKey: string, value: string) => {
    setDeviceTemplateSelection((current) => ({
      ...current,
      [deviceKey]: value,
    }));
  };

  const handleClearEmptyCategoryDraft = (categoryIndex: number) => {
    setEmptyCategoryDrafts((current) => {
      const next = { ...current };
      delete next[categoryIndex];
      return next;
    });
    emptyCategoryDeviceRefs.current[categoryIndex]?.focus();
  };

  const handleRemoveCategory = (categoryIndex: number) => {
    const categoryName = structuredPreviewCategories[categoryIndex]?.name || "categoria";
    const confirmed = window.confirm(
      `Deseja remover a categoria "${categoryName}" da tabela em edicao?`
    );

    if (!confirmed) {
      return;
    }

    replaceStructuredPreviewCategories((categories) =>
      categories.filter((_, index) => index !== categoryIndex)
    );
    setEmptyCategoryDrafts((current) =>
      remapIndexedRecord(current, (index) => {
        if (index === categoryIndex) return null;
        return index > categoryIndex ? index - 1 : index;
      })
    );
    toast.success("Categoria removida");
  };

  const handleRenameCategory = (categoryIndex: number, nextName: string) => {
    replaceStructuredPreviewCategories((categories) =>
      categories.map((category, index) =>
        index === categoryIndex
          ? {
              ...category,
              name: nextName,
            }
          : category
      )
    );
  };

  const handleMoveCategory = (categoryIndex: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? categoryIndex - 1 : categoryIndex + 1;
    if (targetIndex < 0 || targetIndex >= structuredPreviewCategories.length) return;

    replaceStructuredPreviewCategories((categories) => {
      const nextCategories = [...categories];
      [nextCategories[categoryIndex], nextCategories[targetIndex]] = [nextCategories[targetIndex], nextCategories[categoryIndex]];
      return nextCategories;
    });
    setEmptyCategoryDrafts((current) =>
      remapIndexedRecord(current, (index) => {
        if (index === categoryIndex) return targetIndex;
        if (index === targetIndex) return categoryIndex;
        return index;
      })
    );
  };

  const handleDuplicateCategory = (categoryIndex: number) => {
    const sourceDraft = emptyCategoryDrafts[categoryIndex];

    replaceStructuredPreviewCategories((categories) => {
      const sourceCategory = categories[categoryIndex];
      if (!sourceCategory) return categories;

      const duplicatedCategory = {
        ...sourceCategory,
        name: `${sourceCategory.name} - Copia`,
        devices: sourceCategory.devices.map((device) => ({
          ...device,
          services: device.services.map((service) => ({ ...service })),
        })),
      };

      return [
        ...categories.slice(0, categoryIndex + 1),
        duplicatedCategory,
        ...categories.slice(categoryIndex + 1),
      ];
    });
    setEmptyCategoryDrafts((current) => {
      const shifted = remapIndexedRecord(current, (index) =>
        index > categoryIndex ? index + 1 : index
      );

      if (!sourceDraft) return shifted;

      return {
        ...shifted,
        [categoryIndex + 1]: {
          deviceName: sourceDraft.deviceName,
          serviceName: sourceDraft.serviceName,
          priceText: sourceDraft.priceText,
        },
      };
    });

    toast.success("Categoria duplicada");
  };

  const handleAddDevice = (categoryIndex: number) => {
    const nextDeviceIndex = structuredPreviewCategories[categoryIndex]?.devices.length || 0;
    const nextDeviceName = `Novo aparelho ${nextDeviceIndex + 1}`;

    replaceStructuredPreviewCategories((categories) =>
      categories.map((category, index) =>
        index === categoryIndex
          ? {
              ...category,
              devices: [
                ...category.devices,
                {
                  name: nextDeviceName,
                  services: [{ name: "Preco base", priceText: "", priceValue: null }],
                },
              ],
            }
          : category
      )
    );
    setCollapsedCategories((current) => ({
      ...current,
      [getCategoryUiKey(categoryIndex)]: false,
    }));
    setCollapsedDevices((current) => ({
      ...current,
      [getDeviceUiKey(categoryIndex, nextDeviceIndex)]: false,
    }));
    setPendingStructureFocus({
      categoryIndex,
      deviceIndex: nextDeviceIndex,
    });
    toast.success("Aparelho adicionado");
  };

  const handleCreateFirstDevice = (categoryIndex: number) => {
    const draft = emptyCategoryDrafts[categoryIndex];
    const deviceName = draft?.deviceName?.trim() || "";
    const serviceName = draft?.serviceName?.trim() || "Preco base";
    const priceText = draft?.priceText?.trim() || "";

    if (!deviceName) {
      toast.error("Informe o nome do aparelho para iniciar a categoria");
      emptyCategoryDeviceRefs.current[categoryIndex]?.focus();
      return;
    }

    replaceStructuredPreviewCategories((categories) =>
      categories.map((category, index) =>
        index === categoryIndex
          ? {
              ...category,
              devices: [
                {
                  name: deviceName,
                  services: [{ name: serviceName, priceText, priceValue: parsePriceValue(priceText) }],
                },
              ],
            }
          : category
      )
    );

    setCollapsedCategories((current) => ({
      ...current,
      [getCategoryUiKey(categoryIndex)]: false,
    }));
    setCollapsedDevices((current) => ({
      ...current,
      [getDeviceUiKey(categoryIndex, 0)]: false,
    }));
    setEmptyCategoryDrafts((current) => {
      const next = { ...current };
      delete next[categoryIndex];
      return next;
    });

    if (!priceText) {
      setPendingServicePriceFocus({
        categoryIndex,
        deviceIndex: 0,
        serviceIndex: 0,
      });
    } else {
      setPendingStructureFocus({
        categoryIndex,
        deviceIndex: 0,
      });
    }

    toast.success("Primeiro aparelho criado na categoria");
  };

  const handleUpdateDeviceName = (
    categoryIndex: number,
    deviceIndex: number,
    value: string
  ) => {
    replaceStructuredPreviewCategories((categories) =>
      categories.map((category, currentCategoryIndex) =>
        currentCategoryIndex === categoryIndex
          ? {
              ...category,
              devices: category.devices.map((device, currentDeviceIndex) =>
                currentDeviceIndex === deviceIndex
                  ? {
                      ...device,
                      name: value,
                    }
                  : device
              ),
            }
          : category
      )
    );
  };

  const handleDuplicateDevice = (categoryIndex: number, deviceIndex: number) => {
    replaceStructuredPreviewCategories((categories) =>
      categories.map((category, currentCategoryIndex) => {
        if (currentCategoryIndex !== categoryIndex) return category;
        const sourceDevice = category.devices[deviceIndex];
        if (!sourceDevice) return category;

        return {
          ...category,
          devices: [
            ...category.devices.slice(0, deviceIndex + 1),
            {
              ...sourceDevice,
              name: `${sourceDevice.name} - Copia`,
              services: sourceDevice.services.map((service) => ({ ...service })),
            },
            ...category.devices.slice(deviceIndex + 1),
          ],
        };
      })
    );
    toast.success("Aparelho duplicado");
  };

  const handleMoveDevice = (
    categoryIndex: number,
    deviceIndex: number,
    direction: "up" | "down"
  ) => {
    replaceStructuredPreviewCategories((categories) =>
      categories.map((category, currentCategoryIndex) => {
        if (currentCategoryIndex !== categoryIndex) return category;
        const devices = [...category.devices];
        const targetIndex = direction === "up" ? deviceIndex - 1 : deviceIndex + 1;
        if (targetIndex < 0 || targetIndex >= devices.length) return category;
        [devices[deviceIndex], devices[targetIndex]] = [devices[targetIndex], devices[deviceIndex]];
        return { ...category, devices };
      })
    );
  };

  const handleRemoveDevice = (categoryIndex: number, deviceIndex: number) => {
    const deviceName =
      structuredPreviewCategories[categoryIndex]?.devices[deviceIndex]?.name || "aparelho";
    const confirmed = window.confirm(
      `Deseja remover o aparelho "${deviceName}" da tabela em edicao?`
    );

    if (!confirmed) {
      return;
    }

    replaceStructuredPreviewCategories((categories) =>
      categories.map((category, currentCategoryIndex) =>
        currentCategoryIndex === categoryIndex
          ? {
              ...category,
              devices: category.devices.filter((_, currentDeviceIndex) => currentDeviceIndex !== deviceIndex),
            }
          : category
      )
    );
    toast.success("Aparelho removido");
  };

  const handleAddService = (categoryIndex: number, deviceIndex: number) => {
    const nextServiceIndex =
      structuredPreviewCategories[categoryIndex]?.devices[deviceIndex]?.services.length || 0;

    replaceStructuredPreviewCategories((categories) =>
      categories.map((category, currentCategoryIndex) =>
        currentCategoryIndex === categoryIndex
          ? {
              ...category,
              devices: category.devices.map((device, currentDeviceIndex) =>
                currentDeviceIndex === deviceIndex
                  ? {
                      ...device,
                      services: [
                        ...device.services,
                        {
                          name: `Novo servico ${device.services.length + 1}`,
                          priceText: "",
                          priceValue: null,
                        },
                      ],
                    }
                  : device
              ),
            }
          : category
      )
    );
    setPendingServiceFocus({
      categoryIndex,
      deviceIndex,
      serviceIndex: nextServiceIndex,
    });
    toast.success("Servico adicionado");
  };

  const handleAddServicePreset = (
    categoryIndex: number,
    deviceIndex: number,
    serviceName: string
  ) => {
    const existingServiceIndex = structuredPreviewCategories[categoryIndex]?.devices[
      deviceIndex
    ]?.services.findIndex((service) => service.name.toLowerCase() === serviceName.toLowerCase());

    if (typeof existingServiceIndex === "number" && existingServiceIndex >= 0) {
      setPendingServiceFocus({
        categoryIndex,
        deviceIndex,
        serviceIndex: existingServiceIndex,
      });
      toast.error(`O aparelho ja possui "${serviceName}"`);
      return;
    }

    const nextServiceIndex =
      structuredPreviewCategories[categoryIndex]?.devices[deviceIndex]?.services.length || 0;

    replaceStructuredPreviewCategories((categories) =>
      categories.map((category, currentCategoryIndex) =>
        currentCategoryIndex === categoryIndex
          ? {
              ...category,
              devices: category.devices.map((device, currentDeviceIndex) => {
                if (currentDeviceIndex !== deviceIndex) return device;
                return {
                  ...device,
                  services: [
                    ...device.services,
                    {
                      name: serviceName,
                      priceText: "",
                      priceValue: null,
                    },
                  ],
                };
              }),
            }
          : category
      )
    );
    setPendingServiceFocus({
      categoryIndex,
      deviceIndex,
      serviceIndex: nextServiceIndex,
    });
    toast.success(`Servico "${serviceName}" adicionado`);
  };

  const handleDuplicateService = (
    categoryIndex: number,
    deviceIndex: number,
    serviceIndex: number
  ) => {
    replaceStructuredPreviewCategories((categories) =>
      categories.map((category, currentCategoryIndex) => {
        if (currentCategoryIndex !== categoryIndex) return category;

        return {
          ...category,
          devices: category.devices.map((device, currentDeviceIndex) => {
            if (currentDeviceIndex !== deviceIndex) return device;

            const sourceService = device.services[serviceIndex];
            if (!sourceService) return device;

            return {
              ...device,
              services: [
                ...device.services.slice(0, serviceIndex + 1),
                {
                  ...sourceService,
                  name: `${sourceService.name} - Copia`,
                },
                ...device.services.slice(serviceIndex + 1),
              ],
            };
          }),
        };
      })
    );
    setPendingServiceFocus({
      categoryIndex,
      deviceIndex,
      serviceIndex: serviceIndex + 1,
    });
    toast.success("Servico duplicado");
  };

  const handleAddServicePack = (categoryIndex: number, deviceIndex: number) => {
    let addedCount = 0;

    replaceStructuredPreviewCategories((categories) =>
      categories.map((category, currentCategoryIndex) =>
        currentCategoryIndex === categoryIndex
          ? {
              ...category,
              devices: category.devices.map((device, currentDeviceIndex) => {
                if (currentDeviceIndex !== deviceIndex) return device;

                const existingNames = new Set(
                  device.services.map((service) => service.name.trim().toLowerCase())
                );
                const nextServices = [...device.services];

                SERVICE_PRESETS.forEach((preset) => {
                  if (existingNames.has(preset.toLowerCase())) return;
                  nextServices.push({
                    name: preset,
                    priceText: "",
                    priceValue: null,
                  });
                  existingNames.add(preset.toLowerCase());
                  addedCount += 1;
                });

                return {
                  ...device,
                  services: nextServices,
                };
              }),
            }
          : category
      )
    );

    if (addedCount === 0) {
      toast.error("Esse aparelho ja possui todos os servicos-padrao");
      return;
    }

    toast.success(`${addedCount} servico(s)-padrao adicionados`);
  };

  const handleUpdateService = (
    categoryIndex: number,
    deviceIndex: number,
    serviceIndex: number,
    field: "name" | "priceText",
    value: string
  ) => {
    replaceStructuredPreviewCategories((categories) =>
      categories.map((category, currentCategoryIndex) =>
        currentCategoryIndex === categoryIndex
          ? {
              ...category,
              devices: category.devices.map((device, currentDeviceIndex) =>
                currentDeviceIndex === deviceIndex
                  ? {
                      ...device,
                      services: device.services.map((service, currentServiceIndex) =>
                        currentServiceIndex === serviceIndex
                          ? {
                              ...service,
                              [field]: value,
                            }
                          : service
                      ),
                    }
                  : device
              ),
            }
          : category
      )
    );
  };

  const handleServicePriceBlur = (
    categoryIndex: number,
    deviceIndex: number,
    serviceIndex: number
  ) => {
    const currentPriceText =
      structuredPreviewCategories[categoryIndex]?.devices[deviceIndex]?.services[
        serviceIndex
      ]?.priceText?.trim() || "";

    if (!currentPriceText) return;

    const parsedValue = parsePriceValue(currentPriceText);
    if (parsedValue === null) return;

    handleUpdateService(
      categoryIndex,
      deviceIndex,
      serviceIndex,
      "priceText",
      formatPriceText(parsedValue)
    );
  };

  const handleMoveService = (
    categoryIndex: number,
    deviceIndex: number,
    serviceIndex: number,
    direction: "up" | "down"
  ) => {
    replaceStructuredPreviewCategories((categories) =>
      categories.map((category, currentCategoryIndex) => {
        if (currentCategoryIndex !== categoryIndex) return category;
        return {
          ...category,
          devices: category.devices.map((device, currentDeviceIndex) => {
            if (currentDeviceIndex !== deviceIndex) return device;
            const services = [...device.services];
            const targetIndex = direction === "up" ? serviceIndex - 1 : serviceIndex + 1;
            if (targetIndex < 0 || targetIndex >= services.length) return device;
            [services[serviceIndex], services[targetIndex]] = [services[targetIndex], services[serviceIndex]];
            return { ...device, services };
          }),
        };
      })
    );
  };

  const handleRemoveService = (
    categoryIndex: number,
    deviceIndex: number,
    serviceIndex: number
  ) => {
    const serviceName =
      structuredPreviewCategories[categoryIndex]?.devices[deviceIndex]?.services[serviceIndex]?.name || "servico";
    const confirmed = window.confirm(
      `Deseja remover o servico "${serviceName}" da tabela em edicao?`
    );

    if (!confirmed) {
      return;
    }

    replaceStructuredPreviewCategories((categories) =>
      categories.map((category, currentCategoryIndex) =>
        currentCategoryIndex === categoryIndex
          ? {
              ...category,
              devices: category.devices.map((device, currentDeviceIndex) =>
                currentDeviceIndex === deviceIndex
                  ? {
                      ...device,
                      services: device.services.filter(
                        (_, currentServiceIndex) => currentServiceIndex !== serviceIndex
                      ),
                    }
                  : device
              ),
            }
          : category
      )
    );
    toast.success("Servico removido");
  };

  const handleApplyBulkPriceToDevice = (categoryIndex: number, deviceIndex: number, deviceKey: string) => {
    const rawValue = deviceBulkValue[deviceKey]?.trim() || "";
    const mode = deviceBulkMode[deviceKey] || "percent";
    const numericValue = Number(rawValue.replace(",", "."));

    if (!rawValue || !Number.isFinite(numericValue)) {
      toast.error("Informe um valor valido para aplicar em lote");
      return;
    }

    let changedCount = 0;

    replaceStructuredPreviewCategories((categories) =>
      categories.map((category, currentCategoryIndex) => {
        if (currentCategoryIndex !== categoryIndex) return category;

        return {
          ...category,
          devices: category.devices.map((device, currentDeviceIndex) => {
            if (currentDeviceIndex !== deviceIndex) return device;

            return {
              ...device,
              services: device.services.map((service) => {
                const currentPrice = parsePriceValue(service.priceText);

                if (mode === "percent") {
                  if (currentPrice === null) return service;
                  const adjustedPrice = Math.max(currentPrice * (1 + numericValue / 100), 0);
                  changedCount += 1;
                  return {
                    ...service,
                    priceText: formatPriceText(adjustedPrice),
                  };
                }

                changedCount += 1;
                return {
                  ...service,
                  priceText: formatPriceText(Math.max(numericValue, 0)),
                };
              }),
            };
          }),
        };
      })
    );

    if (changedCount === 0) {
      toast.error(
        mode === "percent"
          ? "Nenhum preco numerico encontrado para aplicar percentual"
          : "Nenhum servico encontrado para aplicar valor final"
      );
      return;
    }

    toast.success(
      mode === "percent"
        ? `Percentual aplicado em ${changedCount} servico(s)`
        : `Valor final aplicado em ${changedCount} servico(s)`
    );
  };

  const handleCopyServiceStructureToDevice = (
    categoryIndex: number,
    deviceIndex: number,
    deviceKey: string
  ) => {
    const sourceIndex = Number(deviceServiceSource[deviceKey]);

    if (!Number.isInteger(sourceIndex)) {
      toast.error("Selecione um aparelho de origem");
      return;
    }

    let copiedCount = 0;

    replaceStructuredPreviewCategories((categories) =>
      categories.map((category, currentCategoryIndex) => {
        if (currentCategoryIndex !== categoryIndex) return category;

        const sourceDevice = category.devices[sourceIndex];
        const targetDevice = category.devices[deviceIndex];

        if (!sourceDevice || !targetDevice || sourceIndex === deviceIndex) {
          return category;
        }

        copiedCount = sourceDevice.services.length;

        return {
          ...category,
          devices: category.devices.map((device, currentDeviceIndex) =>
            currentDeviceIndex === deviceIndex
              ? {
                  ...device,
                  services: sourceDevice.services.map((service) => ({
                    ...service,
                    priceText: "",
                    priceValue: null,
                  })),
                }
              : device
          ),
        };
      })
    );

    if (copiedCount === 0) {
      toast.error("O aparelho de origem nao possui servicos para copiar");
      return;
    }

    toast.success(`Estrutura de ${copiedCount} servico(s) copiada para o aparelho`);
  };

  const handleCreateTemplateFromDevice = (
    categoryIndex: number,
    deviceIndex: number,
    fallbackName: string
  ) => {
    const sourceDevice = structuredPreviewCategories[categoryIndex]?.devices[deviceIndex];
    if (!sourceDevice || sourceDevice.services.length === 0) {
      toast.error("Esse aparelho nao possui servicos para virar modelo");
      return;
    }

    const serviceNames = Array.from(
      new Set(
        sourceDevice.services
          .map((service) => normalizeWhitespace(service.name))
          .filter((serviceName) => serviceName.length > 0)
      )
    );

    if (serviceNames.length === 0) {
      toast.error("Esse aparelho nao possui servicos validos para virar modelo");
      return;
    }

    const templateName = `${fallbackName} - Modelo`;

    setServiceTemplates((current) => {
      const nextId = `${Date.now()}-${categoryIndex}-${deviceIndex}`;
      const existingIndex = current.findIndex((template) => template.name === templateName);

      if (existingIndex >= 0) {
        const next = [...current];
        next[existingIndex] = {
          ...next[existingIndex],
          serviceNames,
        };
        return next;
      }

      return [
        {
          id: nextId,
          name: templateName,
          serviceNames,
        },
        ...current,
      ];
    });

    toast.success("Modelo de servicos salvo no editor");
  };

  const handleApplyTemplateToDevice = (
    categoryIndex: number,
    deviceIndex: number,
    deviceKey: string
  ) => {
    const templateId = deviceTemplateSelection[deviceKey];
    const template = serviceTemplates.find((item) => item.id === templateId);

    if (!template) {
      toast.error("Selecione um modelo de servicos");
      return;
    }

    replaceStructuredPreviewCategories((categories) =>
      categories.map((category, currentCategoryIndex) => {
        if (currentCategoryIndex !== categoryIndex) return category;

        return {
          ...category,
          devices: category.devices.map((device, currentDeviceIndex) =>
            currentDeviceIndex === deviceIndex
              ? {
                  ...device,
                  services: template.serviceNames.map((serviceName) => ({
                    name: serviceName,
                    priceText: "",
                    priceValue: null,
                  })),
                }
              : device
          ),
        };
      })
    );

    toast.success(`Modelo "${template.name}" aplicado ao aparelho`);
  };

  const handleStartTemplateRename = (template: RetailerPriceTableServiceTemplate) => {
    setEditingTemplateId(template.id);
    setEditingTemplateName(template.name);
  };

  const handleSaveTemplateRename = () => {
    const normalizedName = normalizeWhitespace(editingTemplateName);

    if (!editingTemplateId) return;
    if (!normalizedName) {
      toast.error("Informe um nome valido para o modelo");
      return;
    }

    setServiceTemplates((current) =>
      current.map((template) =>
        template.id === editingTemplateId
          ? {
              ...template,
              name: normalizedName,
            }
          : template
      )
    );

    setEditingTemplateId(null);
    setEditingTemplateName("");
    toast.success("Modelo renomeado");
  };

  const handleDeleteTemplate = (templateId: string) => {
    const template = serviceTemplates.find((item) => item.id === templateId);
    if (!template) return;

    const confirmed = window.confirm(`Deseja remover o modelo "${template.name}" da sessao atual?`);
    if (!confirmed) return;

    setServiceTemplates((current) => current.filter((item) => item.id !== templateId));
    setDeviceTemplateSelection((current) =>
      Object.fromEntries(Object.entries(current).map(([key, value]) => [key, value === templateId ? "" : value]))
    );

    if (editingTemplateId === templateId) {
      setEditingTemplateId(null);
      setEditingTemplateName("");
    }

    toast.success("Modelo removido");
  };

  const handleSetAllCollapsed = (collapsed: boolean) => {
    const nextCategories: Record<string, boolean> = {};
    const nextDevices: Record<string, boolean> = {};

    structuredPreviewCategories.forEach((category, categoryIndex) => {
      const categoryKey = getCategoryUiKey(categoryIndex);
      nextCategories[categoryKey] = collapsed;

      category.devices.forEach((device, deviceIndex) => {
        const deviceKey = getDeviceUiKey(categoryIndex, deviceIndex);
        nextDevices[deviceKey] = collapsed;
      });
    });

    setCollapsedCategories(nextCategories);
    setCollapsedDevices(nextDevices);
    toast.success(collapsed ? "Composição recolhida" : "Composição expandida");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-[32px] border border-slate-800/40 bg-[linear-gradient(135deg,rgba(8,47,73,1)_0%,rgba(15,23,42,1)_55%,rgba(247,249,252,1)_100%)] p-6 text-white shadow-[0_22px_65px_rgba(15,23,42,0.18)] sm:p-8">
          <div className="absolute -right-10 top-0 h-40 w-40 rounded-full bg-sky-400/15 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-44 w-44 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="relative z-10 max-w-4xl space-y-4">
            <Badge className="border-white/15 bg-white/10 text-white hover:bg-white/10">
              Estudio de Tabelas
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Composição Estruturada</h1>
            <p className="max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
              O cadastro parte da estrutura comercial: tabela, observações, categorias, aparelhos e serviços. O texto bruto vira apoio, não centro do fluxo.
            </p>
          </div>
        </div>

        <Tabs defaultValue="editor" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="editor">Editor de Tabela</TabsTrigger>
            <TabsTrigger value="analytics">Analytics de Preços</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
              <aside className="space-y-6">
                <Card className="rounded-[28px] border-border/70 shadow-[0_14px_38px_rgba(15,23,42,0.06)]">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <CardTitle>Biblioteca</CardTitle>
                        <CardDescription>Escolha, crie, duplique e ordene as tabelas disponíveis.</CardDescription>
                      </div>
                      <Badge className="bg-slate-900 text-white hover:bg-slate-900">
                        {filteredTables.length} ativas na lista
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-[22px] border border-sky-100 bg-[linear-gradient(135deg,rgba(239,246,255,1),rgba(255,255,255,1))] p-4 shadow-sm">
                      <p className="text-xs uppercase tracking-[0.18em] text-sky-700">Nova entrada</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Abra uma nova tabela com nome comercial, slug sugerido e publicação como rascunho para montar a estrutura com calma.
                      </p>
                      <div className="mt-4 grid gap-3">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant={newTableMode === "blank" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setNewTableMode("blank")}
                          >
                            Em branco
                          </Button>
                          <Button
                            type="button"
                            variant={newTableMode === "template" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setNewTableMode("template")}
                          >
                            Com modelo-base
                          </Button>
                          <Badge variant="outline">
                            {newTableMode === "template"
                              ? "Abre com categorias e serviços iniciais"
                              : "Abre pronta para montar do zero"}
                          </Badge>
                        </div>
                        <Input
                          value={newTableTitle}
                          onChange={(e) => handleNewTableTitleChange(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleCreateNewTable();
                            }
                          }}
                          placeholder="Nome da tabela"
                          className="bg-white"
                        />
                        <Input
                          value={newSlug}
                          onChange={(e) => handleNewTableSlugChange(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleCreateNewTable();
                            }
                          }}
                          placeholder="slug-da-tabela"
                          className="bg-white"
                        />
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">
                            {newTableDraftTitle ? `Nome: ${newTableDraftTitle}` : "Nome pendente"}
                          </Badge>
                          <Badge
                            className={
                              !normalizedNewTableSlug
                                ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                                : newTableSlugConflict
                                  ? "bg-rose-100 text-rose-700 hover:bg-rose-100"
                                  : "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                            }
                          >
                            {!normalizedNewTableSlug
                              ? "Slug pendente"
                              : newTableSlugConflict
                                ? `Slug em uso: ${normalizedNewTableSlug}`
                                : `Slug pronto: ${normalizedNewTableSlug}`}
                          </Badge>
                          <Badge variant="outline">Nova tabela abre em rascunho</Badge>
                          <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100">
                            {newTableMode === "template" ? "Base: modelo inicial" : "Base: vazia"}
                          </Badge>
                        </div>
                        {suggestedNewTableSlug && !newSlugTouched && suggestedNewTableSlug !== newSlug ? (
                          <p className="text-xs text-muted-foreground">
                            Slug sugerido: <span className="font-medium text-foreground">{suggestedNewTableSlug}</span>
                          </p>
                        ) : null}
                        <Button type="button" onClick={handleCreateNewTable} disabled={!normalizedNewTableSlug || newTableSlugConflict}>
                          <Plus className="mr-2 h-4 w-4" />
                          Criar nova tabela
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-[22px] border border-border/70 bg-muted/10 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Filtrar biblioteca</p>
                      <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_140px] xl:grid-cols-1">
                      <Input
                        value={tableSearch}
                        onChange={(e) => setTableSearch(e.target.value)}
                        placeholder="Buscar tabela..."
                      />
                      <select
                        value={tableFilter}
                        onChange={(e) => setTableFilter(e.target.value as "all" | "visible" | "hidden" | "featured")}
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="all">Todas</option>
                        <option value="visible">Visíveis</option>
                        <option value="hidden">Ocultas</option>
                        <option value="featured">Destaque</option>
                      </select>
                    </div>
                    </div>

                    <div className="space-y-3">
                      {filteredTables.map((table) => {
                        const index = allTables.findIndex((entry) => entry.slug === table.slug);

                        return (
                          <button
                            key={table.slug}
                            type="button"
                            onClick={() => {
                              setIsDraftTable(false);
                              setTableSlug(table.slug);
                            }}
                            className={`w-full rounded-[24px] border p-4 text-left transition-all duration-200 ${
                              tableSlug === table.slug
                                ? "border-primary/40 bg-[linear-gradient(135deg,rgba(14,165,233,0.1),rgba(59,130,246,0.04),rgba(255,255,255,1))] shadow-[0_16px_34px_rgba(14,165,233,0.14)]"
                                : "border-border/70 bg-[linear-gradient(135deg,rgba(255,255,255,1),rgba(248,250,252,1))] hover:-translate-y-0.5 hover:border-primary/20 hover:bg-muted/20"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 space-y-1">
                                <p className="truncate font-semibold text-foreground">{table.title}</p>
                                <p className="text-xs text-muted-foreground">{table.slug}</p>
                                <p className="line-clamp-2 text-xs text-muted-foreground">{getTableSummary(table)}</p>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                {table.featured_to_retailers ? (
                                  <Badge className="bg-amber-500 text-white hover:bg-amber-500">
                                    <Star className="mr-1 h-3 w-3" />
                                    Principal
                                  </Badge>
                                ) : null}
                                {!table.visible_to_retailers ? <Badge variant="outline">Oculta</Badge> : null}
                              </div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <Button
                                type="button"
                                variant={table.visible_to_retailers ? "outline" : "default"}
                                size="sm"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleQuickVisibilityToggle(table, !table.visible_to_retailers);
                                }}
                                disabled={saving}
                              >
                                <Upload className="mr-2 h-4 w-4" />
                                {table.visible_to_retailers ? "Mover para rascunho" : "Publicar"}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleReorderTables(table.slug, "up");
                                }}
                                disabled={index === 0}
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleReorderTables(table.slug, "down");
                                }}
                                disabled={index === allTables.length - 1}
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleDuplicateTable(table);
                                }}
                                disabled={saving}
                              >
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicar
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleDeleteTable(table);
                                }}
                                disabled={saving}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </Button>
                            </div>
                          </button>
                        );
                      })}
                      {filteredTables.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                          Nenhuma tabela encontrada.
                        </div>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-[28px] border-border/70 shadow-[0_14px_38px_rgba(15,23,42,0.06)]">
                  <CardHeader>
                    <CardTitle>Indicadores</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[20px] border border-sky-100 bg-[linear-gradient(135deg,rgba(239,246,255,1),rgba(248,250,252,1))] p-4 shadow-sm">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Categorias</p>
                      <p className="mt-2 text-2xl font-semibold text-foreground">{structuredPreviewCategories.length}</p>
                    </div>
                      <div className="rounded-[20px] border border-indigo-100 bg-[linear-gradient(135deg,rgba(238,242,255,1),rgba(248,250,252,1))] p-4 shadow-sm">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Aparelhos</p>
                      <p className="mt-2 text-2xl font-semibold text-foreground">{totalDevices}</p>
                    </div>
                      <div className="rounded-[20px] border border-emerald-100 bg-[linear-gradient(135deg,rgba(236,253,245,1),rgba(248,250,252,1))] p-4 shadow-sm">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Servicos</p>
                      <p className="mt-2 text-2xl font-semibold text-foreground">{totalServices || totalItems}</p>
                    </div>
                      <div className="rounded-[20px] border border-amber-100 bg-[linear-gradient(135deg,rgba(255,251,235,1),rgba(248,250,252,1))] p-4 shadow-sm">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Status</p>
                      <Badge variant={hasUnsavedChanges ? "secondary" : "outline"} className="mt-3">
                        {hasUnsavedChanges ? "Alteracoes pendentes" : "Tudo salvo"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </aside>

              <div className="space-y-6">
            <Card className="overflow-hidden rounded-[30px] border-sky-100/80 bg-[linear-gradient(135deg,rgba(239,246,255,1),rgba(255,255,255,1))] shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
              <CardContent className="grid gap-6 p-6 xl:grid-cols-[minmax(0,1.35fr)_360px]">
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className="bg-slate-900 text-white hover:bg-slate-900">Operação da tabela</Badge>
                    {isDraftTable ? (
                      <Badge className="bg-sky-600 text-white hover:bg-sky-600">
                        Rascunho novo
                      </Badge>
                    ) : null}
                    <Badge variant={hasUnsavedChanges ? "secondary" : "outline"}>
                      {hasUnsavedChanges ? "Alteracoes pendentes" : "Tudo salvo"}
                    </Badge>
                    <Badge className={pendingServices > 0 ? "bg-amber-100 text-amber-700 hover:bg-amber-100" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"}>
                      {completionRate}% da composicao com preco preenchido
                    </Badge>
                  </div>

                  <div className="max-w-2xl space-y-2">
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                      {title || "Nova Tabela de Preços"}
                    </h2>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Central de operação da tabela ativa. Revise identidade, completude e fluxo antes de publicar para os lojistas.
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">Slug: {tableSlug}</Badge>
                      {isDraftTable ? (
                        <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100">
                          Ainda nao salva
                        </Badge>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)_minmax(0,1fr)]">
                    <div className="rounded-[22px] border border-slate-200 bg-white/90 p-5 shadow-sm">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Tabela ativa</p>
                      <p className="mt-3 text-2xl font-semibold leading-tight text-slate-950">
                        {title || "Nova Tabela de Preços"}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Badge variant="outline">{tableSlug}</Badge>
                        <Badge variant="outline">{effectiveDate ? `Base ${effectiveDate}` : "Sem data"}</Badge>
                        {isDraftTable ? (
                          <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100">Rascunho novo</Badge>
                        ) : null}
                        {featuredToRetailers ? (
                          <Badge className="bg-amber-500 text-white hover:bg-amber-500">Principal</Badge>
                        ) : null}
                        {!visibleToRetailers ? <Badge variant="outline">Oculta</Badge> : null}
                      </div>
                    </div>
                    <div className="rounded-[22px] border border-emerald-100 bg-[linear-gradient(135deg,rgba(236,253,245,1),rgba(255,255,255,0.95))] p-5 shadow-sm">
                      <p className="text-xs uppercase tracking-[0.2em] text-emerald-700/80">Completude</p>
                      <p className="mt-3 text-3xl font-semibold text-slate-950">{completionRate}%</p>
                      <p className="mt-2 text-sm font-medium text-slate-900">
                        {pricedServices} de {totalServices || totalItems} serviços com preço
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {pendingServices > 0 ? `${pendingServices} ainda pendente(s)` : "Tudo preenchido para publicação"}
                      </p>
                    </div>
                    <div className="rounded-[22px] border border-indigo-100 bg-[linear-gradient(135deg,rgba(238,242,255,1),rgba(255,255,255,0.95))] p-5 shadow-sm md:col-span-2 2xl:col-span-1">
                      <p className="text-xs uppercase tracking-[0.2em] text-indigo-700/80">Fluxo ideal</p>
                      <ol className="mt-3 space-y-1 text-sm font-medium text-slate-900">
                        <li>1. Estrutura</li>
                        <li>2. Observações</li>
                        <li>3. Preços</li>
                        <li>4. Publicação</li>
                      </ol>
                      <p className="mt-3 text-xs leading-5 text-muted-foreground">
                        O texto bruto continua como apoio para importar, revisar e exportar.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-white/85 p-5 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Ações rápidas</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Use este bloco para sincronizar o texto, restaurar a última versão salva e fechar a operação da tabela.
                  </p>
                  {isDraftTable ? (
                    <div className="mt-4 rounded-[18px] border border-sky-200 bg-sky-50 px-4 py-3 text-xs leading-5 text-sky-800">
                      Esta tabela existe apenas no editor. Clique em salvar para criar o registro definitivo na biblioteca.
                    </div>
                  ) : null}

                  <div className="mt-5 space-y-3">
                    <Button type="button" variant="outline" onClick={handleAutoFillFromText} className="w-full justify-start">
                      <Wand2 className="mr-2 h-4 w-4" />
                      Ler titulo/data
                    </Button>
                    <Button type="button" variant="outline" onClick={handleNormalizeText} className="w-full justify-start">
                      <Wand2 className="mr-2 h-4 w-4" />
                      Normalizar texto
                    </Button>
                    <Button type="button" variant="outline" onClick={handleResetForm} disabled={!record} className="w-full justify-start">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Restaurar
                    </Button>
                    <Button onClick={handleSave} disabled={saving || loading} className="mt-2 w-full justify-start">
                      <Save className="mr-2 h-4 w-4" />
                      {saving ? "Salvando..." : isDraftTable ? "Criar e salvar tabela" : "Salvar tabela"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden rounded-[28px] border-border/70 shadow-[0_14px_38px_rgba(15,23,42,0.06)]">
              <CardHeader>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle>Configuração da Tabela</CardTitle>
                    <CardDescription>Defina identidade, visibilidade e publicação antes de compor os itens.</CardDescription>
                  </div>
                  <Badge className="bg-slate-900 text-white hover:bg-slate-900">Identidade e publicação</Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 bg-[linear-gradient(135deg,rgba(248,250,252,0.75),rgba(255,255,255,1))] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_220px]">
                <div className="rounded-[22px] border border-slate-200 bg-white/90 p-4 shadow-sm">
                  <label className="text-sm font-medium">Título</label>
                  <Input ref={titleInputRef} value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2" />
                </div>
                <div className="rounded-[22px] border border-slate-200 bg-white/90 p-4 shadow-sm">
                  <label className="text-sm font-medium">Data de referência</label>
                  <Input value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} placeholder="13/11/25" className="mt-2" />
                </div>
                <div className="flex items-end">
                  <div className="w-full rounded-[22px] border border-sky-100 bg-[linear-gradient(135deg,rgba(239,246,255,1),rgba(255,255,255,1))] p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.18em] text-sky-700">Publicação</p>
                    <p className="mt-3 text-sm font-medium text-foreground">Fechamento da tabela</p>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      Salve depois de ajustar identidade, observações e precificação estrutural.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge
                        className={
                          publicationReady
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                            : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                        }
                      >
                        {publicationReady ? "Pronta para publicar" : "Requer revisão"}
                      </Badge>
                      {visibleToRetailers ? (
                        <Badge variant="outline">Publicação ativa</Badge>
                      ) : (
                        <Badge variant="outline">Salvando como rascunho</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-[22px] border border-emerald-100 bg-[linear-gradient(135deg,rgba(236,253,245,1),rgba(255,255,255,1))] p-4 shadow-sm">
                  <div>
                    <p className="text-sm font-medium">Visível para lojistas</p>
                    <p className="text-xs text-muted-foreground">
                      Controla a publicação na área do lojista. Se estiver desligado, a tabela nao aparece para o lojista.
                    </p>
                  </div>
                  <Checkbox checked={visibleToRetailers} onCheckedChange={(value) => handleVisibleToRetailersChange(Boolean(value))} />
                </div>
                <div className="flex items-center justify-between rounded-[22px] border border-amber-100 bg-[linear-gradient(135deg,rgba(255,251,235,1),rgba(255,255,255,1))] p-4 shadow-sm">
                  <div>
                    <p className="text-sm font-medium">Tabela principal</p>
                    <p className="text-xs text-muted-foreground">Aparece primeiro na seleção do lojista.</p>
                  </div>
                  <Checkbox checked={featuredToRetailers} onCheckedChange={(value) => handleFeaturedToRetailersChange(Boolean(value))} />
                </div>
                <div className="rounded-[22px] border border-indigo-100 bg-[linear-gradient(135deg,rgba(238,242,255,1),rgba(255,255,255,1))] p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-indigo-700">Método</p>
                  <p className="mt-3 text-sm font-medium text-foreground">Estrutura primeiro</p>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    Composição estrutural primeiro. Texto bruto apenas para importar, exportar e normalizar.
                  </p>
                </div>
                <div className="rounded-[22px] border border-slate-200 bg-white/90 p-4 shadow-sm lg:col-span-3">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Checklist de publicação</p>
                      <p className="text-xs text-muted-foreground">
                        Itens em amarelo podem ficar no rascunho. Itens bloqueantes impedem publicação para lojistas.
                      </p>
                    </div>
                    <Badge variant={publicationReady ? "outline" : "secondary"}>
                        {blockingPublicationChecks.length} bloqueio(s)
                    </Badge>
                  </div>
                  {!visibleToRetailers ? (
                    <div className="mt-4 rounded-[18px] border border-amber-200 bg-[linear-gradient(135deg,rgba(255,251,235,1),rgba(255,255,255,1))] p-4">
                      <p className="text-sm font-medium text-amber-800">Tabela em rascunho</p>
                      <p className="mt-1 text-xs leading-5 text-amber-700">
                        No estado atual, esta tabela fica oculta para o lojista. Ative "Visível para lojistas" e salve, ou use o botão "Publicar" na biblioteca.
                      </p>
                    </div>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {publicationChecks.length === 0 ? (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                        Nenhuma pendencia detectada
                      </Badge>
                    ) : (
                      publicationChecks.map((check) => (
                        <Badge
                          key={check.label}
                          className={
                            check.tone === "error"
                              ? "bg-rose-100 text-rose-700 hover:bg-rose-100"
                              : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                          }
                        >
                          {check.label}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden rounded-[28px] border-border/70 shadow-[0_14px_38px_rgba(15,23,42,0.06)]">
              <CardHeader>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle>Observações Comerciais</CardTitle>
                    <CardDescription>Separe riscos, garantia, prazo e regras de atendimento da precificação.</CardDescription>
                  </div>
                  <Badge variant="outline">{parsedPreview.intro.length} observação(ões)</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 bg-[linear-gradient(135deg,rgba(255,250,245,0.55),rgba(255,255,255,1))]">
                <div className="flex justify-end">
                  <Button type="button" variant="outline" size="sm" onClick={handleAddIntroLine}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar observação
                  </Button>
                </div>
                {parsedPreview.intro.length ? (
                  parsedPreview.intro.map((line, index) => (
                    <div key={index} className="flex items-start gap-3 rounded-[20px] border border-orange-100 bg-white/90 p-3 shadow-sm">
                      <Textarea
                        ref={(element) => {
                          introLineRefs.current[index] = element;
                        }}
                        value={line}
                        onChange={(e) => handleUpdateIntroLine(index, e.target.value)}
                        rows={2}
                        placeholder="Ex.: Serviço feito por ordem de chegada, sem garantia em peças com cristal exposto."
                        className="min-h-[72px] border-orange-100 bg-orange-50/30"
                      />
                      <div className="flex flex-col gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMoveIntroLine(index, "up")}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMoveIntroLine(index, "down")}
                          disabled={index === parsedPreview.intro.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveIntroLine(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                    Nenhuma observação cadastrada.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="overflow-hidden rounded-[28px] border-border/70 shadow-[0_14px_38px_rgba(15,23,42,0.06)]">
              <CardHeader>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle>Biblioteca de Modelos</CardTitle>
                    <CardDescription>Modelos de serviços salvos nesta sessão para reaplicar em outros aparelhos.</CardDescription>
                  </div>
                  <Badge className="bg-violet-600 text-white hover:bg-violet-600">{serviceTemplates.length} modelo(s)</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 bg-[linear-gradient(135deg,rgba(245,243,255,0.65),rgba(255,255,255,1))]">
                {serviceTemplates.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                    Nenhum modelo salvo ainda. Use "Salvar modelo" em um aparelho para criar sua biblioteca de serviços.
                  </div>
                ) : (
                  serviceTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="rounded-[22px] border border-violet-100 bg-[linear-gradient(135deg,rgba(250,245,255,1),rgba(255,255,255,1))] p-4 shadow-sm"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1 space-y-2">
                          {editingTemplateId === template.id ? (
                            <div className="flex flex-col gap-2 sm:flex-row">
                              <Input
                                value={editingTemplateName}
                                onChange={(e) => setEditingTemplateName(e.target.value)}
                                className="h-10"
                              />
                              <Button type="button" variant="outline" onClick={handleSaveTemplateRename}>
                                Salvar nome
                              </Button>
                            </div>
                          ) : (
                            <p className="font-semibold text-foreground">{template.name}</p>
                          )}
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">{template.serviceNames.length} serviço(s)</Badge>
                            {template.serviceNames.slice(0, 4).map((serviceName) => (
                              <Badge key={`${template.id}-${serviceName}`} className="bg-slate-100 text-slate-700 hover:bg-slate-100">
                                {serviceName}
                              </Badge>
                            ))}
                            {template.serviceNames.length > 4 ? (
                              <Badge variant="outline">+{template.serviceNames.length - 4}</Badge>
                            ) : null}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {editingTemplateId === template.id ? (
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => {
                                setEditingTemplateId(null);
                                setEditingTemplateName("");
                              }}
                            >
                              Cancelar
                            </Button>
                          ) : (
                            <Button type="button" variant="outline" size="sm" onClick={() => handleStartTemplateRename(template)}>
                              Renomear
                            </Button>
                          )}
                          <Button type="button" variant="outline" size="sm" onClick={() => handleDeleteTemplate(template.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="overflow-hidden rounded-[28px] border-border/70 shadow-[0_14px_38px_rgba(15,23,42,0.06)]">
              <CardHeader>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle>Catálogo Estruturado</CardTitle>
                    <CardDescription>Monte a tabela como catálogo: categoria, aparelho e serviços com preço.</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2 rounded-[22px] border border-slate-200 bg-slate-50/80 p-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Input
                          ref={newCategoryInputRef}
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddCategory();
                            }
                          }}
                          placeholder="Ex.: Samsung"
                          className="w-full lg:w-56"
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Digite o nome da categoria (ex: Samsung, Motorola)</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          No texto bruto, categorias são detectadas automaticamente quando escritas em maiúsculo
                        </p>
                      </TooltipContent>
                    </Tooltip>
                    <Input
                      value={previewQuery}
                      onChange={(e) => setPreviewQuery(e.target.value)}
                      placeholder="Filtrar composição..."
                      className="w-full lg:w-56"
                    />
                    <Button type="button" onClick={handleAddCategory}>
                      <Plus className="mr-2 h-4 w-4" />
                      Categoria
                    </Button>
                    <Button type="button" variant="outline" onClick={handleNormalizeText}>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Normalizar
                    </Button>
                    <Button type="button" variant="outline" onClick={() => handleSetAllCollapsed(false)}>
                      <ChevronDown className="mr-2 h-4 w-4" />
                      Expandir tudo
                    </Button>
                    <Button type="button" variant="outline" onClick={() => handleSetAllCollapsed(true)}>
                      <ChevronRight className="mr-2 h-4 w-4" />
                      Recolher tudo
                    </Button>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100">{structuredPreviewCategories.length} categoria(s)</Badge>
                  <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">{totalDevices} aparelho(s)</Badge>
                  <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">{totalServices || totalItems} serviço(s)</Badge>
                  <Badge className={pendingServices > 0 ? "bg-amber-100 text-amber-700 hover:bg-amber-100" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"}>
                    {pendingServices > 0 ? `${pendingServices} preço(s) pendente(s)` : "Precificação completa"}
                  </Badge>
                  {invalidServices > 0 ? (
                    <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">
                      {invalidServices} preço(s) inválido(s)
                    </Badge>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 bg-[linear-gradient(135deg,rgba(248,250,252,0.8),rgba(255,255,255,1))]">
                {filteredStructuredCategories.length === 0 ? (
                  <div className="rounded-[22px] border border-dashed border-border p-10 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Wand2 className="h-6 w-6" />
                    </div>
                    <p className="mt-4 text-base font-medium text-foreground">Nenhum item encontrado</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Ajuste o filtro, crie uma nova categoria ou normalize o conteúdo para continuar.
                    </p>
                  </div>
                ) : (
                  filteredStructuredCategories.map((category) => {
                    const servicesCount = category.devices.reduce((total, device) => total + device.services.length, 0);
                    const categoryPendingPrices = category.devices.reduce(
                      (total, device) =>
                        total +
                        device.services.filter((service) => service.priceText.trim().length === 0).length,
                      0
                    );
                    const categoryInvalidPrices = category.devices.reduce(
                      (total, device) =>
                        total +
                        device.services.filter((service) => {
                          const priceText = service.priceText.trim();
                          return priceText.length > 0 && parsePriceValue(priceText) === null;
                        }).length,
                      0
                    );
                    const categoryMissingNames =
                      (category.name.trim() ? 0 : 1) +
                      category.devices.reduce(
                        (total, device) =>
                          total +
                          (device.name.trim() ? 0 : 1) +
                          device.services.filter((service) => service.name.trim().length === 0).length,
                        0
                      );
                    const categoryHasIssues =
                      categoryPendingPrices > 0 || categoryInvalidPrices > 0 || categoryMissingNames > 0;
                    const categoryKey = `${category.categoryIndex}-${category.name}`;
                    const isCategoryCollapsed = collapsedCategories[categoryKey] ?? true;

                    return (
                      <div
                        key={categoryKey}
                        className={`rounded-[28px] border bg-background shadow-[0_12px_30px_rgba(15,23,42,0.05)] transition-shadow duration-200 hover:shadow-[0_18px_38px_rgba(15,23,42,0.08)] ${
                          categoryHasIssues ? "border-amber-200/90" : "border-slate-200/80"
                        }`}
                      >
                        <div
                          className={`border-b p-4 ${
                            categoryHasIssues
                              ? "border-amber-200/80 bg-[linear-gradient(135deg,rgba(255,251,235,0.95),rgba(255,255,255,1))]"
                              : "border-slate-200/70 bg-[linear-gradient(135deg,rgba(239,246,255,0.95),rgba(255,255,255,1))]"
                          }`}
                        >
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex flex-1 items-start gap-3">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="mt-0.5 h-10 w-10 shrink-0 rounded-xl border-sky-200 bg-white"
                                onClick={() => toggleCategoryCollapsed(categoryKey)}
                              >
                                {isCategoryCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </Button>
                              <div className="flex-1 space-y-2">
                                <Input
                                  ref={(element) => {
                                    categoryNameRefs.current[category.categoryIndex] = element;
                                  }}
                                  value={category.name}
                                  onChange={(e) => handleRenameCategory(category.categoryIndex, e.target.value)}
                                  placeholder="Ex.: Samsung"
                                  className="h-11 border-sky-100 bg-white/90 text-base font-semibold shadow-sm"
                                />
                                <div className="flex flex-wrap gap-2">
                                  <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100">{category.devices.length} aparelho(s)</Badge>
                                  <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">{servicesCount} serviço(s)</Badge>
                                  <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100">
                                    {category.devices.filter((device) => device.services.some((service) => service.priceText.trim().length > 0)).length} aparelho(s) com preço
                                  </Badge>
                                  {categoryPendingPrices > 0 ? (
                                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                                      {categoryPendingPrices} preço(s) pendente(s)
                                    </Badge>
                                  ) : null}
                                  {categoryInvalidPrices > 0 ? (
                                    <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">
                                      {categoryInvalidPrices} preço(s) inválido(s)
                                    </Badge>
                                  ) : null}
                                  {categoryMissingNames > 0 ? (
                                    <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">
                                      {categoryMissingNames} nome(s) pendente(s)
                                    </Badge>
                                  ) : null}
                                  <Badge variant="outline">{isCategoryCollapsed ? "Recolhida" : "Expandida"}</Badge>
                                </div>
                                {categoryHasIssues ? (
                                  <p className="text-xs font-medium text-amber-700">
                                    Revise esta categoria: ainda existem campos sem nome, preços vazios ou preços inválidos.
                                  </p>
                                ) : null}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 lg:justify-end">
                              <Button type="button" variant="outline" size="sm" className="border-sky-200 bg-white" onClick={() => handleAddDevice(category.categoryIndex)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Aparelho
                              </Button>
                              <Button type="button" variant="outline" size="sm" className="border-slate-200 bg-white" onClick={() => handleDuplicateCategory(category.categoryIndex)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicar categoria
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="border-slate-200 bg-white"
                                onClick={() => handleMoveCategory(category.categoryIndex, "up")}
                                disabled={category.categoryIndex === 0}
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="border-slate-200 bg-white"
                                onClick={() => handleMoveCategory(category.categoryIndex, "down")}
                                disabled={category.categoryIndex === structuredPreviewCategories.length - 1}
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                              <Button type="button" variant="outline" size="sm" className="border-rose-200 bg-white text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => handleRemoveCategory(category.categoryIndex)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remover
                              </Button>
                            </div>
                          </div>
                        </div>

                        {!isCategoryCollapsed ? <div className="space-y-4 p-4">
                          {category.devices.length === 0 ? (
                            <div className="rounded-[20px] border border-dashed border-sky-200 bg-sky-50/60 p-4">
                              <p className="text-sm font-medium text-foreground">Categoria pronta para montar</p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                Esta categoria ainda não tem aparelhos. Adicione o primeiro item para começar a preencher os serviços e preços.
                              </p>
                              <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_180px_auto]">
                                <Input
                                  ref={(element) => {
                                    emptyCategoryDeviceRefs.current[category.categoryIndex] = element;
                                  }}
                                  value={emptyCategoryDrafts[category.categoryIndex]?.deviceName || ""}
                                  onChange={(e) =>
                                    handleEmptyCategoryDraftChange(
                                      category.categoryIndex,
                                      "deviceName",
                                      e.target.value
                                    )
                                  }
                                  onKeyDown={(e) =>
                                    handleEmptyCategoryDraftKeyDown(e, category.categoryIndex)
                                  }
                                  placeholder="Primeiro aparelho"
                                  className="bg-white"
                                />
                                <Input
                                  value={emptyCategoryDrafts[category.categoryIndex]?.serviceName || ""}
                                  onChange={(e) =>
                                    handleEmptyCategoryDraftChange(
                                      category.categoryIndex,
                                      "serviceName",
                                      e.target.value
                                    )
                                  }
                                  onBlur={() =>
                                    handleEmptyCategoryServiceBlur(category.categoryIndex)
                                  }
                                  onKeyDown={(e) =>
                                    handleEmptyCategoryDraftKeyDown(e, category.categoryIndex)
                                  }
                                  placeholder="Primeiro serviço ou Preco base"
                                  className="bg-white"
                                />
                                <Input
                                  value={emptyCategoryDrafts[category.categoryIndex]?.priceText || ""}
                                  onChange={(e) =>
                                    handleEmptyCategoryDraftChange(
                                      category.categoryIndex,
                                      "priceText",
                                      e.target.value
                                    )
                                  }
                                  onBlur={() => handleEmptyCategoryPriceBlur(category.categoryIndex)}
                                  onKeyDown={(e) =>
                                    handleEmptyCategoryDraftKeyDown(e, category.categoryIndex)
                                  }
                                  inputMode="decimal"
                                  placeholder="Preço inicial"
                                  className={
                                    emptyCategoryPriceTone === "neutral"
                                      ? "border-slate-200 bg-white"
                                      : emptyCategoryPriceTone === "valid"
                                        ? "border-emerald-200 bg-white text-emerald-700"
                                        : "border-rose-200 bg-white text-rose-700"
                                  }
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="border-sky-200 bg-white"
                                  onClick={() => handleCreateFirstDevice(category.categoryIndex)}
                                >
                                  <Plus className="mr-2 h-4 w-4" />
                                  Criar primeiro
                                </Button>
                              </div>
                              <div className="mt-3 flex flex-wrap gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="border-slate-200 bg-white"
                                  onClick={() => handleAddDevice(category.categoryIndex)}
                                >
                                  Começar vazio
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="text-slate-600 hover:bg-white"
                                  onClick={() => handleClearEmptyCategoryDraft(category.categoryIndex)}
                                >
                                  Limpar campos
                                </Button>
                                <Badge variant="outline">Serviço vazio vira "Preco base"</Badge>
                                {emptyCategoryUsesBaseService ? (
                                  <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100">
                                    Primeiro serviço: Preco base
                                  </Badge>
                                ) : null}
                                <Badge
                                  className={
                                    emptyCategoryPriceTone === "neutral"
                                      ? "bg-slate-100 text-slate-700 hover:bg-slate-100"
                                      : emptyCategoryPriceTone === "valid"
                                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                                        : "bg-rose-100 text-rose-700 hover:bg-rose-100"
                                  }
                                >
                                  {emptyCategoryPriceTone === "neutral"
                                    ? "Preço opcional"
                                    : emptyCategoryPriceTone === "valid"
                                      ? "Preço válido"
                                      : "Preço inválido"}
                                </Badge>
                              </div>
                            </div>
                          ) : null}
                          {category.devices.map((device) => {
                            const deviceKey = `${category.categoryIndex}-${device.deviceIndex}-${device.name}`;
                            const isDeviceCollapsed = collapsedDevices[deviceKey] ?? true;
                            const devicePendingPrices = device.services.filter(
                              (service) => service.priceText.trim().length === 0
                            ).length;
                            const deviceInvalidPrices = device.services.filter((service) => {
                              const priceText = service.priceText.trim();
                              return priceText.length > 0 && parsePriceValue(priceText) === null;
                            }).length;
                            const deviceMissingNames =
                              (device.name.trim() ? 0 : 1) +
                              device.services.filter((service) => service.name.trim().length === 0).length;
                            const deviceHasIssues =
                              devicePendingPrices > 0 || deviceInvalidPrices > 0 || deviceMissingNames > 0;
                            const availableSourceDevices = category.devices.filter(
                              (_, candidateIndex) => candidateIndex !== device.deviceIndex
                            );

                            return (
                            <div
                              key={deviceKey}
                              className={`rounded-[24px] border p-4 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(15,23,42,0.06)] ${
                                deviceHasIssues
                                  ? "border-amber-200/90 bg-[linear-gradient(135deg,rgba(255,251,235,0.92),rgba(255,255,255,1))]"
                                  : "border-slate-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,1),rgba(248,250,252,1))]"
                              }`}
                            >
                              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex flex-1 items-start gap-3">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="mt-0.5 h-10 w-10 shrink-0 rounded-xl border-slate-200 bg-white"
                                    onClick={() => toggleDeviceCollapsed(deviceKey)}
                                  >
                                    {isDeviceCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                  </Button>
                                  <div className="flex-1 space-y-2">
                                    <Input
                                      ref={(element) => {
                                        deviceNameRefs.current[`${category.categoryIndex}-${device.deviceIndex}`] = element;
                                      }}
                                      value={device.name}
                                      onChange={(e) => handleUpdateDeviceName(category.categoryIndex, device.deviceIndex, e.target.value)}
                                      placeholder="Ex.: iPhone 13 Pro"
                                      className="h-11 border-slate-200 bg-white font-medium shadow-sm"
                                    />
                                    <div className="flex flex-wrap gap-2">
                                      <p className="text-xs text-muted-foreground">{device.services.length} serviço(s) cadastrados</p>
                                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                                        {device.services.filter((service) => service.priceText.trim().length > 0).length} com preço
                                      </Badge>
                                      {devicePendingPrices > 0 ? (
                                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                                          {devicePendingPrices} pendente(s)
                                        </Badge>
                                      ) : null}
                                      {deviceInvalidPrices > 0 ? (
                                        <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">
                                          {deviceInvalidPrices} inválido(s)
                                        </Badge>
                                      ) : null}
                                      {deviceMissingNames > 0 ? (
                                        <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">
                                          {deviceMissingNames} nome(s) pendente(s)
                                        </Badge>
                                      ) : null}
                                      <Badge variant="outline">{isDeviceCollapsed ? "Recolhido" : "Expandido"}</Badge>
                                    </div>
                                    {deviceHasIssues ? (
                                      <p className="text-xs font-medium text-amber-700">
                                        Preencha os nomes faltantes e revise preços vazios ou inválidos deste aparelho.
                                      </p>
                                    ) : null}
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2 lg:justify-end">
                                  <Button type="button" variant="outline" size="sm" className="border-sky-200 bg-white" onClick={() => handleAddService(category.categoryIndex, device.deviceIndex)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Serviço
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="border-violet-200 bg-white"
                                    onClick={() =>
                                      handleCreateTemplateFromDevice(
                                        category.categoryIndex,
                                        device.deviceIndex,
                                        device.name
                                      )
                                    }
                                  >
                                    <Star className="mr-2 h-4 w-4" />
                                    Salvar modelo
                                  </Button>
                                  <Button type="button" variant="outline" size="sm" className="border-emerald-200 bg-white" onClick={() => handleAddServicePack(category.categoryIndex, device.deviceIndex)}>
                                    <Wand2 className="mr-2 h-4 w-4" />
                                    Pacote base
                                  </Button>
                                  <Button type="button" variant="outline" size="sm" className="border-slate-200 bg-white" onClick={() => handleDuplicateDevice(category.categoryIndex, device.deviceIndex)}>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Duplicar
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="border-slate-200 bg-white"
                                    onClick={() => handleMoveDevice(category.categoryIndex, device.deviceIndex, "up")}
                                    disabled={device.deviceIndex === 0}
                                  >
                                    <ArrowUp className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="border-slate-200 bg-white"
                                    onClick={() => handleMoveDevice(category.categoryIndex, device.deviceIndex, "down")}
                                    disabled={device.deviceIndex === category.devices.length - 1}
                                  >
                                    <ArrowDown className="h-4 w-4" />
                                  </Button>
                                  <Button type="button" variant="ghost" size="sm" className="text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => handleRemoveDevice(category.categoryIndex, device.deviceIndex)}>
                                    <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                                    Remover
                                  </Button>
                                </div>
                              </div>

                              {!isDeviceCollapsed ? (
                                <>
                                  {serviceTemplates.length > 0 ? (
                                    <div className="mt-4 rounded-[18px] border border-violet-200 bg-violet-50/60 p-4">
                                      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                                        <div>
                                          <p className="text-sm font-medium text-foreground">Aplicar modelo salvo</p>
                                          <p className="text-xs text-muted-foreground">
                                            Reaplique um conjunto de serviços padronizado salvo a partir de outro aparelho.
                                          </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                          <select
                                            value={deviceTemplateSelection[deviceKey] || ""}
                                            onChange={(e) => handleDeviceTemplateSelectionChange(deviceKey, e.target.value)}
                                            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                                          >
                                            <option value="">Escolher modelo</option>
                                            {serviceTemplates.map((template) => (
                                              <option key={template.id} value={template.id}>
                                                {template.name} ({template.serviceNames.length})
                                              </option>
                                            ))}
                                          </select>
                                          <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                              handleApplyTemplateToDevice(
                                                category.categoryIndex,
                                                device.deviceIndex,
                                                deviceKey
                                              )
                                            }
                                          >
                                            <Star className="mr-2 h-4 w-4" />
                                            Aplicar modelo
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  ) : null}

                                  {availableSourceDevices.length > 0 ? (
                                    <div className="mt-4 rounded-[18px] border border-sky-200 bg-sky-50/70 p-4">
                                      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                                        <div>
                                          <p className="text-sm font-medium text-foreground">Copiar estrutura de serviços</p>
                                          <p className="text-xs text-muted-foreground">
                                            Reaproveite a lista de serviços de outro aparelho da mesma categoria e preencha os preços depois.
                                          </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                          <select
                                            value={deviceServiceSource[deviceKey] || ""}
                                            onChange={(e) => handleDeviceServiceSourceChange(deviceKey, e.target.value)}
                                            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                                          >
                                            <option value="">Escolher origem</option>
                                            {availableSourceDevices.map((sourceDevice) => (
                                              <option key={`${deviceKey}-source-${sourceDevice.deviceIndex}`} value={sourceDevice.deviceIndex}>
                                                {sourceDevice.name}
                                              </option>
                                            ))}
                                          </select>
                                          <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                              handleCopyServiceStructureToDevice(
                                                category.categoryIndex,
                                                device.deviceIndex,
                                                deviceKey
                                              )
                                            }
                                          >
                                            <Copy className="mr-2 h-4 w-4" />
                                            Copiar estrutura
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  ) : null}

                                  <div className="mt-4 rounded-[18px] border border-slate-200 bg-slate-50/80 p-4">
                                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                                      <div>
                                        <p className="text-sm font-medium text-foreground">Ajuste em lote</p>
                                        <p className="text-xs text-muted-foreground">
                                          Aplique percentual sobre preços existentes ou defina um valor final para todos os serviços do aparelho.
                                        </p>
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        <select
                                          value={deviceBulkMode[deviceKey] || "percent"}
                                          onChange={(e) =>
                                            handleDeviceBulkModeChange(
                                              deviceKey,
                                              e.target.value as "percent" | "set"
                                            )
                                          }
                                          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                                        >
                                          <option value="percent">Percentual</option>
                                          <option value="set">Valor final</option>
                                        </select>
                                        <Input
                                          value={deviceBulkValue[deviceKey] || ""}
                                          onChange={(e) => handleDeviceBulkValueChange(deviceKey, e.target.value)}
                                          placeholder={
                                            (deviceBulkMode[deviceKey] || "percent") === "percent"
                                              ? "Ex.: 10 ou -5"
                                              : "Ex.: 149,90"
                                          }
                                          className="h-10 w-full sm:w-40"
                                        />
                                        <Button
                                          type="button"
                                          variant="outline"
                                          onClick={() =>
                                            handleApplyBulkPriceToDevice(
                                              category.categoryIndex,
                                              device.deviceIndex,
                                              deviceKey
                                            )
                                          }
                                        >
                                          <Wand2 className="mr-2 h-4 w-4" />
                                          Aplicar lote
                                        </Button>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="mt-4 flex flex-wrap gap-2 rounded-[18px] border border-slate-200/80 bg-slate-50/70 p-3">
                                    {SERVICE_PRESETS.map((preset) => (
                                      <Button
                                        key={preset}
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="border-slate-200 bg-white"
                                        onClick={() => handleAddServicePreset(category.categoryIndex, device.deviceIndex, preset)}
                                      >
                                        <Plus className="mr-2 h-3.5 w-3.5" />
                                        {preset}
                                      </Button>
                                    ))}
                                  </div>

                                  <div className="mt-4 space-y-3">
                                    {device.services.map((service) => (
                                      <div
                                        key={getServiceUiKey(
                                          category.categoryIndex,
                                          device.deviceIndex,
                                          service.serviceIndex
                                        )}
                                        className={`grid gap-3 rounded-[20px] border p-3.5 shadow-sm transition-colors hover:bg-slate-50 lg:grid-cols-[minmax(0,1fr)_180px_120px_auto_auto_auto_auto] ${
                                          service.priceText.trim().length > 0 &&
                                          parsePriceValue(service.priceText.trim()) !== null
                                            ? "border-emerald-200/80 bg-[linear-gradient(135deg,rgba(236,253,245,0.8),rgba(255,255,255,1))]"
                                            : service.priceText.trim().length > 0
                                              ? "border-rose-200/80 bg-[linear-gradient(135deg,rgba(255,241,242,0.95),rgba(255,255,255,1))]"
                                              : "border-amber-200/80 bg-[linear-gradient(135deg,rgba(255,251,235,0.95),rgba(255,255,255,1))]"
                                        }`}
                                      >
                                    <Input
                                      ref={(element) => {
                                        serviceNameRefs.current[
                                          `${category.categoryIndex}-${device.deviceIndex}-${service.serviceIndex}`
                                        ] = element;
                                      }}
                                      value={service.name}
                                      onChange={(e) =>
                                        handleUpdateService(category.categoryIndex, device.deviceIndex, service.serviceIndex, "name", e.target.value)
                                      }
                                      placeholder="Ex.: Troca de Vidro"
                                      className="h-10 border-slate-200 bg-white"
                                    />
                                    <Input
                                      ref={(element) => {
                                        servicePriceRefs.current[
                                          `${category.categoryIndex}-${device.deviceIndex}-${service.serviceIndex}`
                                        ] = element;
                                      }}
                                      value={service.priceText}
                                      onChange={(e) =>
                                        handleUpdateService(category.categoryIndex, device.deviceIndex, service.serviceIndex, "priceText", e.target.value)
                                      }
                                      onBlur={() =>
                                        handleServicePriceBlur(
                                          category.categoryIndex,
                                          device.deviceIndex,
                                          service.serviceIndex
                                        )
                                      }
                                      inputMode="decimal"
                                      placeholder="Ex.: R$ 149,90"
                                      className={`h-10 font-medium ${
                                        service.priceText.trim().length === 0
                                          ? "border-amber-200 bg-white text-primary"
                                          : parsePriceValue(service.priceText.trim()) !== null
                                            ? "border-emerald-200 bg-white text-emerald-700"
                                            : "border-rose-200 bg-white text-rose-700"
                                      }`}
                                    />
                                    <div className="flex items-center">
                                      <Badge
                                        className={
                                          service.priceText.trim().length === 0
                                            ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                                            : parsePriceValue(service.priceText.trim()) !== null
                                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                                            : "bg-rose-100 text-rose-700 hover:bg-rose-100"
                                        }
                                      >
                                        {service.priceText.trim().length === 0
                                          ? "Pendente"
                                          : parsePriceValue(service.priceText.trim()) !== null
                                            ? "Com preco"
                                            : "Preco invalido"}
                                      </Badge>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      className="border-slate-200 bg-white"
                                      onClick={() =>
                                        handleDuplicateService(
                                          category.categoryIndex,
                                          device.deviceIndex,
                                          service.serviceIndex
                                        )
                                      }
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      className="border-slate-200 bg-white"
                                      onClick={() => handleMoveService(category.categoryIndex, device.deviceIndex, service.serviceIndex, "up")}
                                      disabled={service.serviceIndex === 0}
                                    >
                                      <ArrowUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      className="border-slate-200 bg-white"
                                      onClick={() => handleMoveService(category.categoryIndex, device.deviceIndex, service.serviceIndex, "down")}
                                      disabled={service.serviceIndex === device.services.length - 1}
                                    >
                                      <ArrowDown className="h-4 w-4" />
                                    </Button>
                                    <Button type="button" variant="ghost" size="icon" className="text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => handleRemoveService(category.categoryIndex, device.deviceIndex, service.serviceIndex)}>
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                      </div>
                                    ))}
                                  </div>
                                </>
                              ) : (
                                <div className="mt-4 rounded-[18px] border border-dashed border-border/70 bg-white/70 p-4 text-sm text-muted-foreground">
                                  Editor recolhido para reduzir altura da tabela. Expanda para editar serviços e preços.
                                </div>
                              )}
                            </div>
                            );
                          })}
                        </div> : null}
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            <Card className="overflow-hidden rounded-[28px] border-border/70 shadow-[0_14px_38px_rgba(15,23,42,0.06)] transition-shadow duration-200 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
              <CardHeader>
                <CardTitle>Fonte de Texto</CardTitle>
                <CardDescription>Use para importar, exportar, revisar ou restaurar o conteúdo da tabela.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 bg-[linear-gradient(135deg,rgba(248,250,252,0.7),rgba(255,255,255,1))]">
                <div className="rounded-[22px] border border-slate-200 bg-white/90 p-4 shadow-sm">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-2xl">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Camada de apoio</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        A edição principal acontece no catálogo estruturado. Esta área fica como fonte operacional para importar, revisar, exportar e normalizar.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">Importação</Badge>
                      <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100">Revisão</Badge>
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Exportação</Badge>
                    </div>
                  </div>
                </div>

                <Textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  rows={18}
                  className="border-slate-200 bg-white shadow-sm"
                  placeholder={"Ex.:\nSAMSUNG\nGalaxy A15 > Troca de Vidro = R$100,00"}
                />
                <div className="flex flex-wrap gap-3 rounded-[22px] border border-slate-200/80 bg-slate-50/70 p-3">
                  <label>
                    <Button variant="outline" asChild className="border-slate-200 bg-white">
                      <span>
                        <Upload className="mr-2 h-4 w-4" />
                        Importar .txt
                      </span>
                    </Button>
                    <input type="file" accept=".txt" className="hidden" onChange={handleTxtImport} />
                  </label>
                  <Button type="button" variant="outline" className="border-slate-200 bg-white" onClick={handleLoadTemplate}>
                    Carregar modelo
                  </Button>
                  <Button type="button" variant="outline" className="border-sky-200 bg-white" onClick={handleAutoFillFromText}>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Ler título/data
                  </Button>
                  <Button type="button" variant="outline" className="border-emerald-200 bg-white" onClick={handleExportTxt}>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar .txt
                  </Button>
                  <Button type="button" variant="outline" className="border-slate-200 bg-white" onClick={handleCopyRawText}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar texto
                  </Button>
                  <Button type="button" variant="outline" className="border-slate-200 bg-white" onClick={handleResetForm} disabled={!record}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Restaurar
                  </Button>
                  <Button type="button" variant="outline" className="border-rose-200 bg-white text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={handleClearText}>
                    Limpar
                  </Button>
                </div>
                <div className="rounded-[18px] border border-dashed border-slate-200 bg-white/70 p-4">
                  <p className="text-xs text-muted-foreground">
                    Compatível com {"`Aparelho > Serviço = R$...`"} e também com linhas simples como {"`Aparelho = R$...`"}.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
            </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <PriceAnalyticsView slug={tableSlug} title={title || "Analytics de Preços"} />
        </TabsContent>
      </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminRetailerPriceTables;
