import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { useSettings } from "@/hooks/useSettings";
import { validation } from "@/utils/validation";

const Contact = () => {
  const { settings } = useSettings();

  const contactPhone = settings?.contactPhone || "(11) 99999-9999";
  const contactPhoneRaw = settings?.contactPhoneRaw || "5511999999999";
  const contactEmail = settings?.contactEmail || "contato@donassistec.com.br";
  const contactAddress = settings?.contactAddress || "Sao Paulo - SP";
  const cityState = [settings?.contactCity, settings?.contactState].filter(Boolean).join(" - ");
  const whatsappUrl = validation.generateWhatsAppUrl(
    settings?.contactWhatsApp || settings?.whatsappNumber || "5511999999999",
    settings?.whatsappContactMessage || "Ola! Gostaria de falar com a equipe da DonAssistec."
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main id="main-content" className="pt-20">
        <section className="bg-gradient-to-br from-primary to-primary/80 py-16">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4 bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
              {settings?.contactPageBadge || "Contato"}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              {settings?.contactPageTitle || "Fale com a DonAssistec"}
            </h1>
            <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
              {settings?.contactPageDescription ||
                "Escolha o melhor canal para falar com nossa equipe comercial e tecnica."}
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    {settings?.contactPageWhatsappTitle || "WhatsApp"}
                  </CardTitle>
                  <CardDescription>
                    {settings?.contactPageWhatsappDescription || "Atendimento rapido para duvidas, orcamentos e suporte comercial."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button asChild className="w-full" variant="whatsapp">
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                      {settings?.contactPageWhatsappButtonLabel || "Abrir WhatsApp"}
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary" />
                    {settings?.contactPagePhoneTitle || "Telefone"}
                  </CardTitle>
                  <CardDescription>
                    {settings?.contactPagePhoneDescription || "Fale direto com nossa equipe durante o horario comercial."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-lg font-semibold">{contactPhone}</p>
                  <Button asChild variant="outline" className="w-full">
                    <a href={`tel:${contactPhoneRaw}`}>
                      {settings?.contactPagePhoneButtonLabel || "Ligar Agora"}
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary" />
                    {settings?.contactPageEmailTitle || "E-mail"}
                  </CardTitle>
                  <CardDescription>
                    {settings?.contactPageEmailDescription || "Envie sua solicitacao por e-mail e retornamos o quanto antes."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="break-all text-lg font-semibold">{contactEmail}</p>
                  <Button asChild variant="outline" className="w-full">
                    <a href={`mailto:${contactEmail}`}>
                      {settings?.contactPageEmailButtonLabel || "Enviar E-mail"}
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary" />
                    {settings?.contactPageAddressTitle || "Endereco"}
                  </CardTitle>
                  <CardDescription>
                    {settings?.contactPageAddressDescription || "Nossa base de atendimento e operacao."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">{contactAddress}</p>
                  {cityState ? <p>{cityState}</p> : null}
                  {settings?.contactCep ? <p>CEP: {settings.contactCep}</p> : null}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default Contact;
