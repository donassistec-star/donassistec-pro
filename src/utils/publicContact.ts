import type { SystemSettings } from "@/services/settingsService";
import { validation } from "@/utils/validation";

const PHONE_DISPLAY_PLACEHOLDERS = new Set(["(11) 99999-9999"]);
const PHONE_RAW_PLACEHOLDERS = new Set(["5511999999999", "+5511999999999"]);
const ADDRESS_PLACEHOLDERS = new Set(["São Paulo - SP", "Sao Paulo - SP"]);
const CITY_PLACEHOLDERS = new Set(["São Paulo", "Sao Paulo"]);

const toCleanString = (value?: string | number | null): string => {
  if (value == null) return "";
  return String(value).trim();
};

const sanitizePhoneDisplay = (value?: string | number | null): string => {
  const next = toCleanString(value);
  return PHONE_DISPLAY_PLACEHOLDERS.has(next) ? "" : next;
};

const sanitizePhoneRaw = (value?: string | number | null): string => {
  const next = toCleanString(value);
  // Retorna vazio apenas se for um placeholder de telefone de display
  if (!next || PHONE_DISPLAY_PLACEHOLDERS.has(next)) {
    return "";
  }
  // Permite números brutos de placeholder como fallback válido
  if (PHONE_RAW_PLACEHOLDERS.has(next)) {
    return next;
  }

  return validation.cleanWhatsAppNumber(next) || "";
};

export const getPublicContactInfo = (settings?: Partial<SystemSettings> | null) => {
  const supportPhone = sanitizePhoneDisplay(settings?.supportPhone);
  const contactPhone = sanitizePhoneDisplay(settings?.contactPhone) || supportPhone;
  const contactPhoneRaw =
    sanitizePhoneRaw(settings?.contactPhoneRaw) ||
    sanitizePhoneRaw(contactPhone) ||
    sanitizePhoneRaw(supportPhone);

  const rawAddress = toCleanString(settings?.contactAddress);
  const contactAddress = ADDRESS_PLACEHOLDERS.has(rawAddress) ? "" : rawAddress;
  const rawCity = toCleanString(settings?.contactCity);
  const rawState = toCleanString(settings?.contactState);
  const isDefaultCityState = CITY_PLACEHOLDERS.has(rawCity) && rawState === "SP";
  const contactCity = contactAddress || !isDefaultCityState ? rawCity : "";
  const contactState = contactAddress || !isDefaultCityState ? rawState : "";
  const contactCep = toCleanString(settings?.contactCep);
  const contactCityState = [contactCity, contactState].filter(Boolean).join(" - ");

  const contactEmail = toCleanString(settings?.contactEmail || settings?.supportEmail);
  const whatsappMessage =
    toCleanString(settings?.whatsappContactMessage) ||
    "Olá! Gostaria de falar com a equipe da DonAssistec.";

  const contactWhatsappRaw =
    sanitizePhoneRaw(settings?.contactWhatsApp) ||
    sanitizePhoneRaw(settings?.whatsappNumber) ||
    contactPhoneRaw;

  const mapsQuery = [contactAddress, contactCity, contactState, contactCep]
    .filter(Boolean)
    .join(", ");

  return {
    contactPhone,
    contactPhoneRaw,
    contactEmail,
    contactAddress,
    contactCity,
    contactState,
    contactCityState,
    contactCep,
    contactWhatsappRaw,
    whatsappMessage,
    mapsQuery,
    hasPhone: Boolean(contactPhone && contactPhoneRaw),
    hasEmail: Boolean(contactEmail),
    hasAddress: Boolean(contactAddress || contactCityState || contactCep),
    hasWhatsApp: Boolean(contactWhatsappRaw),
  };
};
