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

const Help = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { settings } = useSettings();

  const defaultFaqs = [
    {
      category: "Geral",
      questions: [
        {
          question: "Como faço um pedido?",
          answer: "Acesse o catálogo, adicione os itens ao pré-orçamento e use o botão Orçamento (WhatsApp) para enviar seu orçamento. Nossa equipe retornará em seguida.",
        },
        {
          question: "Qual o prazo de entrega?",
          answer: "O prazo varia conforme a disponibilidade dos produtos. Produtos em estoque têm entrega mais rápida, enquanto produtos sob encomenda podem levar alguns dias a mais.",
        },
        {
          question: "Posso fazer pedidos via WhatsApp?",
          answer: "Sim! Você pode entrar em contato conosco pelo WhatsApp para pedidos personalizados, esclarecimentos de dúvidas ou atendimento prioritário.",
        },
        {
          question: "Qual a garantia dos produtos?",
          answer: "Todos os produtos e serviços possuem garantia de 90 dias. Detalhes específicos são informados no orçamento de cada pedido.",
        },
      ],
    },
    {
      category: "Lojistas",
      questions: [
        {
          question: "Como criar uma conta de lojista?",
          answer: "Acesse a página 'Área do Lojista' e clique em 'Criar Conta'. Preencha os dados da sua empresa e aguarde a aprovação da conta.",
        },
        {
          question: "Como acompanho meu pedido?",
          answer: "Na área do lojista, acesse a página 'Pedidos' para ver o status de todos os seus pedidos em tempo real.",
        },
        {
          question: "Posso solicitar descontos para grandes volumes?",
          answer: "Sim! Entre em contato com nossa equipe comercial para negociar condições especiais para grandes volumes de pedidos.",
        },
        {
          question: "Como funciona o programa de parceiros?",
          answer: "Lojistas parceiros têm acesso a preços especiais, suporte prioritário e benefícios exclusivos. Entre em contato para saber mais.",
        },
      ],
    },
    {
      category: "Produtos e Serviços",
      questions: [
        {
          question: "Quais marcas vocês trabalham?",
          answer: "Trabalhamos com as principais marcas do mercado: Apple, Samsung, Xiaomi, Motorola, LG e Huawei.",
        },
        {
          question: "O que é reconstrução de tela?",
          answer: "A reconstrução de tela é um processo profissional que restaura a funcionalidade completa da tela, mantendo a qualidade original do dispositivo.",
        },
        {
          question: "Vocês fornecem peças originais?",
          answer: "Sim! Trabalhamos com peças originais e de alta qualidade, sempre com garantia de qualidade e compatibilidade.",
        },
        {
          question: "Como sei se um produto está disponível?",
          answer: "No catálogo, você pode verificar o status de disponibilidade de cada produto: Em Estoque, Sob Encomenda ou Indisponível.",
        },
      ],
    },
  ];

  const parsedFaqs = (settings?.helpFaqItems || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [category, question, answer] = line.split("|").map((item) => item.trim());
      return { category, question, answer };
    })
    .filter((item) => item.category && item.question && item.answer);

  const faqs =
    parsedFaqs.length > 0
      ? Object.values(
          parsedFaqs.reduce<Record<string, { category: string; questions: Array<{ question: string; answer: string }> }>>(
            (acc, item) => {
              if (!acc[item.category]) {
                acc[item.category] = { category: item.category, questions: [] };
              }
              acc[item.category].questions.push({
                question: item.question,
                answer: item.answer,
              });
              return acc;
            },
            {}
          )
        )
      : defaultFaqs;

  const filteredFAQs = faqs.map((category) => ({
    ...category,
    questions: category.questions.filter((faq) =>
      searchQuery
        ? faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    ),
  })).filter((category) => category.questions.length > 0);

  const handleWhatsApp = () => {
    const url = validation.generateWhatsAppUrl(
      settings?.contactWhatsApp || settings?.whatsappNumber || "5511999999999",
      settings?.whatsappContactMessage || "Olá! Preciso de ajuda."
    );
    window.open(url, "_blank");
  };

  const contactPhone = settings?.contactPhone || "(11) 99999-9999";
  const contactPhoneRaw = settings?.contactPhoneRaw || "5511999999999";
  const contactEmail = settings?.contactEmail || "suporte@donassistec.com.br";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main id="main-content" className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary to-primary/80 py-16">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4 bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
              <HelpCircle className="w-3 h-3 mr-1" />
              {settings?.helpHeroBadge || "Central de Ajuda"}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              {settings?.helpHeroTitle || "Como Podemos Ajudar?"}
            </h1>
            <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto mb-8">
              {settings?.helpHeroDescription || "Encontre respostas para suas dúvidas ou entre em contato com nosso suporte"}
            </p>

            {/* Search */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder={settings?.helpSearchPlaceholder || "Buscar perguntas frequentes..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 h-14 bg-card text-foreground"
              />
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="mb-8">
              <Link to="/">
                <Button variant="ghost" className="mb-6">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {settings?.helpBackLabel || "Voltar para Home"}
                </Button>
              </Link>
            </div>

            {/* FAQs by Category */}
            {filteredFAQs.length > 0 ? (
              <div className="space-y-12">
                {filteredFAQs.map((category, categoryIndex) => (
                  <div key={categoryIndex}>
                    <h2 className="text-2xl font-bold text-foreground mb-6">
                      {category.category}
                    </h2>
                    <div className="space-y-4">
                      {category.questions.map((faq, index) => (
                        <Card key={index} className="hover:shadow-md transition-shadow">
                          <details className="group">
                            <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors list-none">
                              <span className="font-medium text-foreground pr-4">
                                {faq.question}
                              </span>
                              <FileText className="w-5 h-5 text-muted-foreground group-open:rotate-90 transition-transform shrink-0" />
                            </summary>
                            <div className="px-6 pb-6 text-sm text-muted-foreground leading-relaxed">
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
              <Card className="text-center p-12">
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
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <MessageCircle className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="font-semibold mb-2">{settings?.helpWhatsappTitle || "WhatsApp"}</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {settings?.helpWhatsappDescription || "Atendimento rápido via WhatsApp"}
                    </p>
                    <Button variant="outline" size="sm" onClick={handleWhatsApp}>
                      {settings?.helpWhatsappLabel || "Abrir Chat"}
                    </Button>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="font-semibold mb-2">{settings?.helpPhoneTitle || "Telefone"}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{contactPhone}</p>
                    <a href={`tel:${contactPhoneRaw}`}>
                      <Button variant="outline" size="sm">
                        {settings?.helpPhoneLabel || "Ligar Agora"}
                      </Button>
                    </a>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="font-semibold mb-2">{settings?.helpEmailTitle || "E-mail"}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{contactEmail}</p>
                    <a href={`mailto:${contactEmail}`}>
                      <Button variant="outline" size="sm">
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
