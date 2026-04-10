import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ui/theme-toggle";
import { 
  User, 
  LogOut, 
  Menu, 
  X,
  Store,
  FileText,
  TableProperties,
  PlayCircle,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  Clock3,
  CircleDot,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface RetailerLayoutProps {
  children: React.ReactNode;
}

const RetailerLayout = ({ children }: RetailerLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const handleLogout = () => {
    logout();
    toast.success("Logout realizado com sucesso!");
    navigate("/lojista/login");
  };

  const navItems = [
    {
      label: "Perfil",
      href: "/lojista/perfil",
      icon: User,
    },
    {
      label: "Suporte",
      href: "/lojista/suporte",
      icon: FileText,
    },
    {
      label: "Tabela de Preços",
      href: "/lojista/tabela-precos",
      icon: TableProperties,
    },
    {
      label: "Vídeos Explicativos",
      href: "/lojista/videos-explicativos",
      icon: PlayCircle,
    },
  ];

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  const currentItem = navItems.find((item) => isActive(item.href));

  const approvalMeta = {
    approved: {
      label: "Conta aprovada",
      icon: ShieldCheck,
      tone: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
    },
    pending: {
      label: "Em análise",
      icon: Clock3,
      tone: "bg-amber-500/10 text-amber-700 border-amber-200",
    },
    rejected: {
      label: "Requer atenção",
      icon: CircleDot,
      tone: "bg-rose-500/10 text-rose-700 border-rose-200",
    },
  } as const;

  const approval = approvalMeta[user?.approvalStatus ?? "approved"];
  const ApprovalIcon = approval.icon;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full border-r border-border bg-card transform transition-all duration-300 ease-in-out lg:translate-x-0",
          sidebarCollapsed ? "lg:w-20" : "lg:w-64",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={cn("border-b border-slate-200 bg-sky-950 text-white", sidebarCollapsed ? "p-4" : "p-6")}>
            <Link to="/" className={cn("mb-2 flex items-center gap-3", sidebarCollapsed && "justify-center")}>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-sky-500 to-cyan-600 shadow-lg shadow-sky-950/30">
                <Store className="h-5 w-5 text-white" />
              </div>
              <div className={cn(sidebarCollapsed && "hidden")}>
                <span className="text-xl font-bold text-white">Don</span>
                <span className="text-xl font-bold text-sky-200">Assistec</span>
                <p className="text-xs uppercase tracking-[0.24em] text-sky-200/70">Portal B2B</p>
              </div>
            </Link>
            <p className={cn("text-xs text-sky-100/70", sidebarCollapsed && "hidden")}>Área do Lojista</p>
          </div>

          {/* User Info */}
          {user && (
            <div className={cn("border-b border-border bg-sky-50/70 dark:bg-slate-950/70", sidebarCollapsed ? "p-3" : "p-4")}>
              {sidebarCollapsed ? (
                <div className="flex justify-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700">
                    {user.companyName?.slice(0, 1) || "L"}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sm font-semibold text-sky-800">
                      {user.companyName?.slice(0, 1) || "L"}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {user.companyName}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium", approval.tone)}>
                    <ApprovalIcon className="h-3.5 w-3.5" />
                    {approval.label}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center rounded-xl text-sm font-medium transition-all duration-200",
                    sidebarCollapsed ? "justify-center px-3 py-3" : "gap-3 px-4 py-3.5",
                    active
                      ? "bg-sky-700 text-white shadow-lg shadow-sky-700/20"
                      : "text-slate-600 hover:bg-sky-50 hover:text-sky-900"
                  )}
                  onClick={() => setSidebarOpen(false)}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5" />
                  <span className={cn(sidebarCollapsed && "hidden")}>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="border-t border-slate-200 p-4">
            <Button
              variant="ghost"
              className={cn(
                "w-full rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600",
                sidebarCollapsed ? "justify-center px-0" : "justify-start"
              )}
              onClick={handleLogout}
              title={sidebarCollapsed ? "Sair" : undefined}
            >
              <LogOut className={cn("w-5 h-5", !sidebarCollapsed && "mr-3")} />
              <span className={cn(sidebarCollapsed && "hidden")}>Sair</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={cn("transition-[padding] duration-300", sidebarCollapsed ? "lg:pl-20" : "lg:pl-64")}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/92 dark:bg-slate-950/92 backdrop-blur-md">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex min-h-16 items-center justify-between gap-4 py-3">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  {sidebarOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden text-slate-500 hover:bg-sky-50 hover:text-sky-900 lg:inline-flex"
                  onClick={() => setSidebarCollapsed((current) => !current)}
                  title={sidebarCollapsed ? "Expandir menu" : "Recolher menu"}
                >
                  {sidebarCollapsed ? (
                    <PanelLeftOpen className="w-5 h-5" />
                  ) : (
                    <PanelLeftClose className="w-5 h-5" />
                  )}
                </Button>
              </div>

              <div className="hidden min-w-0 flex-1 lg:block">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Portal do Lojista
                </p>
                <div className="flex items-center gap-3">
                  <h1 className="truncate text-lg font-semibold text-slate-900">
                    {currentItem?.label || "Área do Lojista"}
                  </h1>
                  {!sidebarCollapsed ? (
                    <div className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium", approval.tone)}>
                      <ApprovalIcon className="h-3.5 w-3.5" />
                      {approval.label}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="ml-auto flex items-center gap-3">
                <ThemeToggle />
                <Link to="/">
                  <Button variant="outline" size="sm" className="rounded-xl border-slate-200 text-slate-700 hover:bg-sky-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">
                    Ver Site
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default RetailerLayout;
