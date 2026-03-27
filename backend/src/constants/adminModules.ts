/** Lista de todos os módulos do painel admin (module_key) */
export const ALL_ADMIN_MODULES = [
  "dashboard",
  "home-content",
  "modelos",
  "marcas",
  "servicos",
  "pedidos",
  "pre-pedidos",
  "tickets",
  "estoque",
  "cupons",
  "lojistas",
  "relatorios",
  "avaliacoes",
  "precos-dinamicos",
  "logs",
  "configuracoes",
  "equipe",
] as const;

export type AdminModuleKey = (typeof ALL_ADMIN_MODULES)[number];

/** Labels para exibição (module_key -> label) */
export const ADMIN_MODULE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  "home-content": "Conteúdo da Home",
  modelos: "Modelos",
  marcas: "Marcas",
  servicos: "Serviços",
  pedidos: "Pedidos",
  "pre-pedidos": "Pré-pedidos",
  tickets: "Tickets de Suporte",
  estoque: "Estoque",
  cupons: "Cupons",
  lojistas: "Lojistas",
  relatorios: "Relatórios",
  avaliacoes: "Avaliações",
  "precos-dinamicos": "Preços Dinâmicos",
  logs: "Logs de Auditoria",
  configuracoes: "Configurações",
  equipe: "Equipe",
};
