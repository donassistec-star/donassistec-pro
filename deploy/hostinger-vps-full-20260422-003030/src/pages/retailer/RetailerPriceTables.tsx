import { useEffect, useMemo, useState, type ComponentType } from "react";
import {
  Check,
  Copy,
  Cpu,
  Layers3,
  PackageSearch,
  Search,
  Smartphone,
  Tablet,
  Watch,
  type LucideProps,
} from "lucide-react";
import {
  AndroidIcon,
  AppleIcon,
} from "@/components/icons/BrandIcons";
import RetailerLayout from "@/components/retailer/RetailerLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  RetailerPriceTableBrand,
  RetailerPriceTableCategory,
  retailerPriceTablesService,
} from "@/services/retailerPriceTablesService";
import {
  buildBrandsFromCategories,
} from "@/utils/retailerPriceTable";
import { toast } from "sonner";

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

type BrandIconComponent = ComponentType<LucideProps>;

type DeviceIdentity = {
  key: "apple" | "android" | "watch" | "tablet" | "parts" | "tech" | "generic";
  label: string;
  icon: BrandIconComponent;
};

const getDeviceIdentity = (brandName: string, deviceName: string): DeviceIdentity => {
  const normalizedBrand = brandName.toLowerCase();
  const normalizedDevice = deviceName.toLowerCase();
  const normalized = `${normalizedBrand} ${normalizedDevice}`;

  if (normalized.includes("watch")) {
    return { key: "watch", label: "Watch", icon: Watch };
  }

  if (normalized.includes("tablet") || normalized.includes("ipad") || normalized.includes("tab")) {
    return { key: "tablet", label: "Tablet", icon: Tablet };
  }

  if (normalized.includes("iphone") || normalized.includes("ios") || normalized.includes("apple")) {
    return { key: "apple", label: "Apple", icon: AppleIcon };
  }

  if (normalized.includes("traseiro")) {
    return { key: "parts", label: "Pecas", icon: PackageSearch };
  }

  if (normalized.includes("asus")) {
    return { key: "tech", label: "Tech", icon: Cpu };
  }

  if (
    normalized.includes("android") ||
    normalized.includes("samsung") ||
    normalized.includes("motorola") ||
    normalized.includes("xiaomi") ||
    normalized.includes("redmi") ||
    normalized.includes("poco") ||
    normalized.includes("huawei") ||
    normalized.includes("lg")
  ) {
    return { key: "android", label: "Android", icon: AndroidIcon };
  }

  return { key: "generic", label: "Mobile", icon: Smartphone };
};

const getBrandTheme = (brandName: string, deviceName: string) => {
  const normalized = `${brandName.toLowerCase()} ${deviceName.toLowerCase()}`;
  const identity = getDeviceIdentity(brandName, deviceName);

  if (identity.key === "android" || normalized.includes("samsung")) {
    return {
      iconBg: "bg-blue-500/10",
      iconText: "text-blue-600",
      badge: "border-blue-200 bg-blue-50 text-blue-700",
      familyBadge: "border-blue-200 bg-white text-blue-700",
      chip: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
      price: "bg-blue-500/10 text-blue-700",
      dot: "bg-blue-500/70",
    };
  }

  if (identity.key === "apple") {
    return {
      iconBg: "bg-slate-500/10",
      iconText: "text-slate-700",
      badge: "border-slate-200 bg-slate-50 text-slate-700",
      familyBadge: "border-slate-200 bg-white text-slate-700",
      chip: "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100",
      price: "bg-slate-500/10 text-slate-700",
      dot: "bg-slate-500/70",
    };
  }

  if (normalized.includes("motorola") || normalized.includes("xiaomi")) {
    return {
      iconBg: "bg-indigo-500/10",
      iconText: "text-indigo-600",
      badge: "border-indigo-200 bg-indigo-50 text-indigo-700",
      familyBadge: "border-indigo-200 bg-white text-indigo-700",
      chip: "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
      price: "bg-indigo-500/10 text-indigo-700",
      dot: "bg-indigo-500/70",
    };
  }

  if (identity.key === "tablet") {
    return {
      iconBg: "bg-cyan-500/10",
      iconText: "text-cyan-600",
      badge: "border-cyan-200 bg-cyan-50 text-cyan-700",
      familyBadge: "border-cyan-200 bg-white text-cyan-700",
      chip: "border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100",
      price: "bg-cyan-500/10 text-cyan-700",
      dot: "bg-cyan-500/70",
    };
  }

  if (identity.key === "watch") {
    return {
      iconBg: "bg-emerald-500/10",
      iconText: "text-emerald-600",
      badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
      familyBadge: "border-emerald-200 bg-white text-emerald-700",
      chip: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
      price: "bg-emerald-500/10 text-emerald-700",
      dot: "bg-emerald-500/70",
    };
  }

  return {
    iconBg: "bg-slate-100",
    iconText: "text-slate-700",
    badge: "border-slate-200 bg-slate-100 text-slate-800",
    familyBadge: "border-slate-200 bg-white text-slate-800",
    chip: "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200",
    price: "bg-slate-100 text-slate-800",
    dot: "bg-slate-500",
  };
};

const getLowestPriceValue = (
  services: { priceValue: number | null; priceText: string }[] = []
) => {
  const values = services
    .map((service) => service.priceValue)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));

  if (!values.length) return null;
  return Math.min(...values);
};

const isBasePriceService = (serviceName: string) => {
  const normalized = serviceName.trim().toLowerCase();
  return normalized === "preco base" || normalized === "preço base";
};

const normalizePriceText = (priceText: string) =>
  priceText
    .trim()
    .replace(/^(?:a partir(?: de)?\s*)/i, "")
    .trim();

const getTableSummary = (table: { parsed_data: { intro: string[] } }) =>
  table.parsed_data?.intro?.find((line) => line.trim().length > 0) ||
  "Tabela organizada para consulta rapida durante o atendimento.";

type RetailerSortMode = "relevance" | "device" | "price";

const RetailerPriceTables = () => {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("Tabela de Precos");
  const [effectiveDate, setEffectiveDate] = useState<string | null>(null);
  const [brands, setBrands] = useState<RetailerPriceTableBrand[]>([]);
  const [sortMode, setSortMode] = useState<RetailerSortMode>("relevance");
  const [copiedServiceKey, setCopiedServiceKey] = useState("");
  const [allTables, setAllTables] = useState<Array<{
    slug: string;
    title: string;
    effective_date: string | null;
    featured_to_retailers?: boolean;
    parsed_data: {
      intro: string[];
      categories: RetailerPriceTableCategory[];
      brands?: RetailerPriceTableBrand[];
    };
  }>>([]);
  const [selectedSlug, setSelectedSlug] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const records = await retailerPriceTablesService.listRetailer();

      if (!records.length) {
        toast.error("Tabela de precos indisponivel no momento");
        setLoading(false);
        return;
      }

      setAllTables(records);
      setSelectedSlug(
        records.find((record) => record.featured_to_retailers)?.slug ||
          records.find((record) => record.slug === "tabela-vidros")?.slug ||
          records[0].slug
      );
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

    const nextBrands =
      selectedTable.parsed_data.brands && selectedTable.parsed_data.brands.length > 0
        ? selectedTable.parsed_data.brands
        : buildBrandsFromCategories(selectedTable.parsed_data.categories || []);

    setTitle(selectedTable.title);
    setEffectiveDate(selectedTable.effective_date);
    setBrands(nextBrands);
    setSearch("");
  }, [selectedTable]);

  const normalizedSearchQuery = search.trim().toLowerCase();
  const hasActiveSearch = normalizedSearchQuery.length > 0;

  const filteredBrands = useMemo(() => {
    const query = normalizedSearchQuery;
    return !query
      ? brands
      : brands
          .map((brand) => ({
            ...brand,
            devices: brand.devices
              .map((device) => ({
                ...device,
                services: device.services.filter((service) =>
                  `${brand.name} ${device.name} ${service.name} ${service.priceText}`
                    .toLowerCase()
                    .includes(query)
                ),
              }))
              .filter(
                (device) =>
                  device.name.toLowerCase().includes(query) ||
                  device.services.length > 0 ||
                  brand.name.toLowerCase().includes(query)
              ),
          }))
          .filter((brand) => brand.devices.length > 0 || brand.name.toLowerCase().includes(query));
  }, [brands, normalizedSearchQuery]);

  const deviceCatalog = useMemo(
    () =>
      filteredBrands.flatMap((brand) =>
        brand.devices.map((device) => ({
          key: `${brand.name}::${device.name}`,
          brand,
          device,
        }))
      ),
    [filteredBrands]
  );

  const groupedDeviceCatalog = useMemo(
    () =>
      filteredBrands.map((brand) => {
        const devices = [...brand.devices];

        if (sortMode === "device") {
          devices.sort((left, right) => left.name.localeCompare(right.name, "pt-BR"));
        } else if (sortMode === "price") {
          devices.sort((left, right) => {
            const leftValue = getLowestPriceValue(left.services) ?? Number.POSITIVE_INFINITY;
            const rightValue = getLowestPriceValue(right.services) ?? Number.POSITIVE_INFINITY;
            if (leftValue !== rightValue) return leftValue - rightValue;
            return left.name.localeCompare(right.name, "pt-BR");
          });
        }

        return {
          brand,
          devices: devices.map((device) => ({
            key: `${brand.name}::${device.name}`,
            device,
          })),
        };
      }),
    [filteredBrands, sortMode]
  );

  const jumpToBrandGroup = (brandName: string) => {
    const target = document.getElementById(`brand-group-${slugify(brandName)}`);
    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCopyService = async (deviceName: string, serviceName: string, priceText: string) => {
    const normalizedPriceText = normalizePriceText(priceText);
    const value = [deviceName, serviceName, normalizedPriceText].filter(Boolean).join(" - ");

    try {
      await navigator.clipboard.writeText(value);
      const key = `${deviceName}::${serviceName}::${normalizedPriceText}`;
      setCopiedServiceKey(key);
      window.setTimeout(() => {
        setCopiedServiceKey((current) => (current === key ? "" : current));
      }, 1600);
      toast.success("Servico copiado");
    } catch {
      toast.error("Nao foi possivel copiar");
    }
  };

  return (

    <RetailerLayout>
      <div className="space-y-6">
        {/* Cabeçalho profissional */}
        <section className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-4 shadow-[0_12px_35px_rgba(15,23,42,0.06)] sm:p-6 md:p-8 lg:p-10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-sky-200/30 blur-3xl dark:bg-sky-900/20" />
          <div className="absolute -bottom-16 left-0 h-44 w-44 rounded-full bg-sky-300/20 blur-3xl dark:bg-sky-900/10" />
          <div className="grid gap-8 md:grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px]">
            <div className="relative z-10 space-y-5">
              <Badge className="border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-100">
                Balcão de Preços
              </Badge>
              <div className="space-y-3">
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">{title}</h1>
                <p className="max-w-2xl text-base leading-6 text-slate-600 dark:text-slate-300">
                  Consulte aparelhos e valores em um painel direto, pensado para resposta rápida durante atendimento e negociação.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                {effectiveDate ? <span>Atualizada em {effectiveDate}</span> : null}
                <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-100">{allTables.length} tabela(s)</span>
                <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-100">{filteredBrands.length} marca(s)</span>
                <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-100">{deviceCatalog.length} aparelho(s)</span>
              </div>
            </div>
            <div className="relative z-10 rounded-[24px] border border-sky-200/80 bg-white/90 p-6 shadow-md dark:border-sky-800/80 dark:bg-slate-950/90">
              <p className="text-base font-bold text-sky-900 dark:text-sky-100">Como usar</p>
              <div className="mt-3 grid gap-2 text-sm text-slate-700 dark:text-slate-300 sm:grid-cols-1">
                <p>1. Selecione a tabela certa para o atendimento.</p>
                <p>2. Filtre por marca ou pesquise o modelo.</p>
                <p>3. Compare preços e copie com um clique.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)]">
          {/* Painel lateral profissional */}
          <aside className="space-y-5 md:max-w-full xl:max-w-[280px]">
            {!loading && allTables.length > 0 ? (
              <Card className="rounded-[24px] border-sky-200/70 shadow-md dark:border-sky-800/70">
                <CardHeader className="pb-0">
                  <div className="flex items-center gap-2">
                    <Layers3 className="h-5 w-5 text-sky-700 dark:text-sky-200" />
                    <CardTitle className="text-base text-sky-900 dark:text-sky-100">Tabelas</CardTitle>
                  </div>
                  <CardDescription className="text-slate-600 dark:text-slate-300">Selecione a tabela que será usada na busca.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  {allTables.map((table) => {
                    const isActive = table.slug === (selectedTable?.slug || "");
                    return (
                      <button
                        key={table.slug}
                        type="button"
                        onClick={() => setSelectedSlug(table.slug)}
                        className={`w-full rounded-[18px] border px-3 py-3 text-left transition-shadow duration-200 ${
                          isActive
                            ? "border-sky-500 bg-sky-50 shadow-sm dark:border-sky-700 dark:bg-sky-900"
                            : "border-sky-200/70 bg-white hover:border-sky-300 hover:shadow-sm dark:border-sky-800/70 dark:bg-slate-950 dark:hover:border-sky-600"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-sky-900 dark:text-sky-100">{table.title}</p>
                            <p className="mt-0.5 text-[11px] text-sky-600 dark:text-sky-300">
                              {table.effective_date ? `Atualizada em ${table.effective_date}` : "Sem data"}
                            </p>
                          </div>
                          {isActive ? (
                            <span className="inline-flex rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-800 dark:bg-sky-800 dark:text-sky-100">
                              Ativa
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm text-sky-700 dark:text-sky-200">{getTableSummary(table)}</p>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            ) : null}
          </aside>

          <div className="space-y-6">
            {/* Filtros e busca profissional */}
            <Card className="rounded-[20px] border-sky-200/70 shadow-lg dark:border-sky-800/70">
              <CardHeader>
                <CardTitle className="text-sky-900 dark:text-sky-100">Consulta</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-300">Busque por aparelho, serviço ou marca e consulte tudo em cards organizados para atendimento.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 bg-gradient-to-br from-sky-50/80 via-white/90 to-slate-100/80 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-400 dark:text-sky-600" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Ex.: A15, iPhone 13, troca de vidro..."
                    className="h-11 rounded-[16px] border-sky-200 bg-white pl-10 text-base shadow-md dark:border-sky-800 dark:bg-slate-950 dark:text-sky-100"
                  />
                </div>
                <div className="flex flex-col gap-2 rounded-[20px] border border-sky-200/80 bg-white p-3 shadow-sm dark:border-sky-800/80 dark:bg-slate-950 md:flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="mb-2 md:mb-0">
                    <p className="text-sm font-semibold text-sky-900 dark:text-sky-100">Consulta em cards</p>
                    <p className="text-xs text-sky-600 dark:text-sky-300">
                      Aparelhos agrupados por marca para consulta mais rápida.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 md:justify-start">
                    <Badge variant="outline" className="border-sky-200 text-sky-700 dark:border-sky-800 dark:text-sky-100">{deviceCatalog.length} aparelho(s)</Badge>
                    <select
                      value={sortMode}
                      onChange={(e) => setSortMode(e.target.value as RetailerSortMode)}
                      className="h-9 rounded-md border border-sky-200 bg-white px-3 text-sm shadow-sm dark:border-sky-800 dark:bg-slate-950 dark:text-sky-100"
                    >
                      <option value="relevance">Ordenar: relevância</option>
                      <option value="device">Ordenar: aparelho</option>
                      <option value="price">Ordenar: menor preço</option>
                    </select>
                  </div>
                </div>
                {groupedDeviceCatalog.length > 1 ? (
                  <div className="rounded-[22px] border border-sky-200/80 bg-sky-50 p-3 text-sm text-sky-700 shadow-sm dark:border-sky-800/80 dark:bg-sky-950 dark:text-sky-200 md:flex md:flex-col md:gap-2">
                    <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <p className="font-semibold text-sky-900 dark:text-sky-100">Navegação por marca</p>
                      <span className="text-xs text-sky-600 dark:text-sky-300">Salte para a marca desejada</span>
                    </div>
                    <div className="flex flex-wrap gap-2 md:gap-1 md:justify-start">
                      {groupedDeviceCatalog.map((group) => (
                        <button
                          key={`jump-${group.brand.name}`}
                          type="button"
                          onClick={() => jumpToBrandGroup(group.brand.name)}
                          className="rounded-full border border-sky-200 bg-white px-3 py-1 text-xs font-medium text-sky-700 hover:bg-sky-50 dark:border-sky-800 dark:bg-slate-950 dark:text-sky-200 dark:hover:bg-sky-900"
                          style={{ minWidth: 90, marginBottom: 4 }}
                        >
                          {group.brand.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {loading ? (
              <Card className="rounded-[28px] border-border/70 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
                <CardContent className="py-10 text-center text-muted-foreground">Carregando tabela de precos...</CardContent>
              </Card>
            ) : deviceCatalog.length === 0 ? (
              <Card className="rounded-[28px] border-border/70 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
                <CardContent className="py-14 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                    <Search className="h-6 w-6" />
                  </div>
                  <p className="mt-4 text-base font-medium text-foreground">Nenhum resultado encontrado</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Ajuste a busca para encontrar outro aparelho ou serviço.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-5">
                {groupedDeviceCatalog.map((group) => (
                  <Card
                    key={group.brand.name}
                    id={`brand-group-${slugify(group.brand.name)}`}
                    className="overflow-hidden rounded-[30px] border-border/70 shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
                  >
                    <CardHeader className="border-b border-slate-200/70 bg-slate-50/95 dark:border-slate-800/80 dark:bg-slate-950/85">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <CardTitle className="text-xl text-slate-900 dark:text-slate-100">{group.brand.name}</CardTitle>
                          <CardDescription className="text-slate-600 dark:text-slate-400">
                            {group.devices.length} aparelho(s) • {group.devices.reduce((total, item) => total + item.device.services.length, 0)} serviço(s)
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(248,250,252,0.9))] p-4 sm:p-5">
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3">
                        {group.devices.map(({ key, device }) => {
                          const brand = group.brand;
                          const identity = getDeviceIdentity(brand.name, device.name);
                          const theme = getBrandTheme(brand.name, device.name);
                          const Icon = identity.icon;
                          const lowestPrice = getLowestPriceValue(device.services);
                          const deviceMatchesQuery =
                            hasActiveSearch &&
                            `${brand.name} ${device.name}`.toLowerCase().includes(normalizedSearchQuery);
                          const onlySingleService = device.services.length === 1;
                          const singleService = onlySingleService ? device.services[0] : null;
                          const singleServiceDisplayName =
                            singleService && isBasePriceService(singleService.name)
                              ? "Preço base"
                              : singleService?.name || "";

                          const basePriceServices = device.services.filter((service) =>
                            isBasePriceService(service.name)
                          );
                          const displayService = basePriceServices[0] || device.services[0] || null;
                          const displayServiceName = displayService
                            ? isBasePriceService(displayService.name)
                              ? "Preço base"
                              : displayService.name
                            : "Serviço indisponível";
                          const displayServicePrice = displayService
                            ? normalizePriceText(displayService.priceText)
                            : "-";
                          const serviceKey = displayService
                            ? `${device.name}::${displayService.name}::${displayServicePrice}`
                            : `${device.name}::empty`;
                          const isCopied = copiedServiceKey === serviceKey;
                          const serviceMatchesQuery =
                            hasActiveSearch &&
                            displayService &&
                            `${displayService.name} ${displayService.priceText}`.toLowerCase().includes(normalizedSearchQuery);

                          return (
                            <Card
                              key={key}
                              className={`overflow-hidden rounded-[28px] border-2 border-sky-100 bg-gradient-to-br from-white via-sky-50 to-slate-100 shadow-2xl transition duration-200 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(56,189,248,0.18)]
                                dark:border-sky-700 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 dark:shadow-[0_8px_32px_rgba(56,189,248,0.10)]
                                ${deviceMatchesQuery ? "ring-2 ring-sky-300/70 dark:ring-sky-400/60" : ""}`}
                            >
                              <CardHeader className="bg-sky-50/80 px-4 py-4 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
                                <div className="flex items-center justify-between gap-4">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-sky-400/70 via-sky-600/60 to-sky-900/60 shadow-lg ring-2 ring-white/30 dark:from-sky-700/80 dark:via-sky-900/80 dark:to-slate-950/80 dark:ring-sky-400/20">
                                      <Icon className="h-8 w-8 text-white drop-shadow-[0_2px_8px_rgba(56,189,248,0.45)] dark:text-sky-200" />
                                    </div>
                                    <div className="min-w-0">
                                      <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                        {device.name}
                                      </CardTitle>
                                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                        <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 dark:border-slate-700 dark:bg-slate-800">
                                          {identity.label}
                                        </span>
                                        <span className="rounded-full border border-sky-300 bg-sky-50 px-2.5 py-1 font-bold text-sky-700 dark:border-sky-700 dark:bg-sky-900 dark:text-sky-100">
                                          1 serviço
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {deviceMatchesQuery ? (
                                    <span className="inline-flex rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-700/70 dark:text-slate-100">
                                      Resultado
                                    </span>
                                  ) : null}
                                </div>
                              </CardHeader>

                              <CardContent className="px-4 py-5">
                                <div
                                  className={`rounded-[20px] border-2 border-sky-100 bg-gradient-to-br from-white via-sky-50 to-slate-100 p-4 shadow-md
                                    dark:border-sky-700 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 dark:shadow-[0_4px_24px_rgba(56,189,248,0.10)]
                                    ${serviceMatchesQuery ? "ring-2 ring-sky-200/80 dark:ring-sky-400/60" : ""}`}
                                >
                                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-500 dark:text-sky-200 drop-shadow">
                                        Serviço principal
                                      </p>
                                      <p className="mt-2 text-lg font-extrabold text-sky-900 dark:text-white drop-shadow">
                                        {displayServiceName}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <p className="text-3xl font-extrabold text-sky-700 dark:text-sky-300 drop-shadow">
                                        {displayServicePrice || "-"}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </RetailerLayout>
  );
};

export default RetailerPriceTables;
