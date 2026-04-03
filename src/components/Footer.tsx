import { Smartphone, Mail, Phone, MapPin, Instagram, Facebook, Youtube, Linkedin, Twitter } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/contexts/AuthContext";

const Footer = () => {
  const { settings, loading } = useSettings();
  const location = useLocation();
  const { user } = useAuth();
  const isHome = location.pathname === "/";
  const isLojista = user?.role === "retailer";

  if (loading) {
    return null; // Retorna null durante o carregamento para evitar flash de conteúdo
  }

  const contactPhone = settings?.contactPhone || "(11) 99999-9999";
  const contactPhoneRaw = settings?.contactPhoneRaw || "5511999999999";
  const contactEmail = settings?.contactEmail || "contato@donassistec.com.br";
  const contactAddress = settings?.contactAddress || "São Paulo - SP";
  const showCompanyTradeName = settings?.showCompanyTradeName !== false;

  return (
    <footer className="bg-foreground pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              {settings?.brandingLogoUrl ? (
                <img
                  src={settings.brandingLogoUrl}
                  alt={settings.companyTradeName || settings.siteName || "Logo"}
                  className="h-10 w-auto object-contain"
                  onError={(e) => {
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
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-primary-foreground" />
                </div>
              )}
              {showCompanyTradeName ? (
                <div>
                  {(() => {
                    const name = settings?.companyTradeName || 'Don Assistec';
                    const words = name.split(' ').filter(Boolean);
                    const first = words[0] || 'Don';
                    const rest = words.slice(1).join(' ');
                    return (
                      <>
                        <span className="text-xl font-bold text-card">{first}</span>
                        {rest ? <span className="text-xl font-bold text-primary"> {rest}</span> : null}
                      </>
                    );
                  })()}
                </div>
              ) : null}
            </div>
            <p className="text-card/70 mb-4">
              {settings?.companyDescription || 
                "Laboratório premium de reconstrução de telas e revenda de peças para lojistas e assistências técnicas."}
            </p>
            {settings?.companySlogan && (
              <p className="text-sm font-semibold text-primary mb-4">
                {settings.companySlogan}
              </p>
            )}
            <div className="flex gap-3">
              {settings?.socialInstagram && (
                <a href={settings.socialInstagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-card/10 flex items-center justify-center text-card/70 hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {settings?.socialFacebook && (
                <a href={settings.socialFacebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-card/10 flex items-center justify-center text-card/70 hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {settings?.socialYoutube && (
                <a href={settings.socialYoutube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-card/10 flex items-center justify-center text-card/70 hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
              )}
              {settings?.socialLinkedin && (
                <a href={settings.socialLinkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-card/10 flex items-center justify-center text-card/70 hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {settings?.socialTwitter && (
                <a href={settings.socialTwitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-card/10 flex items-center justify-center text-card/70 hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-card mb-4">Links Rápidos</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-card/70 hover:text-primary transition-colors">Home</Link></li>
              {isLojista && <li><Link to="/catalogo" className="text-card/70 hover:text-primary transition-colors">Catálogo</Link></li>}
              <li><Link to="/favoritos" className="text-card/70 hover:text-primary transition-colors">Favoritos</Link></li>
              <li><Link to="/sobre" className="text-card/70 hover:text-primary transition-colors">Sobre Nós</Link></li>
              <li><a href="#servicos" className="text-card/70 hover:text-primary transition-colors">Serviços</a></li>
              <li><a href="#marcas" className="text-card/70 hover:text-primary transition-colors">Marcas</a></li>
              <li><a href="#contato" className="text-card/70 hover:text-primary transition-colors">Contato</a></li>
              <li><Link to="/lojista/login" className="text-card/70 hover:text-primary transition-colors">Área do Lojista</Link></li>
              {isHome && <li><Link to="/admin/login" className="text-card/70 hover:text-primary transition-colors">Área do Administrador</Link></li>}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-card mb-4">Serviços</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-card/70 hover:text-primary transition-colors">Reconstrução de Telas</a></li>
              <li><a href="#" className="text-card/70 hover:text-primary transition-colors">Troca de Vidro</a></li>
              <li><a href="#" className="text-card/70 hover:text-primary transition-colors">Revenda de Peças</a></li>
              <li><a href="#" className="text-card/70 hover:text-primary transition-colors">Peças Apple</a></li>
              <li><a href="#" className="text-card/70 hover:text-primary transition-colors">Peças Samsung</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-card mb-4">Contato</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-card/70">
                <Phone className="w-5 h-5 text-primary" />
                <a href={`tel:${contactPhoneRaw}`} className="hover:text-primary transition-colors">
                  {contactPhone}
                </a>
              </li>
              <li className="flex items-center gap-3 text-card/70">
                <Mail className="w-5 h-5 text-primary" />
                <a href={`mailto:${contactEmail}`} className="hover:text-primary transition-colors">
                  {contactEmail}
                </a>
              </li>
              <li className="flex items-start gap-3 text-card/70">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                {contactAddress}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-card/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-card/50 text-sm">
              © 2025 DonAssistec. Todos os direitos reservados.
            </p>
            <div className="flex gap-6 text-sm">
              <Link to="/privacidade" className="text-card/50 hover:text-primary transition-colors">Política de Privacidade</Link>
              <Link to="/termos" className="text-card/50 hover:text-primary transition-colors">Termos de Uso</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
