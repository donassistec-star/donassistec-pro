import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  CheckCircle2
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import RetailerLayout from "@/components/retailer/RetailerLayout";
import { toast } from "sonner";

const RetailerSupport = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    priority: "medium",
  });

  const faqs = [
    {
      question: "Como faço um pedido?",
      answer: "Acesse o catálogo, adicione os itens ao pré-orçamento e use o botão Orçamento (WhatsApp) para enviar. Nossa equipe retornará em seguida.",
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
      question: "Como acompanho meu pedido?",
      answer: "Na área do lojista, acesse a página 'Pedidos' para ver o status de todos os seus pedidos em tempo real.",
    },
    {
      question: "Qual a garantia dos produtos?",
      answer: "Todos os produtos e serviços possuem garantia de qualidade. Detalhes específicos são informados no orçamento de cada pedido.",
    },
  ];

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
    const message = encodeURIComponent(
      `Olá! Preciso de suporte. Empresa: ${user?.companyName || ""}`
    );
    window.open(`https://wa.me/5511999999999?text=${message}`, "_blank");
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
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleWhatsApp}>
            <CardContent className="p-6 text-center">
              <MessageCircle className="w-10 h-10 mx-auto mb-3 text-green-600" />
              <h3 className="font-semibold mb-2">WhatsApp</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Atendimento rápido via WhatsApp
              </p>
              <Button variant="outline" size="sm">
                Abrir Chat
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Phone className="w-10 h-10 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Telefone</h3>
              <p className="text-sm text-muted-foreground mb-3">
                (11) 99999-9999
              </p>
              <a href="tel:+5511999999999">
                <Button variant="outline" size="sm">
                  Ligar Agora
                </Button>
              </a>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Mail className="w-10 h-10 mx-auto mb-3 text-secondary" />
              <h3 className="font-semibold mb-2">E-mail</h3>
              <p className="text-sm text-muted-foreground mb-3">
                suporte@donassistec.com.br
              </p>
              <a href="mailto:suporte@donassistec.com.br">
                <Button variant="outline" size="sm">
                  Enviar E-mail
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
              Respostas para as dúvidas mais comuns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <details key={index} className="group">
                  <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors list-none">
                    <span className="font-medium text-foreground">{faq.question}</span>
                    <FileText className="w-5 h-5 text-muted-foreground group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="px-4 pb-4 text-sm text-muted-foreground">
                    {faq.answer}
                  </div>
                </details>
              ))}
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
