export interface HelpFaqItem {
  question: string;
  answer: string;
}

export interface HelpFaqGroup {
  category: string;
  questions: HelpFaqItem[];
}

export interface HelpFaqDraft {
  category: string;
  question: string;
  answer: string;
}

export interface HelpHighlightItem {
  title: string;
  description: string;
}

export const defaultHelpFaqs: HelpFaqGroup[] = [
  {
    category: "Geral",
    questions: [
      {
        question: "Como agendo um reparo?",
        answer: "Acesse o catálogo, confira o valor do reparo e use o botão Orçamento (WhatsApp) para enviar seu orçamento. Nossa equipe retornará em seguida.",
      },
      {
        question: "Qual o prazo de entrega?",
        answer: "Nosso prazo médio é de 1 dia para a maioria dos reparos, pois seguimos um processo minucioso para garantir um serviço de excelência.",
      },
      {
        question: "Qual a garantia das peças e serviços ?",
        answer: "Todos as peças e serviços possuem garantia de qualidade. Detalhes específicos são informados no orçamento de cada reparo",
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
        answer: "Trabalhamos com as principais marcas do mercado: Apple, Samsung, Xiaomi, Motorola, LG .",
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

export const defaultHelpHighlights: HelpHighlightItem[] = [
  {
    title: "Busca instantanea",
    description: "Encontre respostas por palavra-chave e filtre por categoria em poucos cliques.",
  },
  {
    title: "Suporte rapido",
    description: "Acesse WhatsApp, telefone ou e-mail direto da central de ajuda.",
  },
  {
    title: "Conteudo organizado",
    description: "Agrupe perguntas frequentes por tema para orientar clientes e lojistas.",
  },
];

export const parseHelpFaqItems = (value?: string): HelpFaqDraft[] =>
  (value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [category = "", question = "", answer = ""] = line
        .split("|")
        .map((item) => item.trim());

      return { category, question, answer };
    })
    .filter((item) => item.category || item.question || item.answer);

export const serializeHelpFaqItems = (items: HelpFaqDraft[]) =>
  items
    .map((item) => ({
      category: item.category.trim(),
      question: item.question.trim(),
      answer: item.answer.trim(),
    }))
    .filter((item) => item.category && item.question && item.answer)
    .map((item) => `${item.category}|${item.question}|${item.answer}`)
    .join("\n");

export const parseHelpHighlights = (value?: string | null): HelpHighlightItem[] => {
  const parsedItems = (value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title = "", description = ""] = line.split("|").map((item) => item.trim());
      return { title, description };
    })
    .filter((item) => item.title && item.description);

  return parsedItems.length > 0 ? parsedItems : defaultHelpHighlights;
};

export const serializeHelpHighlights = (items: HelpHighlightItem[]) =>
  items
    .map((item) => ({
      title: item.title.trim(),
      description: item.description.trim(),
    }))
    .filter((item) => item.title && item.description)
    .map((item) => `${item.title}|${item.description}`)
    .join("\n");

export const parseHelpFaqs = (rawFaqItems?: string | null): HelpFaqGroup[] => {
  const parsedFaqs = parseHelpFaqItems(rawFaqItems)
    .filter((item) => item.category && item.question && item.answer);

  if (parsedFaqs.length === 0) {
    return defaultHelpFaqs;
  }

  return Object.values(
    parsedFaqs.reduce<Record<string, HelpFaqGroup>>((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = { category: item.category, questions: [] };
      }

      acc[item.category].questions.push({
        question: item.question,
        answer: item.answer,
      });

      return acc;
    }, {})
  );
};
