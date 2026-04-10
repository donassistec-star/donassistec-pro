import {
  RetailerPriceTableBrand,
  RetailerPriceTableCategory,
} from "@/services/retailerPriceTablesService";

const DEVICE_SERVICE_SEPARATOR_REGEX = /\s(?:>|\|)\s/;

const normalizeLabel = (value: string) => value.replace(/\s+/g, " ").trim();

export interface RetailerPriceTableStructuredService {
  name: string;
  priceText: string;
  priceValue: number | null;
}

export interface RetailerPriceTableStructuredDevice {
  name: string;
  services: RetailerPriceTableStructuredService[];
}

export interface RetailerPriceTableStructuredCategory {
  name: string;
  devices: RetailerPriceTableStructuredDevice[];
}

export const splitDeviceAndService = (value: string) => {
  const normalized = normalizeLabel(value);
  const match = normalized.match(DEVICE_SERVICE_SEPARATOR_REGEX);

  if (!match || match.index === undefined) {
    return {
      deviceName: normalized,
      serviceName: "Preco base",
    };
  }

  const separatorStart = match.index;
  const separatorEnd = separatorStart + match[0].length;
  const deviceName = normalizeLabel(normalized.slice(0, separatorStart));
  const serviceName = normalizeLabel(normalized.slice(separatorEnd));

  return {
    deviceName: deviceName || normalized,
    serviceName: serviceName || "Preco base",
  };
};

export const buildBrandsFromCategories = (
  categories: RetailerPriceTableCategory[] = []
): RetailerPriceTableBrand[] => {
  return categories
    .map((category) => {
      const deviceMap = new Map<
        string,
        {
          name: string;
          services: RetailerPriceTableBrand["devices"][number]["services"];
        }
      >();

      category.items.forEach((item) => {
        const { deviceName, serviceName } = splitDeviceAndService(item.name);
        const deviceKey = deviceName.toLowerCase();
        const currentDevice = deviceMap.get(deviceKey) || {
          name: deviceName,
          services: [],
        };

        currentDevice.services.push({
          name: serviceName,
          priceText: item.priceText,
          priceValue: item.priceValue,
        });

        deviceMap.set(deviceKey, currentDevice);
      });

      return {
        name: category.name,
        devices: Array.from(deviceMap.values()).filter((device) => device.services.length > 0),
      };
    })
    .filter((brand) => brand.devices.length > 0);
};

export const buildStructuredCategories = (
  categories: RetailerPriceTableCategory[] = []
): RetailerPriceTableStructuredCategory[] =>
  categories.map((category) => ({
    name: category.name,
    devices: buildBrandsFromCategories([category])[0]?.devices || [],
  }));

export const parsePriceValue = (priceText: string) => {
  const normalized = normalizeLabel(priceText);
  const match = normalized.match(/(\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?|\d+(?:[.,]\d{1,2})?)/);

  if (!match) return null;

  const value = Number(match[1].replace(/\./g, "").replace(",", "."));
  return Number.isFinite(value) ? value : null;
};

export const structuredCategoriesToFlatCategories = (
  categories: RetailerPriceTableStructuredCategory[] = []
): RetailerPriceTableCategory[] =>
  categories
    .map((category) => ({
      name: normalizeLabel(category.name),
      items: category.devices.flatMap((device) =>
        device.services
          .filter((service) => normalizeLabel(device.name) && normalizeLabel(service.name))
          .map((service) => {
            const normalizedDeviceName = normalizeLabel(device.name);
            const normalizedServiceName = normalizeLabel(service.name);
            const isBasePrice = normalizedServiceName.toLowerCase() === "preco base";

            return {
              name: isBasePrice
                ? normalizedDeviceName
                : `${normalizedDeviceName} > ${normalizedServiceName}`,
              priceText: normalizeLabel(service.priceText),
              priceValue: parsePriceValue(service.priceText),
            };
          }),
      ),
    }))
    .filter((category) => category.name && category.items.length > 0);

export const countBrandDevices = (brands: RetailerPriceTableBrand[] = []) =>
  brands.reduce((total, brand) => total + brand.devices.length, 0);

export const countBrandServices = (brands: RetailerPriceTableBrand[] = []) =>
  brands.reduce(
    (total, brand) =>
      total + brand.devices.reduce((deviceTotal, device) => deviceTotal + device.services.length, 0),
    0
  );
