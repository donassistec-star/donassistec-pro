import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, X, Phone, Smartphone, FileText, Heart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import Notifications from "@/components/Notifications";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getTotalItems } = useCart();
  const { favorites } = useFavorites();
  const { settings } = useSettings();
  const { user } = useAuth();
  const { notifications, markAsRead, removeNotification, markAllAsRead, unreadCount } = useNotifications();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const preOrcamentoCount = getTotalItems();
  const favoritesCount = favorites.length;
  const isHome = location.pathname === "/";
  const isLojista = user?.role === "retailer";

  const contactPhone = settings?.contactPhone || "(11) 99999-9999";
  const contactPhoneRaw = settings?.contactPhoneRaw || "5511999999999";

  const navLinks = [
    { label: "Home", href: "/" },
    ...(isLojista ? [{ label: "Catálogo", href: "/catalogo" }] : []),
    { label: "Favoritos", href: "/favoritos" },
    { label: "Sobre", href: "/sobre" },
    { label: "Ajuda", href: "/ajuda" },
    { label: "Serviços", href: "/#servicos" },
    { label: "Marcas", href: "/#marcas" },
    { label: "Contato", href: "/#contato" },
  ];

  return (
    <>
      <a href="#main-content" className="skip-to-content">
        Pular para o conteúdo principal
      </a>
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              {settings?.brandingLogoUrl ? (
                <img
                  src={settings.brandingLogoUrl}
                  alt={settings.companyTradeName || settings.siteName || "Logo"}
                  className="h-10 w-auto object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector(".logo-fallback")) {
                      const fallback = document.createElement("div");
                      fallback.className = "logo-fallback w-10 h-10 rounded-lg bg-primary flex items-center justify-center";
                      fallback.innerHTML =
                        '<svg class="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>';
                      parent.insertBefore(fallback, target);
                    }
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-primary-foreground" />
                </div>
              )}
              <div>
                {(() => {
                  const name = settings?.companyTradeName || "Don Assistec";
                  const words = name.split(" ").filter(Boolean);
                  const first = words[0] || "Don";
                  const rest = words.slice(1).join(" ");
                  return (
                    <>
                      <span className="text-xl font-bold text-foreground">{first}</span>
                      {rest ? <span className="text-xl font-bold text-primary"> {rest}</span> : null}
                    </>
                  );
                })()}
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) =>
                link.href.startsWith("/") ? (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                )
              )}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-4">
              <a
                href={`tel:${contactPhoneRaw}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4" />
                {contactPhone}
              </a>
              <Notifications
                notifications={notifications}
                onMarkAsRead={markAsRead}
                onRemove={removeNotification}
                onMarkAllAsRead={markAllAsRead}
                unreadCount={unreadCount}
              />
              <Button
                variant="outline"
                size="icon"
                className="relative"
                onClick={() => navigate("/favoritos")}
                title="Favoritos"
              >
                <Heart className="w-5 h-5" />
                {favoritesCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                    {favoritesCount}
                  </Badge>
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="relative"
                onClick={() => navigate("/carrinho")}
                title="Pré-orçamento"
              >
                <FileText className="w-5 h-5" />
                {preOrcamentoCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-primary text-primary-foreground text-xs">
                    {preOrcamentoCount}
                  </Badge>
                )}
              </Button>
              <Button variant="secondary" onClick={() => navigate("/lojista/dashboard")}>
                Área do Lojista
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button className="lg:hidden p-2 text-foreground" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-card border-t border-border">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
              {navLinks.map((link) =>
                link.href.startsWith("/") ? (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="text-base font-medium text-foreground hover:text-primary transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-base font-medium text-foreground hover:text-primary transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                )
              )}
              <div className="flex items-center gap-2 mt-2">
                <Notifications
                  notifications={notifications}
                  onMarkAsRead={markAsRead}
                  onRemove={removeNotification}
                  onMarkAllAsRead={markAllAsRead}
                  unreadCount={unreadCount}
                />
              </div>
              <Button
                variant="outline"
                className="mt-2 relative justify-start"
                onClick={() => {
                  navigate("/favoritos");
                  setIsMenuOpen(false);
                }}
              >
                <Heart className="w-4 h-4 mr-2" />
                Favoritos
                {favoritesCount > 0 && <Badge className="ml-auto bg-red-500 text-white">{favoritesCount}</Badge>}
              </Button>
              <Button
                variant="outline"
                className="mt-2 relative justify-start"
                onClick={() => {
                  navigate("/carrinho");
                  setIsMenuOpen(false);
                }}
              >
                <FileText className="w-4 h-4 mr-2" />
                Pré-orçamento
                {preOrcamentoCount > 0 && (
                  <Badge className="ml-auto bg-primary text-primary-foreground">{preOrcamentoCount}</Badge>
                )}
              </Button>
              <Button variant="secondary" onClick={() => navigate("/lojista/dashboard")}>
                Área do Lojista
              </Button>
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
