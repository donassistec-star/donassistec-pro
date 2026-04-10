import { describe, expect, it } from "vitest";
import { validateRetailerPriceTable } from "../retailerPriceTableValidation";

describe("validateRetailerPriceTable", () => {
  it("accepts a valid visible table", () => {
    const result = validateRetailerPriceTable({
      title: "Polimentos",
      rawText: `Polimentos: 13/11/25

APPLE

iPhone 13 > Polimento = R$149,90`,
      visibleToRetailers: true,
      featuredToRetailers: false,
    });

    expect(result.issues).toEqual([]);
  });

  it("blocks publication when featured table is hidden", () => {
    const result = validateRetailerPriceTable({
      title: "Polimentos",
      rawText: `Polimentos

APPLE

iPhone 13 > Polimento = R$149,90`,
      visibleToRetailers: false,
      featuredToRetailers: true,
    });

    expect(result.issues.map((issue) => issue.label)).toContain(
      "Tabela principal precisa estar visível para lojistas"
    );
  });

  it("blocks visible table without categories", () => {
    const result = validateRetailerPriceTable({
      title: "Polimentos",
      rawText: "Polimentos",
      visibleToRetailers: true,
      featuredToRetailers: false,
    });

    expect(result.issues.map((issue) => issue.label)).toContain(
      "Cadastre ao menos uma categoria antes de publicar a tabela"
    );
  });

  it("blocks visible table with missing prices", () => {
    const result = validateRetailerPriceTable({
      title: "Polimentos",
      rawText: `Polimentos

APPLE

iPhone 13 > Polimento`,
      visibleToRetailers: true,
      featuredToRetailers: false,
    });

    expect(result.issues.map((issue) => issue.label)).toContain(
      "1 serviço(s) ainda estão sem preço e impedem a publicação"
    );
  });

  it("blocks visible table with invalid prices", () => {
    const result = validateRetailerPriceTable({
      title: "Polimentos",
      rawText: `Polimentos

APPLE

iPhone 13 > Polimento = sob consulta`,
      visibleToRetailers: true,
      featuredToRetailers: false,
    });

    expect(result.issues.map((issue) => issue.label)).toContain(
      "1 serviço(s) possuem preço inválido e impedem a publicação"
    );
  });

  it("allows hidden draft with pending prices", () => {
    const result = validateRetailerPriceTable({
      title: "Polimentos",
      rawText: `Polimentos

APPLE

iPhone 13 > Polimento`,
      visibleToRetailers: false,
      featuredToRetailers: false,
    });

    expect(result.issues).toEqual([]);
  });
});
