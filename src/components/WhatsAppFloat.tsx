import { MessageCircle } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { validation } from "@/utils/validation";
import { getPublicContactInfo } from "@/utils/publicContact";

const WhatsAppFloat = () => {
  const { settings } = useSettings();

  const { contactWhatsappRaw, whatsappMessage, hasWhatsApp } = getPublicContactInfo(settings);
  const whatsappNumber = validation.cleanWhatsAppNumber(contactWhatsappRaw);
  const whatsappUrl = validation.generateWhatsAppUrl(contactWhatsappRaw, whatsappMessage);

  // Não renderiza se não houver número WhatsApp configurado
  if (!hasWhatsApp || !whatsappNumber || whatsappNumber.length < 10) {
    return null;
  }

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com a DonAssistec no WhatsApp"
      title="Falar no WhatsApp"
      className="fixed z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(142_70%_45%)] text-primary-foreground shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(142_70%_38%)] focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:h-auto sm:w-auto sm:gap-3 sm:px-5 sm:py-3 [bottom:max(0.875rem,env(safe-area-inset-bottom))] [right:max(0.875rem,env(safe-area-inset-right))] sm:bottom-6 sm:right-6"
    >
      <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
      <span className="hidden font-semibold sm:inline">Fale Conosco</span>
      <span className="sr-only">Abrir conversa no WhatsApp</span>
      
      {/* Pulse Animation */}
      <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full bg-secondary animate-ping sm:h-4 sm:w-4" />
      <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full bg-secondary sm:h-4 sm:w-4" />
    </a>
  );
};

export default WhatsAppFloat;
