import { useEffect, useMemo, useState, type ComponentType } from "react";
import {
  ArrowUp,
  Check,
  Copy,
  Cpu,
  FileText,
  Layers3,
  PackageSearch,
  Search,
  Smartphone,
  Star,
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
  countBrandDevices,
  countBrandServices,
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
    iconBg: "bg-primary/10",
    iconText: "text-primary",
    badge: "border-primary/20 bg-primary/5 text-primary",
    familyBadge: "border-primary/20 bg-white text-primary",
    chip: "border-primary/20 bg-primary/5 text-primary hover:bg-primary/10",
    price: "bg-primary/10 text-primary",
    dot: "bg-primary/70",
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
  const [title, setTitle] = useState("Tabela de Precos");
  const [effectiveDate, setEffectiveDate] = useState<string | null>(null);
  const [intro, setIntro] = useState<string[]>([]);
  const [brands, setBrands] = useState<RetailerPriceTableBrand[]>([]);
  const [activeBrand, setActiveBrand] = useState("Todas");
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
    setIntro(selectedTable.parsed_data.intro || []);
    setBrands(nextBrands);
    setSearch("");
    setActiveBrand("Todas");
  }, [selectedTable]);

  const filteredBrands = useMemo(() => {
    const query = search.trim().toLowerCase();
    const searchFiltered = !query
      ? brands
      : brands
      .map((brand) => ({
        ...brand,
        devices: brand.devices
          .map((device) => ({
            ...device,
            services: device.services.filter((service) =>
              `${brand.name} ${device.name} ${service.name} ${service.priceText}`.toLowerCase().includes(query)
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

    if (activeBrand === "Todas") return searchFiltered;
    return searchFiltered.filter((brand) => brand.name === activeBrand);
  }, [activeBrand, brands, search]);

  const brandTabs = useMemo(
    () => ["Todas", ...brands.map((brand) => brand.name)],
    [brands]
  );

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

  const totalDevices = useMemo(() => countBrandDevices(filteredBrands), [filteredBrands]);
  const totalServices = useMemo(() => countBrandServices(filteredBrands), [filteredBrands]);

  const handleCopyService = async (deviceName: string, serviceName: string, priceText: string) => {
    const value = [deviceName, serviceName, priceText].filter(Boolean).join(" - ");

    try {
      await navigator.clipboard.writeText(value);
      const key = `${deviceName}::${serviceName}::${priceText}`;
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
        <section className="relative overflow-hidden rounded-[32px] border border-sky-100 bg-[linear-gradient(135deg,rgba(255,255,255,1)_0%,rgba(239,246,255,1)_38%,rgba(224,231,255,1)_100%)] p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-8">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-sky-200/40 blur-3xl" />
          <div className="absolute -bottom-16 left-0 h-44 w-44 rounded-full bg-indigo-200/30 blur-3xl" />
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_260px]">
            <div className="relative z-10 space-y-4">
              <Badge className="border-primary/20 bg-primary/10 text-primary hover:bg-primary/10">
                Balcão de Preços
              </Badge>
              <div className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h1>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                  Consulte aparelhos e valores em um painel direto, pensado para resposta rápida durante atendimento e negociação.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {effectiveDate ? <Badge variant="outline">Atualizada em {effectiveDate}</Badge> : null}
                <Badge variant="outline">{allTables.length} tabela(s)</Badge>
                <Badge variant="outline">{filteredBrands.length} marca(s)</Badge>
                <Badge variant="outline">{deviceCatalog.length} aparelho(s)</Badge>
                <Badge variant="outline">{totalServices} servico(s)</Badge>
              </div>
            </div>

            <div className="relative z-10 rounded-[24px] border border-white/70 bg-white/80 p-5 backdrop-blur">
              <p className="text-sm font-semibold text-foreground">Modo de uso</p>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <p>1. Escolha a tabela certa para a negociação.</p>
                <p>2. Filtre por marca ou pesquise o aparelho.</p>
                <p>3. Compare serviços e valores no mesmo cartão.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="space-y-6">
            {!loading && allTables.length > 0 ? (
              <Card className="rounded-[28px] border-border/70 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers3 className="h-5 w-5 text-primary" />
                    Tabelas
                  </CardTitle>
                  <CardDescription>Troque a tabela ativa antes de consultar os valores.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {allTables.map((table) => {
                    const isActive = table.slug === (selectedTable?.slug || "");
                    return (
                      <button
                        key={table.slug}
                        type="button"
                        onClick={() => setSelectedSlug(table.slug)}
                        className={`w-full rounded-[22px] border p-4 text-left transition-all duration-200 ${
                          isActive
                            ? "border-primary bg-[linear-gradient(135deg,rgba(14,165,233,0.08),rgba(59,130,246,0.03))] shadow-[0_10px_28px_rgba(14,165,233,0.12)]"
                            : "border-border/70 bg-background hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted/20"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground">{table.title}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {table.effective_date ? `Atualizada em ${table.effective_date}` : "Sem data"}
                            </p>
                          </div>
                          {isActive ? <Badge>Ativa</Badge> : null}
                        </div>
                        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{getTableSummary(table)}</p>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            ) : null}

            {intro.length > 0 ? (
              <Card className="rounded-[28px] border-border/70 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Observações
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {intro.map((line, index) => (
                    <div key={`${line}-${index}`} className="rounded-[20px] border border-border/70 bg-[linear-gradient(135deg,rgba(248,250,252,1),rgba(241,245,249,0.8))] p-4 text-sm leading-6 text-muted-foreground">
                      {line}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}

            <Card className="rounded-[28px] border-border/70 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
              <CardHeader>
                <CardTitle>Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-[20px] border border-border/70 bg-[linear-gradient(135deg,rgba(248,250,252,1),rgba(241,245,249,0.75))] p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Marcas</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{filteredBrands.length}</p>
                </div>
                <div className="rounded-[20px] border border-border/70 bg-[linear-gradient(135deg,rgba(248,250,252,1),rgba(241,245,249,0.75))] p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Aparelhos</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{deviceCatalog.length}</p>
                </div>
                <div className="rounded-[20px] border border-border/70 bg-[linear-gradient(135deg,rgba(248,250,252,1),rgba(241,245,249,0.75))] p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Serviços</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{totalServices}</p>
                </div>
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
          </aside>

          <div className="space-y-6">
            <Card className="rounded-[28px] border-border/70 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
              <CardHeader>
                <CardTitle>Consulta</CardTitle>
                <CardDescription>Busque por aparelho, serviço ou marca e compare resultados no mesmo painel.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Ex.: A15, iPhone 13, troca de vidro..."
                    className="pl-10"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {brandTabs.map((brandName) => (
                    <Button
                      key={brandName}
                      type="button"
                      variant={activeBrand === brandName ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveBrand(brandName)}
                      className="rounded-full"
                    >
                      {brandName}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {loading ? (
              <Card className="rounded-[28px] border-border/70 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
                <CardContent className="py-10 text-center text-muted-foreground">Carregando tabela de precos...</CardContent>
              </Card>
            ) : deviceCatalog.length === 0 ? (
              <Card className="rounded-[28px] border-border/70 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
                <CardContent className="py-14 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Search className="h-6 w-6" />
                  </div>
                  <p className="mt-4 text-base font-medium text-foreground">Nenhum resultado encontrado</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Ajuste a busca ou troque a marca para encontrar outro aparelho ou serviço.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
                {deviceCatalog.map(({ key, brand, device }) => {
                  const identity = getDeviceIdentity(brand.name, device.name);
                  const theme = getBrandTheme(brand.name, device.name);
                  const Icon = identity.icon;
                  const lowestPrice = getLowestPriceValue(device.services);

                  return (
                    <Card key={key} className="overflow-hidden rounded-[28px] border-border/70 shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(15,23,42,0.12)] animate-in fade-in-0 slide-in-from-bottom-1">
                      <CardHeader className="border-b border-border/60 bg-[linear-gradient(135deg,rgba(248,250,252,1),rgba(255,255,255,1))]">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-[20px] ${theme.iconBg} ${theme.iconText}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <CardTitle className="text-xl">{device.name}</CardTitle>
                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <Badge variant="outline" className={`${theme.familyBadge} gap-1`}>
                                  <Icon className="h-3.5 w-3.5" />
                                  {identity.label}
                                </Badge>
                                <CardDescription>
                                  {brand.name} • {device.services.length} servico(s)
                                </CardDescription>
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline" className={`${theme.badge} shadow-sm`}>
                            {brand.name}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {device.services.map((service, index) => (
                          (() => {
                            const serviceKey = `${device.name}::${service.name}::${service.priceText}`;
                            const isCopied = copiedServiceKey === serviceKey;
                            const isLowest =
                              lowestPrice !== null &&
                              service.priceValue !== null &&
                              service.priceValue === lowestPrice;

                            return (
                              <div
                                key={`${key}-${service.name}-${index}`}
                                className={`flex items-center justify-between gap-3 rounded-[18px] border px-4 py-3 transition-colors hover:bg-white ${
                                  isLowest
                                    ? "border-emerald-200 bg-[linear-gradient(135deg,rgba(236,253,245,1),rgba(255,255,255,1))]"
                                    : "border-border/60 bg-[linear-gradient(135deg,rgba(248,250,252,1),rgba(255,255,255,1))]"
                                }`}
                              >
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-medium text-foreground">{service.name}</p>
                                    {isLowest ? (
                                      <Badge className="bg-emerald-500 text-white hover:bg-emerald-500">
                                        Melhor valor
                                      </Badge>
                                    ) : null}
                                  </div>
                                  <p className="text-xs text-muted-foreground">{brand.name}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`inline-flex shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${theme.price}`}>
                                    {service.priceText || "-"}
                                  </span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 shrink-0"
                                    onClick={() => handleCopyService(device.name, service.name, service.priceText || "-")}
                                    title="Copiar serviço e preço"
                                  >
                                    {isCopied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                                  </Button>
                                </div>
                              </div>
                            );
                          })()
                        ))}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </RetailerLayout>
  );
};

export default RetailerPriceTables;
