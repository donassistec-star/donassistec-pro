import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Smartphone, KeyRound } from "lucide-react";

const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <a href="#main-content" className="skip-to-content">
        Pular para o conteúdo principal
      </a>
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <span className="text-lg font-heading font-bold text-foreground">Don</span>
                <span className="text-lg font-heading font-bold text-primary"> Tech</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Início
              </Link>
              <Link to="/sobre" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Sobre
              </Link>
              <Link to="/ajuda" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Ajuda
              </Link>
            </nav>

            {/* Portal do Parceiro */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="text-muted-foreground"
                onClick={() => navigate("/lojista/login")}
              >
                <KeyRound className="w-4 h-4 mr-1.5" />
                Portal do Parceiro
              </Button>
            </div>

            {/* Mobile toggle */}
            <button
              className="md:hidden p-2 text-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-card border-t border-border">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-3">
              <Link to="/" className="text-base font-medium text-foreground hover:text-primary py-2" onClick={() => setIsMenuOpen(false)}>
                Início
              </Link>
              <Link to="/sobre" className="text-base font-medium text-foreground hover:text-primary py-2" onClick={() => setIsMenuOpen(false)}>
                Sobre
              </Link>
              <Link to="/ajuda" className="text-base font-medium text-foreground hover:text-primary py-2" onClick={() => setIsMenuOpen(false)}>
                Ajuda
              </Link>
              <Button
                variant="outline"
                className="mt-2 justify-start"
                onClick={() => {
                  navigate("/lojista/login");
                  setIsMenuOpen(false);
                }}
              >
                <KeyRound className="w-4 h-4 mr-2" />
                Portal do Parceiro
              </Button>
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
