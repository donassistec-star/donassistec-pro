/**
 * Utilitários de formatação para exibição
 */

/**
 * Formata um valor numérico como moeda brasileira (BRL).
 * Intl.NumberFormat em pt-BR pode usar espaço não-quebrável (U+00A0); normalizamos para espaço.
 */
export const formatCurrency = (value: number | null | undefined): string => {
  const n = value ?? 0;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
    .format(n)
    .replace(/\u00A0/g, " ");
};

/**
 * Formata uma data para exibição em português. Retorna "N/A" para null/undefined.
 */
export const formatDate = (date: string | Date | null | undefined, format: "short" | "long" | "time" = "short"): string => {
  if (date == null) return "N/A";
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (format === "short") {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(dateObj);
  }

  if (format === "long") {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(dateObj);
  }

  if (format === "time") {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj);
  }

  return dateObj.toLocaleDateString("pt-BR");
};

/**
 * Formata um número grande com separador de milhar
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("pt-BR").format(value);
};

/**
 * Trunca um texto e adiciona reticências se exceder o limite
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

/**
 * Formata um status de pedido para exibição
 */
export const formatOrderStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: "Pendente",
    processing: "Processando",
    completed: "Concluído",
    cancelled: "Cancelado",
  };

  return statusMap[status] || status;
};

/**
 * Formata um nome removendo espaços extras e capitalizando
 */
export const formatName = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};
