import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Copy,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { useSettings } from "@/hooks/useSettings";
import { validation } from "@/utils/validation";

const Contact = () => {
  const { settings } = useSettings();

  const companyName = settings?.companyTradeName || settings?.siteName || "DonAssistec";
  const contactPhone = settings?.contactPhone || "(11) 99999-9999";
  const contactPhoneRaw = settings?.contactPhoneRaw || "5511999999999";
  const contactEmail = settings?.contactEmail || "contato@donassistec.com.br";
  const contactAddress = settings?.contactAddress || "Sao Paulo - SP";
  const contactCityState = [settings?.contactCity, settings?.contactState].filter(Boolean).join(" - ");
  const contactWhatsappRaw = settings?.contactWhatsApp || settings?.whatsappNumber || "5511999999999";
  const cleanWhatsappNumber = validation.cleanWhatsAppNumber(contactWhatsappRaw);
  const whatsappUrl = validation.generateWhatsAppUrl(
    contactWhatsappRaw,
    settings?.whatsappContactMessage || "Ola! Gostaria de falar com a equipe da DonAssistec."
  );
  const mapQuery = [contactAddress, settings?.contactCity, settings?.contactState, settings?.contactCep]
    .filter(Boolean)
    .join(", ");
  const mapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery || contactAddress)}&output=embed`;
  const mapsExternalUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery || contactAddress)}`;

  const handleCopy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copiado com sucesso.`);
    } catch {
      toast.error(`Nao foi possivel copiar ${label.toLowerCase()}.`);
    }
  };

  const heroHighlights = [
    "Orcamentos e atendimento comercial",
    "Suporte para lojistas e assistencias",
    "Contato rapido por WhatsApp, telefone ou e-mail",
  ];

  const supportTopics = [
    "Solicitar orcamentos e tirar duvidas comerciais",
    "Confirmar disponibilidade e atendimento da equipe",
    "Receber suporte para cadastro, pedidos e parceria",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main id="main-content" className="overflow-x-hidden pt-20">
        <section className="relative isolate overflow-hidden bg-[linear-gradient(135deg,hsl(211_100%_37%)_0%,hsl(209_76%_45%)_58%,hsl(205_78%_56%)_100%)] text-primary-foreground">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.14),transparent_30%)]" />
          <div className="absolute -left-24 top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl" />

          <div className="container relative mx-auto px-4 py-16 md:py-24">
            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
              <div className="max-w-3xl">
                <Badge className="mb-5 border-white/25 bg-white/12 px-4 py-1 text-primary-foreground backdrop-blur-sm">
                  {settings?.contactPageBadge || "Contato"}
                </Badge>

                <h1 className="max-w-[15ch] text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
                  {settings?.contactPageTitle || `Fale com a ${companyName}`}
                </h1>

                <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/88 md:text-xl">
                  {settings?.contactPageDescription ||
                    "Escolha o melhor canal para falar com nossa equipe comercial e tecnica. Priorizamos respostas rapidas para orcamentos, suporte e atendimento de lojistas."}
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Button
                    asChild
                    size="lg"
                    className="h-auto min-h-12 bg-white px-6 py-3 text-sm font-semibold text-primary shadow-xl hover:bg-white/90 hover:text-primary"
                  >
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-5 w-5" />
                      {settings?.contactPageWhatsappButtonLabel || "Abrir WhatsApp"}
                    </a>
                  </Button>

                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-auto min-h-12 border-white/35 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white hover:text-primary"
                  >
                    <a href={`tel:${contactPhoneRaw}`}>
                      <Phone className="h-5 w-5" />
                      {settings?.contactPagePhoneButtonLabel || "Ligar Agora"}
                    </a>
                  </Button>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {heroHighlights.map((item) => (
                    <div key={item} className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/92 shadow-lg backdrop-blur-sm">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <Card className="border-white/15 bg-slate-950/20 text-white shadow-2xl backdrop-blur-md">
                <CardHeader className="space-y-4">
                  <Badge className="w-fit border-emerald-300/30 bg-emerald-400/15 px-3 py-1 text-emerald-100">
                    Atendimento multicanal
                  </Badge>
                  <CardTitle className="text-2xl font-bold text-white">
                    Canais prontos para te atender
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed text-white/74">
                    Fale com o time da {companyName} pelo canal que fizer mais sentido para o seu momento.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="rounded-2xl border border-white/12 bg-white/10 p-4">
                    <div className="mb-2 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/20 text-emerald-100">
                        <MessageCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">WhatsApp preferencial</p>
                        <p className="text-sm text-white/70">
                          Canal mais rapido para orcamentos e suporte comercial
                        </p>
                      </div>
                    </div>
                    <Button
                      asChild
                      className="mt-3 w-full bg-white text-primary hover:bg-white/90"
                    >
                      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                        Iniciar conversa
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => handleCopy("telefone", contactPhoneRaw)}
                      className="rounded-2xl border border-white/12 bg-white/8 p-4 text-left transition-colors hover:bg-white/12"
                    >
                      <div className="mb-2 flex items-center gap-3">
                        <Phone className="h-4 w-4 text-sky-200" />
                        <span className="text-sm font-medium text-white/70">Telefone</span>
                      </div>
                      <p className="font-semibold text-white">{contactPhone}</p>
                      <p className="mt-2 text-xs text-white/60">Toque para copiar o numero</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopy("e-mail", contactEmail)}
                      className="rounded-2xl border border-white/12 bg-white/8 p-4 text-left transition-colors hover:bg-white/12"
                    >
                      <div className="mb-2 flex items-center gap-3">
                        <Mail className="h-4 w-4 text-sky-200" />
                        <span className="text-sm font-medium text-white/70">E-mail</span>
                      </div>
                      <p className="break-all font-semibold text-white">{contactEmail}</p>
                      <p className="mt-2 text-xs text-white/60">Toque para copiar o endereco</p>
                    </button>
                  </div>

                  <div className="rounded-2xl border border-white/12 bg-white/8 p-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-1 h-4 w-4 text-sky-200" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-white/70">Localizacao</p>
                        <p className="font-semibold text-white">{contactAddress}</p>
                        {contactCityState ? <p className="text-sm text-white/72">{contactCityState}</p> : null}
                        {settings?.contactCep ? <p className="text-sm text-white/72">CEP: {settings.contactCep}</p> : null}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="relative z-10 -mt-8 pb-8 md:-mt-12 md:pb-12">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 lg:grid-cols-12">
              <Card className="overflow-hidden border-0 bg-[linear-gradient(135deg,hsl(142_70%_45%)_0%,hsl(146_64%_36%)_100%)] text-white shadow-2xl lg:col-span-5">
                <CardHeader className="space-y-4 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/16">
                      <MessageCircle className="h-7 w-7" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold">
                        {settings?.contactPageWhatsappTitle || "WhatsApp"}
                      </CardTitle>
                      <CardDescription className="text-white/80">
                        Canal ideal para contato rapido
                      </CardDescription>
                    </div>
                  </div>
                  <p className="max-w-xl text-base leading-relaxed text-white/92">
                    {settings?.contactPageWhatsappDescription ||
                      "Atendimento rapido para duvidas, orcamentos e suporte comercial. Nossa equipe responde com agilidade e direciona voce para o melhor fluxo."}
                  </p>
                </CardHeader>

                <CardContent className="space-y-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                      <p className="text-sm text-white/70">Prioridade</p>
                      <p className="mt-1 font-semibold text-white">Atendimento mais rapido</p>
                    </div>
                    <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                      <p className="text-sm text-white/70">Uso recomendado</p>
                      <p className="mt-1 font-semibold text-white">Orcamento, suporte e comercial</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      asChild
                      size="lg"
                      className="h-auto min-h-12 flex-1 bg-white px-5 py-3 text-sm font-semibold text-[hsl(142_70%_24%)] hover:bg-white/90"
                    >
                      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                        {settings?.contactPageWhatsappButtonLabel || "Abrir WhatsApp"}
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </Button>

                    {cleanWhatsappNumber ? (
                      <Button
                        type="button"
                        size="lg"
                        variant="outline"
                        onClick={() => handleCopy("WhatsApp", cleanWhatsappNumber)}
                        className="h-auto min-h-12 border-white/30 bg-transparent px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 hover:text-white"
                      >
                        <Copy className="h-4 w-4" />
                        Copiar numero
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/80 shadow-lg lg:col-span-3">
                <CardHeader className="space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">
                      {settings?.contactPagePhoneTitle || "Telefone"}
                    </CardTitle>
                    <CardDescription className="mt-2 leading-relaxed">
                      {settings?.contactPagePhoneDescription ||
                        "Fale direto com nossa equipe durante o horario comercial."}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5">
                  <p className="text-2xl font-bold tracking-tight text-foreground">{contactPhone}</p>
                  <div className="flex flex-col gap-3">
                    <Button asChild variant="outline" className="w-full">
                      <a href={`tel:${contactPhoneRaw}`}>
                        {settings?.contactPagePhoneButtonLabel || "Ligar Agora"}
                      </a>
                    </Button>
                    <Button type="button" variant="ghost" className="w-full" onClick={() => handleCopy("telefone", contactPhoneRaw)}>
                      <Copy className="h-4 w-4" />
                      Copiar numero
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/80 shadow-lg lg:col-span-4">
                <CardHeader className="space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">
                      {settings?.contactPageEmailTitle || "E-mail"}
                    </CardTitle>
                    <CardDescription className="mt-2 leading-relaxed">
                      {settings?.contactPageEmailDescription ||
                        "Envie sua solicitacao por e-mail e retornamos o quanto antes."}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5">
                  <p className="break-all text-xl font-bold tracking-tight text-foreground">{contactEmail}</p>
                  <div className="flex flex-col gap-3">
                    <Button asChild variant="outline" className="w-full">
                      <a href={`mailto:${contactEmail}`}>
                        {settings?.contactPageEmailButtonLabel || "Enviar E-mail"}
                      </a>
                    </Button>
                    <Button type="button" variant="ghost" className="w-full" onClick={() => handleCopy("e-mail", contactEmail)}>
                      <Copy className="h-4 w-4" />
                      Copiar e-mail
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
              <Card className="border-border/80 shadow-lg">
                <CardHeader className="space-y-5">
                  <Badge variant="outline" className="w-fit px-3 py-1">
                    Como podemos ajudar
                  </Badge>
                  <div>
                    <CardTitle className="text-3xl font-bold tracking-tight">
                      Atendimento pensado para resolver rapido
                    </CardTitle>
                    <CardDescription className="mt-3 max-w-2xl text-base leading-relaxed">
                      Selecione o canal ideal e fale conosco com mais contexto. Assim o atendimento fica mais agil e objetivo desde a primeira mensagem.
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    {supportTopics.map((topic) => (
                      <div key={topic} className="flex gap-4 rounded-2xl border border-border/70 bg-muted/35 p-4">
                        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{topic}</p>
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            Nossa equipe direciona voce para o melhor atendimento conforme a necessidade.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-border/70 bg-card p-5">
                      <div className="mb-3 flex items-center gap-3">
                        <Clock3 className="h-5 w-5 text-primary" />
                        <p className="font-semibold text-foreground">Canal recomendado</p>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        Para agilidade no primeiro atendimento, priorize o WhatsApp. Para documentos ou informacoes detalhadas, use o e-mail.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-card p-5">
                      <div className="mb-3 flex items-center gap-3">
                        <Phone className="h-5 w-5 text-primary" />
                        <p className="font-semibold text-foreground">Telefone direto</p>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        Para falar agora com a equipe, ligue em {contactPhone} ou toque no botao de chamada.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-border/80 shadow-xl">
                <div className="border-b border-border/70 bg-muted/35 px-6 py-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <Badge variant="outline" className="mb-3 px-3 py-1">
                        {settings?.contactPageAddressTitle || "Endereco"}
                      </Badge>
                      <h2 className="text-3xl font-bold tracking-tight text-foreground">
                        {settings?.contactPageAddressDescription || "Nossa base de atendimento e operacao."}
                      </h2>
                    </div>

                    <Button asChild variant="outline" className="md:w-auto">
                      <a href={mapsExternalUrl} target="_blank" rel="noopener noreferrer">
                        Abrir no mapa
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="grid gap-0 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
                  <div className="space-y-5 p-6">
                    <div className="rounded-2xl border border-border/70 bg-card p-5">
                      <div className="mb-3 flex items-start gap-3">
                        <MapPin className="mt-1 h-5 w-5 text-primary" />
                        <div>
                          <p className="font-semibold text-foreground">{contactAddress}</p>
                          {contactCityState ? (
                            <p className="mt-1 text-sm text-muted-foreground">{contactCityState}</p>
                          ) : null}
                          {settings?.contactCep ? (
                            <p className="mt-1 text-sm text-muted-foreground">CEP: {settings.contactCep}</p>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-muted/35 p-5">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary/80">
                        Informacoes uteis
                      </p>
                      <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                        <p>WhatsApp: atendimento rapido para orcamentos, duvidas e encaminhamento comercial.</p>
                        <p>E-mail: ideal para documentos, comprovantes e solicitacoes detalhadas.</p>
                        <p>Telefone: melhor opcao quando voce precisa falar com a equipe imediatamente.</p>
                      </div>
                    </div>
                  </div>

                  <div className="min-h-[320px] bg-muted/30">
                    <iframe
                      src={mapsEmbedUrl}
                      className="h-full min-h-[320px] w-full"
                      style={{ border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`Mapa de ${companyName}`}
                    />
                  </div>
                </div>
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
