import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, X, Phone, Smartphone, Heart, Shield } from "lucide-react";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/contexts/AuthContext";
import { getPublicContactInfo } from "@/utils/publicContact";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { favorites } = useFavorites();
  const { settings } = useSettings();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const favoritesCount = favorites.length;
  const isLojista = user?.role === "retailer";

  const { contactPhone, contactPhoneRaw, hasPhone } = getPublicContactInfo(settings);
  const showFavorites = settings?.showNavFavorites !== false;
  const showAdminAccessButton = settings?.showAdminAccessButton !== false;
  const showHeaderPhone = settings?.showHeaderPhone !== false;
  const showRetailerAreaButton = settings?.showRetailerAreaButton !== false;
  const showCompanyTradeName = (settings?.showCompanyTradeNameHeader ?? settings?.showCompanyTradeName) !== false;

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: "Home", href: "/", visible: settings?.showNavHome !== false },
    { label: "Catálogo", href: "/catalogo", visible: isLojista && settings?.showNavCatalog !== false },
    { label: "Favoritos", href: "/favoritos", visible: settings?.showNavFavorites !== false },
    { label: "Sobre", href: "/sobre", visible: settings?.showNavAbout !== false },
    { label: "Ajuda", href: "/ajuda", visible: settings?.showNavHelp !== false },
    { label: "Serviços", href: "/#servicos", visible: settings?.showNavServices !== false },
    { label: "Marcas", href: "/#marcas", visible: settings?.showNavBrands !== false },
    { label: "Contato", href: "/contato", visible: settings?.showNavContact !== false },
  ].filter((link) => link.visible);

  return (
    <>
      <a href="#main-content" className="skip-to-content">
        Pular para o conteúdo principal
      </a>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-card/95 backdrop-blur-md">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex h-16 items-center justify-between gap-3 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex min-w-0 items-center gap-2">
            {settings?.brandingLogoUrl ? (
              <img
                src={settings.brandingLogoUrl}
                alt={settings.companyTradeName || settings.siteName || "Logo"}
                className="h-10 w-auto max-w-[124px] object-contain sm:h-11 sm:max-w-[148px] lg:h-14 lg:max-w-[180px]"
                onError={(e) => {
                  // Fallback para ícone se logo não carregar
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent && !parent.querySelector('.logo-fallback')) {
                    const fallback = document.createElement('div');
                    fallback.className = 'logo-fallback w-10 h-10 rounded-lg bg-primary flex items-center justify-center';
                    fallback.innerHTML = '<svg class="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>';
                    parent.insertBefore(fallback, target);
                  }
                }}
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary sm:h-11 sm:w-11 lg:h-14 lg:w-14">
                <Smartphone className="h-5 w-5 text-primary-foreground sm:h-6 sm:w-6" />
              </div>
            )}
            {showCompanyTradeName ? (
              <div className="hidden min-[360px]:block min-w-0">
                {(() => {
                  const name = settings?.companyTradeName || 'Don Assistec';
                  const words = name.split(' ').filter(Boolean);
                  const first = words[0] || 'Don';
                  const rest = words.slice(1).join(' ');
                  return (
                    <div className="truncate">
                      <span className="text-base font-bold text-foreground sm:text-lg lg:text-xl">{first}</span>
                      {rest ? <span className="text-base font-bold text-primary sm:text-lg lg:text-xl"> {rest}</span> : null}
                    </div>
                  );
                })()}
              </div>
            ) : null}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
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
            ))}
            {showAdminAccessButton && (
              <Link
                to="/admin"
                className="text-muted-foreground hover:text-primary transition-colors"
                title="Admin"
                aria-label="Admin"
              >
                <Shield className="w-5 h-5" />
              </Link>
            )}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            {showHeaderPhone && hasPhone && (
              <a href={`tel:${contactPhoneRaw}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Phone className="w-4 h-4" />
                {contactPhone}
              </a>
            )}
            {showFavorites && (
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
            )}
            {showRetailerAreaButton && (
              <Button
                variant="secondary"
                className="!bg-[#0ea5e9] !text-white hover:!bg-[#38bdf8] border-none"
                onClick={() => navigate("/lojista/dashboard")}
              >
                Área do Lojista
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="rounded-xl p-2 text-foreground transition-colors hover:bg-muted/60 lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="max-h-[calc(100svh-4rem)] overflow-y-auto border-t border-border bg-card lg:hidden">
          <nav className="container mx-auto flex flex-col gap-2 px-4 py-4">
            {navLinks.map((link) => (
              link.href.startsWith("/") ? (
                <Link
                  key={link.label}
                  to={link.href}
                  className="rounded-xl px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted/60 hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="rounded-xl px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted/60 hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </a>
              )
            ))}
            {showAdminAccessButton && (
              <Link
                to="/admin"
                className="inline-flex items-center rounded-xl px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted/60 hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
                title="Admin"
                aria-label="Admin"
              >
                <Shield className="w-5 h-5" />
              </Link>
            )}
            {showFavorites && (
              <Button 
                variant="outline" 
                className="mt-3 h-11 justify-start rounded-xl"
                onClick={() => {
                  navigate("/favoritos");
                  setIsMenuOpen(false);
                }}
              >
                <Heart className="w-4 h-4 mr-2" />
                Favoritos
                {favoritesCount > 0 && (
                  <Badge className="ml-auto bg-red-500 text-white">
                    {favoritesCount}
                  </Badge>
                )}
              </Button>
            )}
            {showRetailerAreaButton && (
              <Button 
                variant="secondary"
                className="mt-2 h-11 rounded-xl"
                onClick={() => {
                  navigate("/lojista/dashboard");
                  setIsMenuOpen(false);
                }}
              >
                Área do Lojista
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
    </>
  );
};

export default Header;
