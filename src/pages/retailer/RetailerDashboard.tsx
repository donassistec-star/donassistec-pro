import RetailerLayout from "@/components/retailer/RetailerLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  LifeBuoy,
  PackageSearch,
  PlayCircle,
  Store,
  TableProperties,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const quickActions = [
  {
    title: "Meu Perfil",
    description: "Atualize cadastro, contato e informações da empresa.",
    href: "/lojista/perfil",
    icon: User,
  },
  {
    title: "Tabela de Preços",
    description: "Consulte valores e serviços disponíveis para lojistas.",
    href: "/lojista/tabela-precos",
    icon: TableProperties,
  },
  {
    title: "Suporte",
    description: "Fale com a equipe para tirar dúvidas e destravar processos.",
    href: "/lojista/suporte",
    icon: LifeBuoy,
  },
  {
    title: "Vídeos Explicativos",
    description: "Assista aos tutoriais de cadastro, pedidos e operação.",
    href: "/lojista/videos-explicativos",
    icon: PlayCircle,
  },
];

const journeyCards = [
  {
    title: "Atualizar cadastro",
    description: "Confira seus dados da empresa e mantenha o acesso sempre consistente.",
    href: "/lojista/perfil",
  },
  {
    title: "Consultar tabela",
    description: "Use a tabela exclusiva para avaliar serviços e organizar seu atendimento.",
    href: "/lojista/tabela-precos",
  },
  {
    title: "Assistir vídeos",
    description: "Veja os tutoriais para entender melhor o fluxo operacional da plataforma.",
    href: "/lojista/videos-explicativos",
  },
];

const RetailerDashboard = () => {
  const { user } = useAuth();
  const { getTotalItems } = useCart();
  const totalCartItems = getTotalItems();

  const approvalMeta = {
    approved: {
      label: "Conta liberada para operar",
      description: "Seu acesso está pronto para consultar tabelas, montar pedidos e acompanhar o fluxo.",
      tone: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
    },
    pending: {
      label: "Cadastro em análise",
      description: "Enquanto a liberação é concluída, você já pode organizar seus acessos e revisar o portal.",
      tone: "bg-amber-500/10 text-amber-700 border-amber-200",
    },
    rejected: {
      label: "Cadastro requer ajuste",
      description: "Revise seus dados e fale com o suporte para regularizar a conta.",
      tone: "bg-rose-500/10 text-rose-700 border-rose-200",
    },
  } as const;

  const approval = approvalMeta[user?.approvalStatus ?? "approved"];

  const highlights = [
    {
      label: "Status da conta",
      value: approval.label,
      helper: "Acompanhamento do acesso lojista",
      icon: CheckCircle2,
    },
    {
      label: "Itens no carrinho",
      value: totalCartItems === 0 ? "Vazio" : `${totalCartItems} item(ns)`,
      helper: "Resumo do orçamento em andamento",
      icon: PackageSearch,
    },
    {
      label: "Atalhos ativos",
      value: `${quickActions.length}`,
      helper: "Recursos principais desta área",
      icon: BarChart3,
    },
    {
      label: "Portal B2B",
      value: "Operacional",
      helper: "Catálogo, suporte e acompanhamento centralizados",
      icon: Store,
    },
  ];

  return (
    <RetailerLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[1.35fr_0.85fr]">
            <div className="bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.22),_transparent_38%),linear-gradient(135deg,#0f172a_0%,#111827_45%,#1d4ed8_100%)] p-8 text-white sm:p-10">
              <div className={cn("inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold", approval.tone, "border-white/10 bg-white/10 text-white")}>
                {approval.label}
              </div>
              <div className="mt-6 max-w-2xl space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200">
                  Área do Lojista
                </p>
                <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
                  Acesse rapidamente os recursos essenciais da sua área do lojista.
                </h1>
                <p className="max-w-xl text-sm leading-7 text-slate-200 sm:text-base">
                  {approval.description}
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/lojista/perfil">
                  <Button className="rounded-xl bg-white text-slate-950 hover:bg-slate-100">
                    Meu perfil
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/lojista/suporte">
                  <Button
                    variant="outline"
                    className="rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                  >
                    Abrir suporte
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid gap-3 bg-slate-50 p-6 sm:grid-cols-2 lg:grid-cols-1 lg:p-8">
              {highlights.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          {item.label}
                        </p>
                        <p className="mt-3 text-lg font-semibold text-slate-900">
                          {item.value}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {item.helper}
                        </p>
                      </div>
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <Card className="rounded-[24px] border-slate-200 bg-white shadow-sm">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl text-slate-950">Ações rápidas</CardTitle>
              <CardDescription className="text-sm leading-6 text-slate-500">
                Os acessos que mais aceleram sua rotina comercial dentro da plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <Link key={action.href} to={action.href} className="h-full">
                    <div className="group flex h-full min-h-48 flex-col rounded-3xl border border-slate-200 bg-slate-50 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-sky-200 hover:bg-white hover:shadow-lg hover:shadow-sky-100/70">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="mt-5 space-y-2">
                        <h3 className="text-base font-semibold text-slate-900">
                          {action.title}
                        </h3>
                        <p className="text-sm leading-6 text-slate-500">
                          {action.description}
                        </p>
                      </div>
                      <div className="mt-auto flex items-center gap-2 pt-6 text-sm font-medium text-sky-700">
                        Acessar
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          <Card className="rounded-[24px] border-slate-200 bg-white shadow-sm">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl text-slate-950">Próximos passos</CardTitle>
              <CardDescription className="text-sm leading-6 text-slate-500">
                Um fluxo simples para sair do acesso e chegar rápido ao pedido.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {journeyCards.map((step, index) => (
                <Link
                  key={step.title}
                  to={step.href}
                  className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-sky-200 hover:bg-white"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-slate-900">
                        {step.title}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </RetailerLayout>
  );
};

export default RetailerDashboard;
