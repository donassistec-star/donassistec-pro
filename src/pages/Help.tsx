import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  HelpCircle,
  MessageCircle,
  Search,
  ArrowLeft,
  Phone,
  Mail,
  FileText
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { useSettings } from "@/hooks/useSettings";
import { validation } from "@/utils/validation";
import { parseHelpFaqs } from "@/utils/helpFaqs";
import { getPublicContactInfo } from "@/utils/publicContact";

const Help = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const { settings } = useSettings();

  const faqs = parseHelpFaqs(settings?.helpFaqItems);

  const categories = ["Todas", ...faqs.map((category) => category.category)];

  const filteredByCategory =
    selectedCategory === "Todas"
      ? faqs
      : faqs.filter((category) => category.category === selectedCategory);

  const filteredFAQs = filteredByCategory.map((category) => ({
    ...category,
    questions: category.questions.filter((faq) =>
      searchQuery
        ? faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    ),
  })).filter((category) => category.questions.length > 0);

  const totalQuestions = faqs.reduce((sum, category) => sum + category.questions.length, 0);
  const filteredQuestions = filteredFAQs.reduce((sum, category) => sum + category.questions.length, 0);

  const {
    contactPhone,
    contactPhoneRaw,
    contactEmail,
    contactWhatsappRaw,
    hasPhone,
    hasWhatsApp,
  } = getPublicContactInfo(settings);

  const handleWhatsApp = () => {
    if (!hasWhatsApp) return;
    const url = validation.generateWhatsAppUrl(
      contactWhatsappRaw,
      settings?.whatsappContactMessage || "Olá! Preciso de ajuda."
    );
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main id="main-content" className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary to-primary/80 py-12 sm:py-16">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4 bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
              <HelpCircle className="w-3 h-3 mr-1" />
              {settings?.helpHeroBadge || "Central de Ajuda"}
            </Badge>
            <h1 className="mb-4 text-3xl font-bold text-primary-foreground sm:text-4xl">
              {settings?.helpHeroTitle || "Como Podemos Ajudar?"}
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-base text-primary-foreground/90 sm:text-lg">
              {settings?.helpHeroDescription || "Encontre respostas para suas dúvidas ou entre em contato com nosso suporte"}
            </p>

            {/* Search */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder={settings?.helpSearchPlaceholder || "Buscar perguntas frequentes..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 bg-card pl-12 pr-4 text-foreground sm:h-14"
              />
            </div>

            <div className="-mx-4 mt-6 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
              <div className="flex min-w-max gap-3 sm:min-w-0 sm:flex-wrap sm:justify-center">
              {categories.map((category) => {
                const categoryCount =
                  category === "Todas"
                    ? totalQuestions
                    : faqs.find((item) => item.category === category)?.questions.length || 0;

                return (
                  <Button
                    key={category}
                    type="button"
                    variant={selectedCategory === category ? "secondary" : "outline"}
                    className={
                      selectedCategory === category
                        ? "shrink-0 border-primary-foreground/30 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                        : "shrink-0 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                    }
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category} ({categoryCount})
                  </Button>
                );
              })}
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 sm:py-20">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="mb-8">
              <Link to="/">
                <Button variant="ghost" className="mb-6">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {settings?.helpBackLabel || "Voltar para Home"}
                </Button>
              </Link>
            </div>

            <div className="mb-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              <Card>
                <CardContent className="p-5">
                  <p className="text-sm text-muted-foreground">Perguntas disponíveis</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{totalQuestions}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <p className="text-sm text-muted-foreground">Categorias</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{faqs.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <p className="text-sm text-muted-foreground">Resultados filtrados</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{filteredQuestions}</p>
                </CardContent>
              </Card>
            </div>

            {/* FAQs by Category */}
            {filteredFAQs.length > 0 ? (
              <div className="space-y-8 sm:space-y-12">
                <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {selectedCategory === "Todas"
                        ? "Mostrando todas as categorias"
                        : `Categoria selecionada: ${selectedCategory}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {searchQuery
                        ? `Busca por "${searchQuery}" retornou ${filteredQuestions} resultado(s).`
                        : "Use a busca acima para encontrar respostas mais rápido."}
                    </p>
                  </div>
                  {searchQuery && (
                    <Button variant="ghost" onClick={() => setSearchQuery("")}>
                      Limpar busca
                    </Button>
                  )}
                </div>

                {filteredFAQs.map((category, categoryIndex) => (
                  <div key={categoryIndex}>
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                      <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                        {category.category}
                      </h2>
                      <Badge variant="secondary">
                        {category.questions.length} pergunta{category.questions.length === 1 ? "" : "s"}
                      </Badge>
                    </div>
                    <div className="space-y-4">
                      {category.questions.map((faq, index) => (
                        <Card key={index} className="hover:shadow-md transition-shadow">
                          <details className="group">
                            <summary className="flex list-none items-center justify-between gap-3 rounded-lg p-4 transition-colors hover:bg-muted/50 cursor-pointer sm:p-6">
                              <span className="font-medium text-foreground pr-4">
                                {faq.question}
                              </span>
                              <FileText className="w-5 h-5 text-muted-foreground group-open:rotate-90 transition-transform shrink-0" />
                            </summary>
                            <div className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground sm:px-6 sm:pb-6">
                              {faq.answer}
                            </div>
                          </details>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center sm:p-12">
                <HelpCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">
                  {settings?.helpNoResultsTitle || "Nenhum resultado encontrado"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {settings?.helpNoResultsDescription ||
                    "Tente buscar com outras palavras-chave ou entre em contato com nosso suporte."}
                </p>
                <Button onClick={handleWhatsApp}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {settings?.helpNoResultsButtonLabel || "Falar no WhatsApp"}
                </Button>
              </Card>
            )}

            {/* Contact Support */}
            <Card className="mt-12 bg-muted/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <MessageCircle className="w-6 h-6 text-primary" />
                  {settings?.helpContactTitle || "Ainda Precisa de Ajuda?"}
                </CardTitle>
                <CardDescription>
                  {settings?.helpContactDescription || "Nossa equipe está pronta para ajudá-lo com qualquer dúvida ou problema"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 sm:gap-6">
                  {hasWhatsApp ? (
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <MessageCircle className="w-6 h-6 text-primary" />
                      </div>
                      <h4 className="font-semibold mb-2">{settings?.helpWhatsappTitle || "WhatsApp"}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {settings?.helpWhatsappDescription || "Atendimento rápido via WhatsApp"}
                      </p>
                      <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={handleWhatsApp}>
                        {settings?.helpWhatsappLabel || "Abrir Chat"}
                      </Button>
                    </div>
                  ) : null}
                  {hasPhone ? (
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <Phone className="w-6 h-6 text-primary" />
                      </div>
                      <h4 className="font-semibold mb-2">{settings?.helpPhoneTitle || "Telefone"}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{contactPhone}</p>
                      <a href={`tel:${contactPhoneRaw}`}>
                        <Button variant="outline" size="sm" className="w-full sm:w-auto">
                          {settings?.helpPhoneLabel || "Ligar Agora"}
                        </Button>
                      </a>
                    </div>
                  ) : null}
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="font-semibold mb-2">{settings?.helpEmailTitle || "E-mail"}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{contactEmail}</p>
                    <a href={`mailto:${contactEmail}`}>
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        {settings?.helpEmailLabel || "Enviar E-mail"}
                      </Button>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default Help;
