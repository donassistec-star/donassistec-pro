import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  User,
  Users,
  LogOut,
  Menu,
  X,
  FileText,
  Settings,
  Smartphone,
  Tag,
  BarChart3,
  Home,
  Shield,
  Star,
  DollarSign,
  TableProperties,
  MessageSquare,
  PackageCheck,
  Ticket,
  Wrench,
  ClipboardList,
  PlayCircle,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNotifications } from "@/contexts/NotificationsContext";
import NotificationsComponent from "@/components/Notifications";
import { retailersService } from "@/services/retailersService";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const notifications = useNotifications();
  const { addNotification } = notifications;

  useEffect(() => {
    if (user?.source !== "admin_team") {
      return;
    }

    let isMounted = true;
    const storageKey = "donassistec_pending_retailer_notification_keys";

    const loadPendingRetailerNotifications = async () => {
      try {
        const retailers = await retailersService.getAll();
        if (!isMounted) return;

        const pendingRetailers = retailers.filter((retailer) => retailer.approval_status === "pending");
        const storedKeys = new Set<string>(
          JSON.parse(localStorage.getItem(storageKey) || "[]") as string[]
        );

        pendingRetailers.forEach((retailer) => {
          const notificationKey = `${retailer.id}:${retailer.updated_at || retailer.created_at || "sem-data"}`;
          if (storedKeys.has(notificationKey)) {
            return;
          }

          addNotification({
            type: "warning",
            title: "Novo cadastro de lojista pendente",
            message: `${retailer.company_name} (${retailer.email}) aguarda aprovação administrativa.`,
          });
          storedKeys.add(notificationKey);
        });

        localStorage.setItem(storageKey, JSON.stringify(Array.from(storedKeys)));
      } catch {
        // Falha silenciosa; a tela de lojistas já trata erro de listagem.
      }
    };

    loadPendingRetailerNotifications();
    const intervalId = window.setInterval(loadPendingRetailerNotifications, 30000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [addNotification, user?.source]);

  const handleLogout = () => {
    logout();
    toast.success("Logout realizado com sucesso!");
    navigate("/admin/login");
  };

  const allNavItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, moduleKey: "dashboard" },
    { label: "Conteúdo da Home", href: "/admin/home-content", icon: Home, moduleKey: "home-content" },
    { label: "Modelos", href: "/admin/modelos", icon: Smartphone, moduleKey: "modelos" },
    { label: "Marcas", href: "/admin/marcas", icon: Tag, moduleKey: "marcas" },
    { label: "Serviços", href: "/admin/servicos", icon: Wrench, moduleKey: "servicos" },
    { label: "Pedidos", href: "/admin/pedidos", icon: Package, moduleKey: "pedidos" },
    { label: "Pré-pedidos", href: "/admin/pre-pedidos", icon: ClipboardList, moduleKey: "pre-pedidos" },
    { label: "Tickets de Suporte", href: "/admin/tickets", icon: MessageSquare, moduleKey: "tickets" },
    { label: "Estoque", href: "/admin/estoque", icon: PackageCheck, moduleKey: "estoque" },
    { label: "Cupons", href: "/admin/cupons", icon: Ticket, moduleKey: "cupons" },
    { label: "Lojistas", href: "/admin/lojistas", icon: User, moduleKey: "lojistas" },
    { label: "Relatórios", href: "/admin/relatorios", icon: BarChart3, moduleKey: "relatorios" },
    { label: "Avaliações", href: "/admin/avaliacoes", icon: Star, moduleKey: "avaliacoes" },
    { label: "Preços Dinâmicos", href: "/admin/precos-dinamicos", icon: DollarSign, moduleKey: "precos-dinamicos" },
    { label: "Tabela de Preços", href: "/admin/tabela-precos", icon: TableProperties, moduleKey: "tabela-precos" },
    { label: "Logs de Auditoria", href: "/admin/logs", icon: FileText, moduleKey: "logs" },
    { label: "Configurações", href: "/admin/configuracoes", icon: Settings, moduleKey: "configuracoes" },
    { label: "Vídeos do Lojista", href: "/admin/videos-lojista", icon: PlayCircle, moduleKey: "videos-lojista" },
    { label: "Usuarios", href: "/admin/equipe", icon: Users, moduleKey: "equipe" },
  ];

  const canSeeEquipe = user?.source === "admin_team" && user?.role === "admin";
  const navItems =
    user?.modules && user.modules.length > 0
      ? allNavItems.filter((item) => {
          if (item.moduleKey === "equipe") return canSeeEquipe;
          return user.modules!.includes(item.moduleKey);
        })
      : allNavItems.filter(
          (item) => item.moduleKey !== "equipe" || canSeeEquipe
        );

  return (
    <div className="min-h-screen bg-background">
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
          "fixed top-0 left-0 z-50 h-full bg-card border-r transform transition-all duration-300 ease-in-out lg:translate-x-0",
          sidebarCollapsed ? "lg:w-20" : "lg:w-64",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={cn("flex items-center justify-between border-b", sidebarCollapsed ? "p-3" : "p-4")}>
            <Link to="/admin/dashboard" className={cn("flex items-center gap-2", sidebarCollapsed && "justify-center")}>
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className={cn(sidebarCollapsed && "hidden")}>
                <span className="text-lg font-bold text-foreground">Admin</span>
                <span className="text-lg font-bold text-primary">Panel</span>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center rounded-lg transition-colors",
                    sidebarCollapsed ? "justify-center px-3 py-3" : "gap-3 px-4 py-3",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  onClick={() => setSidebarOpen(false)}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5" />
                  <span className={cn("font-medium", sidebarCollapsed && "hidden")}>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t">
            <div className={cn("mb-4 rounded-lg bg-muted", sidebarCollapsed ? "p-2" : "flex items-center gap-3 p-3")}>
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mx-auto lg:mx-0">
                <User className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className={cn("flex-1 min-w-0", sidebarCollapsed && "hidden")}>
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.contactName || "Admin"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className={cn("w-full", sidebarCollapsed ? "justify-center px-0" : "")}
              onClick={handleLogout}
              title={sidebarCollapsed ? "Sair" : undefined}
            >
              <LogOut className={cn("w-4 h-4", !sidebarCollapsed && "mr-2")} />
              <span className={cn(sidebarCollapsed && "hidden")}>Sair</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={cn("transition-[padding] duration-300", sidebarCollapsed ? "lg:pl-20" : "lg:pl-64")}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:inline-flex"
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

            <div className="ml-auto flex items-center gap-4">
              <NotificationsComponent
                notifications={notifications.notifications}
                onMarkAsRead={notifications.markAsRead}
                onRemove={notifications.removeNotification}
                onMarkAllAsRead={notifications.markAllAsRead}
                unreadCount={notifications.unreadCount}
              />
              <Link to="/" target="_blank">
                <Button variant="ghost" size="sm">
                  Ver Site
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
