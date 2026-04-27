import { Button } from "@/components/ui/button";
import { MessageCircle, Phone } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { validation } from "@/utils/validation";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { getPublicContactInfo } from "@/utils/publicContact";

const CTASection = () => {
  const { settings } = useSettings();

  const {
    contactPhone,
    contactPhoneRaw,
    contactAddress,
    contactWhatsappRaw,
    whatsappMessage,
    hasPhone,
    hasAddress,
    hasWhatsApp,
  } = getPublicContactInfo(settings);
  const whatsappUrl = hasWhatsApp
    ? validation.generateWhatsAppUrl(contactWhatsappRaw, whatsappMessage)
    : "";
  const title = settings?.homeContactTitle || "Precisa de Peças ou Reconstrução?";
  const description =
    settings?.homeContactDescription ||
    "Fale com nossa equipe especializada e receba um orçamento sem compromisso. Atendimento exclusivo para lojistas e assistências técnicas.";
  const whatsappLabel = settings?.homeContactWhatsappLabel || "Chamar no WhatsApp";
  const phoneLabel = settings?.homeContactPhoneLabel || contactPhone;
  const infoBadge = settings?.homeContactInfoBadge || "Garantia de 90 dias";
  const contactPageLabel = settings?.homeContactPageButtonLabel || "Ver pagina de contato";

  return (
    <section id="contato" className="py-20 bg-gradient-to-br from-primary to-primary/80">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
          {title}
        </h2>
        <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
          {description}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {hasWhatsApp ? (
            <Button
              variant="whatsapp"
              size="xl"
              onClick={() => {
                const w = window.open(whatsappUrl, "_blank");
                if (!w) {
                  toast.error("Permita pop-ups para abrir o WhatsApp e tente novamente.");
                }
              }}
              className="gap-3"
            >
              <MessageCircle className="w-6 h-6" />
              {whatsappLabel}
            </Button>
          ) : null}
          {hasPhone ? (
            <a href={`tel:${contactPhoneRaw}`}>
              <Button
                variant="outline"
                size="xl"
                className="border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                <Phone className="w-5 h-5" />
                {phoneLabel}
              </Button>
            </a>
          ) : null}
          <Button asChild size="xl" variant="secondary">
            <Link to="/contato">{contactPageLabel}</Link>
          </Button>
        </div>

        {/* Info Strip */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/20">
          <div className="flex flex-wrap justify-center gap-8 text-primary-foreground/80">
            {hasPhone ? (
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                <a href={`tel:${contactPhoneRaw}`} className="hover:underline">
                  {contactPhone}
                </a>
              </div>
            ) : null}
            {hasAddress ? (
              <div className="flex items-center gap-2">
                <span>📍 {contactAddress}</span>
              </div>
            ) : null}
            <div className="flex items-center gap-2">
              <span>✅ {infoBadge}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
