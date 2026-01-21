import { MessageCircle } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { validation } from "@/utils/validation";

const WhatsAppFloat = () => {
  const { settings } = useSettings();

  const rawNumber = settings?.contactWhatsApp || settings?.whatsappNumber || "5511999999999";
  const whatsappNumber = validation.cleanWhatsAppNumber(rawNumber);
  
  const message = settings?.whatsappContactMessage || "Olá! Sou lojista e gostaria de saber mais sobre peças e serviços da DonAssistec.";
  const whatsappUrl = validation.generateWhatsAppUrl(rawNumber, message);

  // Não renderiza se não houver número WhatsApp configurado
  if (!whatsappNumber || whatsappNumber.length < 10) {
    return null;
  }

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-full bg-[hsl(142_70%_45%)] text-primary-foreground shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
    >
      <MessageCircle className="w-6 h-6" />
      <span className="hidden sm:inline font-semibold">Fale Conosco</span>
      
      {/* Pulse Animation */}
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-secondary rounded-full animate-ping" />
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-secondary rounded-full" />
    </a>
  );
};

export default WhatsAppFloat;
