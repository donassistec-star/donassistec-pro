import { describe, expect, it } from "vitest";
import {
  buildBrandsFromCategories,
  buildStructuredCategories,
  parsePriceValue,
  splitDeviceAndService,
  structuredCategoriesToFlatCategories,
} from "@/utils/retailerPriceTable";

describe("retailerPriceTable utils", () => {
  it("keeps legacy lines as base price", () => {
    expect(splitDeviceAndService("Galaxy A15")).toEqual({
      deviceName: "Galaxy A15",
      serviceName: "Preco base",
    });
  });

  it("splits device and service using >", () => {
    expect(splitDeviceAndService("Galaxy A15 > Troca de Vidro")).toEqual({
      deviceName: "Galaxy A15",
      serviceName: "Troca de Vidro",
    });
  });

  it("groups services by brand and device", () => {
    const brands = buildBrandsFromCategories([
      {
        name: "SAMSUNG",
        items: [
          { name: "Galaxy A15 > Troca de Vidro", priceText: "R$100,00", priceValue: 100 },
          { name: "Galaxy A15 > Troca de Bateria", priceText: "R$80,00", priceValue: 80 },
        ],
      },
    ]);

    expect(brands).toHaveLength(1);
    expect(brands[0].devices).toHaveLength(1);
    expect(brands[0].devices[0].services.map((service) => service.name)).toEqual([
      "Troca de Vidro",
      "Troca de Bateria",
    ]);
  });

  it("builds structured categories with devices and services", () => {
    const categories = buildStructuredCategories([
      {
        name: "APPLE",
        items: [
          { name: "iPhone 11 > Troca de Vidro", priceText: "R$200,00", priceValue: 200 },
          { name: "iPhone 11 > Troca de Bateria", priceText: "R$150,00", priceValue: 150 },
        ],
      },
    ]);

    expect(categories).toHaveLength(1);
    expect(categories[0].devices).toHaveLength(1);
    expect(categories[0].devices[0].name).toBe("iPhone 11");
    expect(categories[0].devices[0].services.map((service) => service.name)).toEqual([
      "Troca de Vidro",
      "Troca de Bateria",
    ]);
  });

  it("converts structured categories back to flat categories", () => {
    const categories = structuredCategoriesToFlatCategories([
      {
        name: "SAMSUNG",
        devices: [
          {
            name: "Galaxy A15",
            services: [
              { name: "Troca de Vidro", priceText: "R$100,00", priceValue: null },
              { name: "Troca de Bateria", priceText: "R$80,00", priceValue: null },
            ],
          },
        ],
      },
    ]);

    expect(categories).toEqual([
      {
        name: "SAMSUNG",
        items: [
          { name: "Galaxy A15 > Troca de Vidro", priceText: "R$100,00", priceValue: 100 },
          { name: "Galaxy A15 > Troca de Bateria", priceText: "R$80,00", priceValue: 80 },
        ],
      },
    ]);
  });

  it("extracts numeric price values from formatted text", () => {
    expect(parsePriceValue("R$1.299,90")).toBe(1299.9);
    expect(parsePriceValue("sob consulta")).toBeNull();
  });
});
