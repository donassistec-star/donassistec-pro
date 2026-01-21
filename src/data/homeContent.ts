export interface HomeFeature {
  id: string;
  title: string;
  description: string;
}

export interface HomeStat {
  id: string;
  value: string;
  label: string;
  description: string;
}

export interface HomeStep {
  id: string;
  number: string;
  title: string;
  description: string;
  action?: string | null;
  href?: string | null;
}

export interface HomeContent {
  heroBadge?: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage?: string;
  heroCtaLabel: string;
  heroCtaLink?: string;
  heroSecondaryCtaLabel: string;
  featuresTitle: string;
  featuresSubtitle: string;
  features: HomeFeature[];
  statsTitle: string;
  statsSubtitle: string;
  stats: HomeStat[];
  processTitle: string;
  processSubtitle: string;
  steps: HomeStep[];
}

export const defaultHomeContent: HomeContent = {
  heroBadge: "Laboratório Premium B2B",
  heroTitle: "Reconstrução de Telas e Peças Premium para Lojistas",
  heroSubtitle:
    "A DonAssistec conecta sua loja a um catálogo completo de modelos, peças e serviços de reconstrução com qualidade de fábrica.",
  heroImage: undefined,
  heroCtaLabel: "Explorar Catálogo",
  heroCtaLink: "/catalogo",
  heroSecondaryCtaLabel: "Área do Lojista",
  featuresTitle: "Por Que Escolher a DonAssistec?",
  featuresSubtitle:
    "Oferecemos os melhores produtos e serviços com os maiores diferenciais do mercado.",
  features: [
    {
      id: "fast-delivery",
      title: "Entrega Rápida",
      description:
        "Processamento rápido de pedidos com logística pensada para o dia a dia do lojista.",
    },
    {
      id: "full-warranty",
      title: "Garantia Total",
      description:
        "90 dias de garantia em todos os produtos e serviços de reconstrução.",
    },
    {
      id: "premium-quality",
      title: "Qualidade Premium",
      description:
        "Produtos de alta qualidade com rigoroso controle em cada etapa.",
    },
  ],
  statsTitle: "Resultados que Comprovam",
  statsSubtitle:
    "Nossos números mostram a confiança dos lojistas e a qualidade das entregas.",
  stats: [
    {
      id: "models",
      value: "500+",
      label: "Modelos Compatíveis",
      description:
        "Trabalhamos com todas as principais marcas e modelos do mercado.",
    },
    {
      id: "screens",
      value: "10k+",
      label: "Telas Reconstruídas",
      description: "Experiência comprovada em reconstrução de telas.",
    },
    {
      id: "retailers",
      value: "500+",
      label: "Lojistas Parceiros",
      description: "Centenas de lojistas confiam na DonAssistec.",
    },
  ],
  processTitle: "Como Funciona o Processo?",
  processSubtitle:
    "Um fluxo simples e eficiente para abastecer sua loja com peças e serviços.",
  steps: [
    {
      id: "step-1",
      number: "01",
      title: "Explore o Catálogo",
      description:
        "Navegue pelo nosso catálogo completo de modelos e peças disponíveis.",
      action: "Ver Catálogo",
      href: "/catalogo",
    },
    {
      id: "step-2",
      number: "02",
      title: "Solicite um Orçamento",
      description:
        "Entre em contato via WhatsApp ou e-mail para solicitar um orçamento personalizado.",
      action: "Falar no WhatsApp",
      href: "#contato",
    },
    {
      id: "step-3",
      number: "03",
      title: "Receba o Orçamento",
      description:
        "Nossa equipe envia um orçamento detalhado com preços e prazos de entrega.",
    },
    {
      id: "step-4",
      number: "04",
      title: "Aprove e Receba",
      description:
        "Após aprovação, processamos seu pedido e entregamos no prazo acordado.",
      action: "Criar Conta",
      href: "/lojista/login",
    },
  ],
};

