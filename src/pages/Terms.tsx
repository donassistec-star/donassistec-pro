import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Scale, CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { useSettings } from "@/hooks/useSettings";
import { getPublicContactInfo } from "@/utils/publicContact";

const Terms = () => {
  const { settings } = useSettings();
  const { contactPhone, contactPhoneRaw, hasPhone } = getPublicContactInfo(settings);
  const sections = [
    {
      icon: CheckCircle2,
      title: "Aceitação dos Termos",
      content: "Ao acessar e utilizar os serviços da DonAssistec, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concorda com algum destes termos, não deve utilizar nossos serviços.",
    },
    {
      icon: Scale,
      title: "Uso dos Serviços",
      content: "Nossos serviços são destinados exclusivamente para uso B2B por lojistas e assistências técnicas. Você concorda em usar nossos serviços apenas para fins legais e de acordo com estes termos. É proibido o uso não autorizado, incluindo mas não limitado a, tentativas de acesso não autorizado aos sistemas.",
    },
    {
      icon: AlertTriangle,
      title: "Pedidos e Pagamentos",
      content: "Todos os pedidos estão sujeitos à disponibilidade de estoque. Os preços podem ser alterados a qualquer momento sem aviso prévio. O pagamento deve ser realizado de acordo com as condições acordadas. Reservamo-nos o direito de recusar ou cancelar qualquer pedido.",
    },
    {
      icon: FileText,
      title: "Garantias e Limitações",
      content: "Fornecemos garantia em todos os produtos e serviços de acordo com nossos termos de garantia. Nossa responsabilidade é limitada ao valor do produto ou serviço fornecido. Não nos responsabilizamos por danos indiretos, consequenciais ou lucros cessantes.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-secondary to-secondary/80 py-16">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4 bg-secondary-foreground/20 text-secondary-foreground border-secondary-foreground/30">
              <FileText className="w-3 h-3 mr-1" />
              Termos de Uso
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-secondary-foreground mb-4">
              Termos e Condições de Uso
            </h1>
            <p className="text-lg text-secondary-foreground/90 max-w-2xl mx-auto">
              Leia atentamente nossos termos antes de utilizar nossos serviços
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="mb-8">
              <Link to="/">
                <Button variant="ghost" className="mb-6">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar para Home
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground mb-4">
                Última atualização: {new Date().toLocaleDateString("pt-BR")}
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Estes Termos de Uso regem o uso dos serviços fornecidos pela DonAssistec. Ao acessar
                ou utilizar nossos serviços, você concorda em cumprir estes termos. Por favor, leia
                cuidadosamente antes de utilizar nossos serviços.
              </p>
            </div>

            {/* Sections */}
            <div className="space-y-6 mb-12">
              {sections.map((section, index) => {
                const Icon = section.icon;
                return (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-secondary" />
                        </div>
                        {section.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Additional Terms */}
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Scale className="w-6 h-6 text-secondary" />
                  Disposições Gerais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-muted-foreground">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Modificações</h4>
                    <p>
                      Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações
                      entrarão em vigor imediatamente após a publicação. É sua responsabilidade revisar
                      periodicamente estes termos.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Lei Aplicável</h4>
                    <p>
                      Estes termos são regidos pelas leis brasileiras. Qualquer disputa será resolvida
                      nos tribunais competentes do Brasil.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Rescisão</h4>
                    <p>
                      Podemos encerrar ou suspender seu acesso aos nossos serviços imediatamente, sem
                      aviso prévio, por qualquer motivo, incluindo violação destes termos.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Dúvidas?</CardTitle>
                <CardDescription>
                  Se tiver dúvidas sobre estes termos, entre em contato conosco
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium mb-1">E-mail</p>
                    <a
                      href="mailto:juridico@donassistec.com.br"
                      className="text-secondary hover:underline"
                    >
                      juridico@donassistec.com.br
                    </a>
                  </div>
                  {hasPhone ? (
                    <div>
                      <p className="font-medium mb-1">Telefone</p>
                      <a href={`tel:${contactPhoneRaw}`} className="text-secondary hover:underline">
                        {contactPhone}
                      </a>
                    </div>
                  ) : null}
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

export default Terms;
