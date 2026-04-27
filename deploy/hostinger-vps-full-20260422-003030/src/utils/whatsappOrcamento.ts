import { formatCurrency } from "./format";
import type { PhoneModel } from "@/data/models";
import type { SelectedService } from "@/contexts/CartContext";

type BrandLike = { id: string; name: string };

function footerValidade(): string {
  const data = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  return `_Orçamento válido por 7 dias. Enviado em ${data}._`;
}

/** Monta a mensagem de pré-orçamento para um único modelo (página do modelo). */
export function buildPreOrcamentoMessageModel(
  model: PhoneModel,
  brand: BrandLike,
  selectedServices: SelectedService[],
  quantity: number,
  subtotalLabel: string
): string {
  const linhas: string[] = [
    "Olá! Sou lojista e gostaria de um orçamento.",
    "",
    `*Modelo:* ${model.name} (${brand.name})`,
    `*Quantidade:* ${quantity}`,
  ];

  if (selectedServices.length > 0) {
    linhas.push("", "*Serviços selecionados:*");
    for (const s of selectedServices) {
      linhas.push(`• ${s.name}: ${s.price > 0 ? formatCurrency(s.price) : "Sob consulta"}`);
    }
    linhas.push("", `*Total estimado:* ${subtotalLabel}`);
  } else {
    linhas.push("", "Orçamento sob consulta (nenhum serviço selecionado).");
  }

  linhas.push("", "---", "", footerValidade());
  return linhas.join("\n");
}

/** Item para montar mensagem de vários modelos (página pré-orçamento). */
export type PreOrcamentoItem = {
  model: PhoneModel;
  brand?: BrandLike;
  quantity: number;
  selectedServices?: SelectedService[];
};

/** Monta a mensagem de pré-orçamento para a lista (página Pré-orçamento).
 * @param observation - Observação opcional (ex: "Preciso até sexta" ou "Cliente preferencial")
 */
export function buildPreOrcamentoMessageList(items: PreOrcamentoItem[], observation?: string | null): string {
  const linhas: string[] = [
    "Olá! Sou lojista e gostaria de um orçamento com os itens do meu pré-orçamento.",
    "",
    "---",
  ];

  items.forEach((item, i) => {
    const brandName = item.brand?.name ?? "—";
    linhas.push("", `*${i + 1}. ${item.model.name} (${brandName}) – Qtd: ${item.quantity}*`);

    if (item.selectedServices && item.selectedServices.length > 0) {
      for (const s of item.selectedServices) {
        linhas.push(`• ${s.name}: ${s.price > 0 ? formatCurrency(s.price) : "Sob consulta"}`);
      }
      const st = item.selectedServices.every((s) => s.price > 0)
        ? item.selectedServices.reduce((a, b) => a + b.price, 0) * item.quantity
        : null;
      linhas.push(`Subtotal: ${st != null ? formatCurrency(st) : "Sob consulta"}`);
    } else {
      linhas.push("Orçamento sob consulta");
    }
  });

  linhas.push("", "---");
  if (observation && observation.trim()) {
    linhas.push("", `*Obs:* ${observation.trim()}`);
    linhas.push("", "---");
  }
  linhas.push("", "Aguardando retorno. Obrigado!");
  linhas.push("", footerValidade());

  return linhas.join("\n");
}

/** Dados opcionais de contato para enriquecer a mensagem de pré-pedido */
export type PrePedidoContactOpts = {
  contactName?: string | null;
  contactCompany?: string | null;
  notes?: string | null;
  isUrgent?: boolean;
  /** Prazo desejado (ex: "15/02/2025" ou "Preciso até sexta") */
  needBy?: string | null;
};

/** Monta a mensagem de pré-pedido em andamento (Finalizar). Mesma lista de itens, enquadramento de pré-pedido. Opcional: contato, observações, urgente, preciso até, número (ex: PRE-0001). */
export function buildPrePedidoMessageList(
  items: PreOrcamentoItem[],
  contact?: PrePedidoContactOpts | null,
  numeroPrePedido?: string | null
): string {
  const num = numeroPrePedido ? ` *${numeroPrePedido}* –` : "";
  const linhas: string[] = [
    `Olá! Finalizei meu pré-orçamento. Segue meu${num} *pré-pedido em andamento* com os itens abaixo.`,
    "",
  ];

  if (contact && (contact.contactName || contact.contactCompany || contact.notes || contact.isUrgent || contact.needBy)) {
    linhas.push("---", "*Meus dados / observações:*");
    if (contact.contactName) linhas.push(`• Nome: ${contact.contactName}`);
    if (contact.contactCompany) linhas.push(`• Empresa: ${contact.contactCompany}`);
    if (contact.notes) linhas.push(`• Observações: ${contact.notes}`);
    if (contact.needBy && contact.needBy.trim()) linhas.push(`• Preciso até: ${contact.needBy.trim()}`);
    if (contact.isUrgent) linhas.push("• ⚠️ *URGENTE*");
    linhas.push("", "---", "");
  }

  linhas.push("---", "");

  items.forEach((item, i) => {
    const brandName = item.brand?.name ?? "—";
    linhas.push("", `*${i + 1}. ${item.model.name} (${brandName}) – Qtd: ${item.quantity}*`);

    if (item.selectedServices && item.selectedServices.length > 0) {
      for (const s of item.selectedServices) {
        linhas.push(`• ${s.name}: ${s.price > 0 ? formatCurrency(s.price) : "Sob consulta"}`);
      }
      const st = item.selectedServices.every((s) => s.price > 0)
        ? item.selectedServices.reduce((a, b) => a + b.price, 0) * item.quantity
        : null;
      linhas.push(`Subtotal: ${st != null ? formatCurrency(st) : "Sob consulta"}`);
    } else {
      linhas.push("Orçamento sob consulta");
    }
  });

  linhas.push("", "---", "", "Pré-pedido em andamento. Aguardo retorno por WhatsApp. Obrigado!");
  linhas.push("", footerValidade());

  return linhas.join("\n");
}
