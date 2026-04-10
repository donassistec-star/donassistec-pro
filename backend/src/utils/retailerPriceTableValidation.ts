import { parseRetailerPriceTable } from "./retailerPriceTableParser";

export interface RetailerPriceTableValidationIssue {
  label: string;
  tone: "error" | "warning";
}

export interface RetailerPriceTableValidationResult {
  issues: RetailerPriceTableValidationIssue[];
  parsedTitle: string;
  totalItems: number;
  missingPriceCount: number;
  invalidPriceCount: number;
}

interface ValidateRetailerPriceTableInput {
  title?: string;
  rawText: string;
  visibleToRetailers: boolean;
  featuredToRetailers: boolean;
}

export const validateRetailerPriceTable = ({
  title,
  rawText,
  visibleToRetailers,
  featuredToRetailers,
}: ValidateRetailerPriceTableInput): RetailerPriceTableValidationResult => {
  const normalizedTitle = typeof title === "string" ? title.trim() : "";
  const parsed = parseRetailerPriceTable(rawText);
  const parsedTitle = parsed.title?.trim() || "";
  const totalItems = parsed.categories.reduce((total, category) => total + category.items.length, 0);
  const missingPriceCount = parsed.categories.reduce(
    (total, category) =>
      total + category.items.filter((item) => item.priceText.trim().length === 0).length,
    0
  );
  const invalidPriceCount = parsed.categories.reduce(
    (total, category) =>
      total +
      category.items.filter(
        (item) => item.priceText.trim().length > 0 && item.priceValue === null
      ).length,
    0
  );

  const issues: RetailerPriceTableValidationIssue[] = [];

  if (featuredToRetailers && !visibleToRetailers) {
    issues.push({
      label: "Tabela principal precisa estar visível para lojistas",
      tone: "error",
    });
  }

  if (!normalizedTitle && !parsedTitle) {
    issues.push({
      label: "Informe um título para a tabela",
      tone: "error",
    });
  }

  if (visibleToRetailers) {
    if (parsed.categories.length === 0) {
      issues.push({
        label: "Cadastre ao menos uma categoria antes de publicar a tabela",
        tone: "error",
      });
    }

    if (totalItems === 0) {
      issues.push({
        label: "Cadastre ao menos um serviço com estrutura válida antes de publicar a tabela",
        tone: "error",
      });
    }

    if (missingPriceCount > 0) {
      issues.push({
        label: `${missingPriceCount} serviço(s) ainda estão sem preço e impedem a publicação`,
        tone: "error",
      });
    }

    if (invalidPriceCount > 0) {
      issues.push({
        label: `${invalidPriceCount} serviço(s) possuem preço inválido e impedem a publicação`,
        tone: "error",
      });
    }
  }

  return {
    issues,
    parsedTitle,
    totalItems,
    missingPriceCount,
    invalidPriceCount,
  };
};
