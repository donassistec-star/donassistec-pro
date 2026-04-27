import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  HelpCircle, 
  MessageCircle, 
  Phone, 
  Mail, 
  FileText,
  Send,
  Clock,
  Search
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import RetailerLayout from "@/components/retailer/RetailerLayout";
import { toast } from "sonner";
import { useSettings } from "@/hooks/useSettings";
import { validation } from "@/utils/validation";
import { Link } from "react-router-dom";
import { parseHelpFaqs } from "@/utils/helpFaqs";
import { getPublicContactInfo } from "@/utils/publicContact";

const RetailerSupport = () => {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [faqSearchQuery, setFaqSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    priority: "medium",
  });

  const {
    contactPhone,
    contactPhoneRaw,
    contactEmail,
    contactWhatsappRaw,
    hasPhone,
    hasWhatsApp,
  } = getPublicContactInfo(settings);
  const whatsappNumber = validation.cleanWhatsAppNumber(contactWhatsappRaw);
  const whatsappMessage =
    settings?.whatsappContactMessage ||
    `Olá! Preciso de suporte. Empresa: ${user?.companyName || ""}`;
  const allFaqGroups = parseHelpFaqs(settings?.helpFaqItems);
  const retailerFaqGroups = allFaqGroups.filter((group) =>
    group.category.toLowerCase().includes("lojist")
  );
  const faqGroupsToShow = retailerFaqGroups.length > 0 ? retailerFaqGroups : allFaqGroups;
  const filteredFaqGroups = faqGroupsToShow
    .map((group) => ({
      ...group,
      questions: group.questions.filter((faq) => {
        const normalizedSearch = faqSearchQuery.trim().toLowerCase();

        if (!normalizedSearch) {
          return true;
        }

        return (
          faq.question.toLowerCase().includes(normalizedSearch) ||
          faq.answer.toLowerCase().includes(normalizedSearch)
        );
      }),
    }))
    .filter((group) => group.questions.length > 0);
  const totalFaqQuestions = faqGroupsToShow.reduce((sum, group) => sum + group.questions.length, 0);
  const filteredFaqQuestions = filteredFaqGroups.reduce((sum, group) => sum + group.questions.length, 0);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simula envio - em produção seria uma chamada à API
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success("Solicitação enviada com sucesso! Entraremos em contato em breve.");
    setFormData({ subject: "", message: "", priority: "medium" });
    setIsSubmitting(false);
  };

  const handleWhatsApp = () => {
    if (!whatsappNumber || whatsappNumber.length < 10) {
      toast.error("WhatsApp de suporte não configurado corretamente no admin.");
      return;
    }

    window.open(
      validation.generateWhatsAppUrl(contactWhatsappRaw, whatsappMessage),
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <RetailerLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Suporte e Ajuda</h1>
          <p className="text-muted-foreground">
            Encontre respostas para suas dúvidas ou entre em contato com nosso suporte
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {hasWhatsApp ? (
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleWhatsApp}>
              <CardContent className="p-6 text-center">
                <MessageCircle className="w-10 h-10 mx-auto mb-3 text-green-600" />
                <h3 className="font-semibold mb-2">{settings?.helpWhatsappTitle || "WhatsApp"}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {settings?.helpWhatsappDescription || "Atendimento rápido via WhatsApp"}
                </p>
                <Button variant="outline" size="sm">
                  {settings?.helpWhatsappLabel || "Abrir Chat"}
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {hasPhone ? (
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <Phone className="w-10 h-10 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">{settings?.helpPhoneTitle || "Telefone"}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {contactPhone}
                </p>
                <a href={`tel:${contactPhoneRaw}`}>
                  <Button variant="outline" size="sm">
                    {settings?.helpPhoneLabel || "Ligar Agora"}
                  </Button>
                </a>
              </CardContent>
            </Card>
          ) : null}

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Mail className="w-10 h-10 mx-auto mb-3 text-secondary" />
              <h3 className="font-semibold mb-2">{settings?.helpEmailTitle || "E-mail"}</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {contactEmail}
              </p>
              <a href={`mailto:${contactEmail}`}>
                <Button variant="outline" size="sm">
                  {settings?.helpEmailLabel || "Enviar E-mail"}
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>

        {/* FAQs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Perguntas Frequentes
            </CardTitle>
            <CardDescription>
              Respostas rápidas para dúvidas da área do lojista e do suporte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex flex-col gap-4 rounded-xl border border-border bg-muted/30 p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {retailerFaqGroups.length > 0 ? "FAQs focadas em lojistas" : "FAQs gerais disponíveis"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {faqSearchQuery
                      ? `${filteredFaqQuestions} resultado(s) para "${faqSearchQuery}".`
                      : `${totalFaqQuestions} pergunta(s) pronta(s) para consulta nesta área.`}
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to="/ajuda">Abrir central completa</Link>
                </Button>
              </div>

              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={faqSearchQuery}
                  onChange={(e) => setFaqSearchQuery(e.target.value)}
                  placeholder={settings?.helpSearchPlaceholder || "Buscar perguntas frequentes..."}
                  className="pl-10"
                />
              </div>

              {filteredFaqGroups.length > 0 ? (
                <div className="space-y-6">
                  {filteredFaqGroups.map((group) => (
                    <div key={group.category} className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-base font-semibold text-foreground">{group.category}</h3>
                        <Badge variant="secondary">
                          {group.questions.length} pergunta{group.questions.length === 1 ? "" : "s"}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        {group.questions.map((faq) => (
                          <details key={`${group.category}-${faq.question}`} className="group rounded-lg border border-border bg-background">
                            <summary className="flex items-center justify-between gap-4 p-4 text-left transition-colors hover:bg-muted/50 cursor-pointer list-none">
                              <span className="font-medium text-foreground">{faq.question}</span>
                              <FileText className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
                            </summary>
                            <div className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">
                              {faq.answer}
                            </div>
                          </details>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center">
                  <p className="font-medium text-foreground">Nenhuma pergunta encontrada</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Tente buscar com outras palavras ou abra a central completa de ajuda.
                  </p>
                  <div className="mt-4 flex justify-center gap-3">
                    <Button type="button" variant="ghost" onClick={() => setFaqSearchQuery("")}>
                      Limpar busca
                    </Button>
                    <Button asChild variant="outline">
                      <Link to="/ajuda">Ir para ajuda</Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Support Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Enviar Solicitação
            </CardTitle>
            <CardDescription>
              Preencha o formulário abaixo e nossa equipe entrará em contato
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="subject">Assunto *</Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="Ex: Dúvida sobre pedido #001"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade</Label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Mensagem *</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Descreva sua solicitação ou dúvida..."
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={6}
                  required
                />
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Resposta em até 24 horas úteis</span>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? "Enviando..." : "Enviar Solicitação"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </RetailerLayout>
  );
};

export default RetailerSupport;
