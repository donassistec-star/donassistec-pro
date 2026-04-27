import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Eye, FileText, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

const Privacy = () => {
  const sections = [
    {
      icon: Shield,
      title: "Coleta de Informações",
      content: "Coletamos informações que você nos fornece diretamente quando cria uma conta, faz um pedido ou entra em contato conosco. Isso pode incluir nome, email, telefone, endereço e informações da empresa.",
    },
    {
      icon: Lock,
      title: "Uso das Informações",
      content: "Utilizamos suas informações para processar pedidos, fornecer suporte ao cliente, melhorar nossos serviços, enviar comunicações relacionadas ao negócio e cumprir obrigações legais.",
    },
    {
      icon: Eye,
      title: "Compartilhamento de Dados",
      content: "Não vendemos suas informações pessoais. Podemos compartilhar dados com prestadores de serviços que nos ajudam a operar nosso negócio, sempre sob rigorosos acordos de confidencialidade.",
    },
    {
      icon: FileText,
      title: "Seus Direitos",
      content: "Você tem o direito de acessar, corrigir ou excluir suas informações pessoais a qualquer momento. Também pode solicitar uma cópia dos seus dados ou optar por não receber comunicações de marketing.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary to-primary/80 py-16">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4 bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
              <Shield className="w-3 h-3 mr-1" />
              Política de Privacidade
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Proteção de Dados e Privacidade
            </h1>
            <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
              Comprometidos com a proteção e privacidade dos seus dados pessoais
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
                A DonAssistec está comprometida em proteger a privacidade e os dados pessoais de nossos
                clientes e parceiros. Esta política descreve como coletamos, usamos, armazenamos e protegemos
                suas informações quando você utiliza nossos serviços.
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
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
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

            {/* Security */}
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Lock className="w-6 h-6 text-primary" />
                  Segurança dos Dados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Implementamos medidas de segurança técnicas e organizacionais adequadas para proteger
                  seus dados pessoais contra acesso não autorizado, alteração, divulgação ou destruição.
                  Utilizamos criptografia SSL/TLS, firewalls, controle de acesso e outras tecnologias de
                  segurança de última geração.
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Criptografia de dados em trânsito e em repouso</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Backups regulares e redundância de sistemas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Monitoramento contínuo de segurança</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Treinamento regular da equipe em proteção de dados</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Entre em Contato</CardTitle>
                <CardDescription>
                  Se tiver dúvidas sobre nossa política de privacidade ou sobre o uso de seus dados pessoais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium mb-1">E-mail</p>
                    <a
                      href="mailto:privacidade@donassistec.com.br"
                      className="text-primary hover:underline"
                    >
                      privacidade@donassistec.com.br
                    </a>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Telefone</p>
                    <a href="tel:+5511999999999" className="text-primary hover:underline">
                      (11) 99999-9999
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

export default Privacy;
