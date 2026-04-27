export interface RetailerPriceTableItem {
  name: string;
  priceText: string;
  priceValue: number | null;
}

export interface RetailerPriceTableCategory {
  name: string;
  items: RetailerPriceTableItem[];
}

export interface RetailerPriceTableDeviceService {
  name: string;
  priceText: string;
  priceValue: number | null;
}

export interface RetailerPriceTableDevice {
  name: string;
  services: RetailerPriceTableDeviceService[];
}

export interface RetailerPriceTableBrand {
  name: string;
  devices: RetailerPriceTableDevice[];
}

export interface ParsedRetailerPriceTable {
  title: string;
  effectiveDate?: string | null;
  intro: string[];
  categories: RetailerPriceTableCategory[];
  brands: RetailerPriceTableBrand[];
}

const CATEGORY_LINE_REGEX =
  /^(?:[\p{Extended_Pictographic}\s]*)?[A-ZÀ-Ý0-9][A-ZÀ-Ý0-9\s./()+-]*?(?:[\p{Extended_Pictographic}\s]*)?$|^>[^<]+<$/u;

const ITEM_LINE_REGEX = /=/;

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, " ").trim();

const normalizeCategoryName = (line: string) =>
  normalizeWhitespace(line.replace(/[>📱]/g, "").replace(/\s{2,}/g, " "));

const splitDeviceAndService = (value: string) => {
  const normalized = normalizeWhitespace(value);
  const match = normalized.match(/\s(?:>|\|)\s/);

  if (!match || match.index === undefined) {
    return {
      deviceName: normalized,
      serviceName: "Preco base",
    };
  }

  const separatorStart = match.index;
  const separatorEnd = separatorStart + match[0].length;
  const deviceName = normalizeWhitespace(normalized.slice(0, separatorStart));
  const serviceName = normalizeWhitespace(normalized.slice(separatorEnd));

  return {
    deviceName: deviceName || normalized,
    serviceName: serviceName || "Preco base",
  };
};

const buildBrands = (categories: RetailerPriceTableCategory[]): RetailerPriceTableBrand[] =>
  categories
    .map((category) => {
      const devices = new Map<string, RetailerPriceTableDevice>();

      category.items.forEach((item) => {
        const { deviceName, serviceName } = splitDeviceAndService(item.name);
        const deviceKey = deviceName.toLowerCase();
        const currentDevice = devices.get(deviceKey) || {
          name: deviceName,
          services: [],
        };

        currentDevice.services.push({
          name: serviceName,
          priceText: item.priceText,
          priceValue: item.priceValue,
        });

        devices.set(deviceKey, currentDevice);
      });

      return {
        name: category.name,
        devices: Array.from(devices.values()).filter((device) => device.services.length > 0),
      };
    })
    .filter((brand) => brand.devices.length > 0);

const parsePriceValue = (priceText: string): number | null => {
  const match = priceText.match(/(\d+(?:[.,]\d{1,2})?)/);
  if (!match) return null;

  const normalized = match[1].replace(".", "").replace(",", ".");
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
};

export const parseRetailerPriceTable = (rawText: string): ParsedRetailerPriceTable => {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const firstLine = lines[0] || "Tabela de Preços";
  const titleMatch = firstLine.match(/^(.*?)(?::\s*([0-9]{2}\/[0-9]{2}\/[0-9]{2,4}))?$/);
  const inferredTitle = normalizeWhitespace(titleMatch?.[1] || firstLine);
  const inferredDate = titleMatch?.[2] || null;

  const intro: string[] = [];
  const categories: RetailerPriceTableCategory[] = [];
  let currentCategory: RetailerPriceTableCategory | null = null;

  for (let index = 1; index < lines.length; index += 1) {
    const line = lines[index];

    if (!currentCategory && !ITEM_LINE_REGEX.test(line) && !CATEGORY_LINE_REGEX.test(line)) {
      intro.push(line);
      continue;
    }

    if (CATEGORY_LINE_REGEX.test(line) && !ITEM_LINE_REGEX.test(line)) {
      currentCategory = {
        name: normalizeCategoryName(line),
        items: [],
      };
      categories.push(currentCategory);
      continue;
    }

    if (ITEM_LINE_REGEX.test(line)) {
      if (!currentCategory) {
        currentCategory = { name: "Geral", items: [] };
        categories.push(currentCategory);
      }

      const [rawName, ...rest] = line.split("=");
      const name = normalizeWhitespace(rawName);
      const priceText = normalizeWhitespace(rest.join("=")).replace(/^\$\s*/, "R$");

      if (!name || !priceText) continue;

      currentCategory.items.push({
        name,
        priceText,
        priceValue: parsePriceValue(priceText),
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
    brands: buildBrands(categories.filter((category) => category.items.length > 0)),
  };
};
