import { MessageCircle } from "lucide-react";

const WhatsAppFloat = () => {
  const whatsappNumber = "5511999999999";
  const whatsappMessage = encodeURIComponent(
    "Olá! Sou lojista e gostaria de saber mais sobre peças e serviços da DonAssistec."
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

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
