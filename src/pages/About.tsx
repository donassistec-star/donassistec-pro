import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Users, 
  Award, 
  Shield, 
  Target, 
  TrendingUp,
  CheckCircle2,
  MessageCircle,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { useSettings } from "@/hooks/useSettings";
import { validation } from "@/utils/validation";
import { getPublicContactInfo } from "@/utils/publicContact";

const About = () => {
  const { settings } = useSettings();

  const defaultValues = [
    {
      icon: Shield,
      title: "Qualidade Garantida",
      description: "Todas as peças e serviços passam por rigoroso controle de qualidade.",
    },
    {
      icon: Target,
      title: "Foco no Cliente",
      description: "Atendimento personalizado e dedicado às necessidades de cada lojista.",
    },
    {
      icon: TrendingUp,
      title: "Inovação Constante",
      description: "Sempre em busca das melhores tecnologias e processos de reparo.",
    },
    {
      icon: Users,
      title: "Parceria Estratégica",
      description: "Construímos relacionamentos duradouros com nossos parceiros.",
    },
  ];

  const defaultStats = [
    { label: "Anos de Experiência", value: "10+", icon: Award },
    { label: "Lojistas Atendidos", value: "500+", icon: Users },
    { label: "Modelos no Catálogo", value: "1000+", icon: Building2 },
    { label: "Taxa de Satisfação", value: "98%", icon: CheckCircle2 },
  ];

  const defaultAchievements = [
    "Certificação ISO 9001",
    "Parceiro Oficial Apple",
    "Parceiro Oficial Samsung",
    "Melhor Assistência Técnica 2023",
    "Reconhecimento de Excelência B2B",
  ];

  const valueIcons = [Shield, Target, TrendingUp, Users];
  const statIcons = [Award, Users, Building2, CheckCircle2];
  const values = (settings?.aboutValuesItems || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [title, description] = line.split("|").map((item) => item.trim());
      return {
        icon: valueIcons[index % valueIcons.length],
        title,
        description,
      };
    })
    .filter((item) => item.title && item.description);
  const stats = (settings?.aboutStatsItems || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [label, value] = line.split("|").map((item) => item.trim());
      return {
        icon: statIcons[index % statIcons.length],
        label,
        value,
      };
    })
    .filter((item) => item.label && item.value);
  const achievements = (settings?.aboutAchievementsItems || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const aboutValues = values.length > 0 ? values : defaultValues;
  const aboutStats = stats.length > 0 ? stats : defaultStats;
  const aboutAchievements = achievements.length > 0 ? achievements : defaultAchievements;
  const { contactWhatsappRaw, whatsappMessage, hasWhatsApp } = getPublicContactInfo(settings);
  const aboutWhatsappUrl = validation.generateWhatsAppUrl(contactWhatsappRaw, whatsappMessage);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main id="main-content" className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary to-primary/80 py-14 sm:py-20">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4 bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
              {settings?.aboutHeroBadge || "Sobre Nós"}
            </Badge>
            <h1 className="mb-6 text-3xl font-bold text-primary-foreground sm:text-4xl md:text-5xl">
              {settings?.aboutHeroTitle || "DonAssistec"}
            </h1>
            <p className="mx-auto mb-8 max-w-3xl text-base text-primary-foreground/90 sm:text-lg md:text-xl">
              {settings?.aboutHeroDescription ||
                "Especialistas em reconstrução de telas e revenda de peças para lojistas e assistências técnicas. Transformando desafios técnicos em soluções de alta qualidade."}
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
              <Link to="/catalogo">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  {settings?.aboutHeroPrimaryLabel || "Explorar Catálogo"}
                </Button>
              </Link>
              <Link to="/contato">
                <Button size="lg" variant="outline" className="w-full gap-2 border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground hover:text-primary sm:w-auto">
                  <MessageCircle className="w-5 h-5" />
                  {settings?.aboutHeroSecondaryLabel || "Falar Conosco"}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-12 sm:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 md:gap-12">
              <Card>
                <CardContent className="p-6 sm:p-8">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Target className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">{settings?.aboutMissionTitle || "Nossa Missão"}</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {settings?.aboutMissionDescription ||
                      "Fornecer soluções completas de reparo e peças de reposição de alta qualidade para lojistas e assistências técnicas, contribuindo para o sucesso dos nossos parceiros através de atendimento especializado e produtos confiáveis."}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 sm:p-8">
                  <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-6">
                    <TrendingUp className="w-8 h-8 text-secondary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">{settings?.aboutVisionTitle || "Nossa Visão"}</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {settings?.aboutVisionDescription ||
                      "Ser referência nacional em reconstrução de telas e distribuição de peças para dispositivos móveis, reconhecida pela excelência técnica, inovação e compromisso com a satisfação dos clientes."}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-muted/30 py-12 sm:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4 md:gap-8">
              {aboutStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="text-center">
                    <CardContent className="p-4 sm:p-6">
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 sm:h-16 sm:w-16">
                        <Icon className="h-6 w-6 text-primary sm:h-8 sm:w-8" />
                      </div>
                      <div className="mb-2 text-2xl font-bold text-foreground sm:text-4xl">
                        {stat.value}
                      </div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-12 sm:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {settings?.aboutValuesTitle || "Nossos Valores"}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {settings?.aboutValuesDescription ||
                  "Princípios que guiam nosso trabalho diário e nossa relação com parceiros e clientes."}
              </p>
            </div>
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
              {aboutValues.map((value, index) => {
                const Icon = value.icon;
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-5 text-center sm:p-6">
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-7 h-7 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                      <p className="text-sm text-muted-foreground">{value.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Achievements */}
        <section className="bg-gradient-to-br from-muted/50 to-background py-12 sm:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardContent className="p-5 sm:p-8">
                  <div className="text-center mb-8">
                    <h2 className="mb-4 flex flex-col items-center justify-center gap-2 text-2xl font-bold text-foreground sm:flex-row sm:text-3xl">
                      <Award className="w-8 h-8 text-primary" />
                      {settings?.aboutAchievementsTitle || "Reconhecimentos e Certificações"}
                    </h2>
                    <p className="text-muted-foreground">
                      {settings?.aboutAchievementsDescription || "Comprometidos com qualidade e excelência em tudo que fazemos"}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {aboutAchievements.map((achievement, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                      >
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                        <span className="font-medium">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary py-12 sm:py-20 text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {settings?.aboutCtaTitle || "Quer Ser Nosso Parceiro?"}
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-base opacity-90 sm:text-xl">
              {settings?.aboutCtaDescription ||
                "Junte-se a centenas de lojistas que confiam na DonAssistec para suas necessidades de reparo e peças."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/lojista/login">
                <Button size="lg" variant="secondary" className="w-full gap-2 sm:w-auto">
                  {settings?.aboutCtaPrimaryLabel || "Criar Conta de Lojista"}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              {hasWhatsApp ? (
                <a href={aboutWhatsappUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="w-full gap-2 border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground hover:text-primary sm:w-auto">
                    <MessageCircle className="w-5 h-5" />
                    {settings?.aboutCtaSecondaryLabel || "Falar no WhatsApp"}
                  </Button>
                </a>
              ) : null}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default About;
