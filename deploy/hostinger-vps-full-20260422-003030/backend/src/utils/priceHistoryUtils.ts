import { ParsedRetailerPriceTable, RetailerPriceTableCategory } from "../utils/retailerPriceTableParser";

export interface PriceHistoryRecord {
  id: number;
  table_id: number;
  date: string;
  service_key: string;
  service_name: string;
  old_price: number | null;
  new_price: number;
  price_change_percent: number | null;
  price_change_amount: number | null;
  admin_user_id?: number | null;
  change_source?: string | null;
  notes?: string | null;
  recorded_at: string;
}

export interface PriceChangeReport {
  date: string;
  services_changed: number;
  price_increases: number;
  price_decreases: number;
  avg_change_percent: number;
  total_increase_amount: number;
  total_decrease_amount: number;
}

export interface ServicePriceVariance {
  service_key: string;
  service_name: string;
  change_count: number;
  avg_price: number;
  min_price: number;
  max_price: number;
  price_range: number;
  volatility_percent: number;
  last_changed: string;
  first_recorded: string;
}

export interface PriceTrendPoint {
  date: string;
  price: number;
  change_percent?: number;
}

/**
 * Normaliza nome de serviço para chave única
 * Ex: "Samsung A15 > Troca de Vidro" → "samsung_a15_troca_de_vidro"
 */
export function normalizeServiceKey(serviceName: string): string {
  return serviceName
    .toLowerCase()
    .replace(/[àáäâ]/g, "a")
    .replace(/[èéëê]/g, "e")
    .replace(/[ìíïî]/g, "i")
    .replace(/[òóöô]/g, "o")
    .replace(/[ùúüû]/g, "u")
    .replace(/[ç]/g, "c")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

/**
 * Extrai mapa de preços atuais da tabela parseada
 */
export function extractPricesFromParsed(parsed: ParsedRetailerPriceTable): Map<string, number> {
  const prices = new Map<string, number>();

  if (!parsed.categories) return prices;

  parsed.categories.forEach((category: RetailerPriceTableCategory) => {
    category.items?.forEach((item) => {
      if (item.priceValue !== null) {
        const key = normalizeServiceKey(item.name);
        prices.set(key, item.priceValue);
      }
    });
  });

  return prices;
}

/**
 * Calcula mudança percentual de preço
 */
export function calculatePriceChange(oldPrice: number | null, newPrice: number): {
  changePercent: number | null;
  changeAmount: number | null;
} {
  if (oldPrice === null) {
    return { changePercent: null, changeAmount: null };
  }

  const changeAmount = newPrice - oldPrice;
  const changePercent = (changeAmount / oldPrice) * 100;

  return {
    changePercent: parseFloat(changePercent.toFixed(2)),
    changeAmount: parseFloat(changeAmount.toFixed(2)),
  };
}

/**
 * Compara dois snapshots de preços para gerar histórico
 */
export function compareSnapshots(
  oldPrices: Map<string, number>,
  newPrices: Map<string, number>,
  oldParsed: ParsedRetailerPriceTable | null,
  newParsed: ParsedRetailerPriceTable
): PriceHistoryRecord[] {
  const changes: PriceHistoryRecord[] = [];
  const today = new Date().toISOString().split("T")[0];

  // Criar mapa de nomes de serviços
  const serviceNamesMap = new Map<string, string>();

  if (newParsed.categories) {
    newParsed.categories.forEach((category: RetailerPriceTableCategory) => {
      category.items?.forEach((item) => {
        const key = normalizeServiceKey(item.name);
        serviceNamesMap.set(key, item.name);
      });
    });
  }

  // Processar todos os serviços novos ou modificados
  newPrices.forEach((newPrice, key) => {
    const oldPrice = oldPrices.get(key) ?? null;

    // Só registra se preço mudou ou é novo
    if (oldPrice === null || oldPrice !== newPrice) {
      const { changePercent, changeAmount } = calculatePriceChange(oldPrice, newPrice);
      const serviceName = serviceNamesMap.get(key) || key;

      changes.push({
        id: 0, // Será inserido no DB
        table_id: 0, // Será preenchido no controller
        date: today,
        service_key: key,
        service_name: serviceName,
        old_price: oldPrice,
        new_price: newPrice,
        price_change_percent: changePercent,
        price_change_amount: changeAmount,
        recorded_at: new Date().toISOString(),
      });
    }
  });

  return changes;
}
