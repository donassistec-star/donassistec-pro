import { Smartphone, Mail, Phone, MapPin, Instagram } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <span className="text-lg font-heading font-bold">Don</span>
                <span className="text-lg font-heading font-bold text-primary-foreground/70"> Tech</span>
              </div>
            </div>
            <p className="text-secondary-foreground/70 text-sm leading-relaxed">
              Assistência técnica especializada em reconstrução de telas
              originais com tecnologia exclusiva no Rio Grande do Sul.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading font-semibold mb-4 text-sm uppercase tracking-wider text-secondary-foreground/50">
              Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-secondary-foreground/70 hover:text-primary-foreground transition-colors">Início</Link></li>
              <li><Link to="/sobre" className="text-secondary-foreground/70 hover:text-primary-foreground transition-colors">Sobre</Link></li>
              <li><Link to="/ajuda" className="text-secondary-foreground/70 hover:text-primary-foreground transition-colors">Ajuda</Link></li>
              <li><Link to="/privacidade" className="text-secondary-foreground/70 hover:text-primary-foreground transition-colors">Privacidade</Link></li>
              <li><Link to="/termos" className="text-secondary-foreground/70 hover:text-primary-foreground transition-colors">Termos de Uso</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold mb-4 text-sm uppercase tracking-wider text-secondary-foreground/50">
              Contato
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-secondary-foreground/70">
                <Phone className="w-4 h-4 shrink-0" />
                <a href="tel:5551999999999" className="hover:text-primary-foreground transition-colors">(51) 99999-9999</a>
              </li>
              <li className="flex items-center gap-2 text-secondary-foreground/70">
                <Mail className="w-4 h-4 shrink-0" />
                <a href="mailto:contato@dontech.com.br" className="hover:text-primary-foreground transition-colors">contato@dontech.com.br</a>
              </li>
              <li className="flex items-start gap-2 text-secondary-foreground/70">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Rio Grande do Sul, Brasil</span>
              </li>
              <li className="pt-2">
                <a
                  href="https://instagram.com/dontech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-secondary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                  @dontech
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-secondary-foreground/10 text-center">
          <p className="text-secondary-foreground/40 text-xs">
            © {new Date().getFullYear()} Don Tech. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
