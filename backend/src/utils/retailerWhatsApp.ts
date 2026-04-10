import SettingsModel from "../models/SettingsModel";

interface RetailerContactPayload {
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string | null;
  cnpj?: string | null;
}

function cleanWhatsAppNumber(value?: string | null): string {
  if (!value) return "";
  return String(value).replace(/[^\d]/g, "");
}

function buildWhatsAppUrl(number: string, messageLines: string[]): string | undefined {
  const cleanNumber = cleanWhatsAppNumber(number);
  if (!cleanNumber) {
    return undefined;
  }

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(messageLines.join("\n"))}`;
}

export async function buildRetailerApprovalRequestWhatsAppUrl(
  retailer: RetailerContactPayload
): Promise<string | undefined> {
  const settings = await SettingsModel.getPublic();
  const rawWhatsApp = settings.contactWhatsApp || settings.whatsappNumber;

  if (!rawWhatsApp) {
    return undefined;
  }

  const messageLines = [
    "Nova solicitacao de aprovacao de lojista:",
    `Empresa: ${retailer.company_name}`,
    `Responsavel: ${retailer.contact_name}`,
    `E-mail: ${retailer.email}`,
  ];

  if (retailer.phone) {
    messageLines.push(`Telefone: ${retailer.phone}`);
  }

  if (retailer.cnpj) {
    messageLines.push(`CPF/CNPJ: ${retailer.cnpj}`);
  }

  return buildWhatsAppUrl(String(rawWhatsApp), messageLines);
}

export async function buildRetailerApprovedWhatsAppUrl(
  retailer: RetailerContactPayload
): Promise<string | undefined> {
  const retailerPhone = cleanWhatsAppNumber(retailer.phone);
  if (!retailerPhone) {
    return undefined;
  }

  const settings = await SettingsModel.getPublic();
  const tradeName = String(settings.companyTradeName || settings.siteName || "DonAssistec");
  const companyWebsite = settings.companyWebsite ? String(settings.companyWebsite) : "";
  const supportWhatsApp = settings.contactWhatsApp || settings.whatsappNumber;

  const messageLines = [
    `Olá, ${retailer.contact_name}!`,
    "",
    `Seu cadastro de lojista na ${tradeName} foi aprovado com sucesso.`,
    "Seu acesso já está liberado para entrar na área do lojista.",
    "",
    `E-mail de acesso: ${retailer.email}`,
  ];

  if (companyWebsite) {
    messageLines.push(`Site: ${companyWebsite}`);
  }

  if (supportWhatsApp) {
    messageLines.push(`Suporte WhatsApp: ${String(supportWhatsApp)}`);
  }

  messageLines.push("", "Se precisar de ajuda no primeiro acesso, é só responder esta mensagem.");

  return buildWhatsAppUrl(retailerPhone, messageLines);
}
