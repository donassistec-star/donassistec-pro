import { Smartphone, Mail, Phone, MapPin, Instagram, Facebook, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <span className="text-xl font-bold text-card">Don</span>
                <span className="text-xl font-bold text-primary">Assistec</span>
              </div>
            </div>
            <p className="text-card/70 mb-4">
              Laboratório premium de reconstrução de telas e revenda de peças para lojistas 
              e assistências técnicas.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-card/10 flex items-center justify-center text-card/70 hover:bg-primary hover:text-primary-foreground transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-card/10 flex items-center justify-center text-card/70 hover:bg-primary hover:text-primary-foreground transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-card/10 flex items-center justify-center text-card/70 hover:bg-primary hover:text-primary-foreground transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-card mb-4">Links Rápidos</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-card/70 hover:text-primary transition-colors">Home</a></li>
              <li><a href="#servicos" className="text-card/70 hover:text-primary transition-colors">Serviços</a></li>
              <li><a href="#marcas" className="text-card/70 hover:text-primary transition-colors">Marcas</a></li>
              <li><a href="#contato" className="text-card/70 hover:text-primary transition-colors">Contato</a></li>
              <li><a href="#" className="text-card/70 hover:text-primary transition-colors">Área do Lojista</a></li>
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
                (11) 99999-9999
              </li>
              <li className="flex items-center gap-3 text-card/70">
                <Mail className="w-5 h-5 text-primary" />
                contato@donassistec.com.br
              </li>
              <li className="flex items-start gap-3 text-card/70">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                São Paulo - SP
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
              <a href="#" className="text-card/50 hover:text-primary transition-colors">Política de Privacidade</a>
              <a href="#" className="text-card/50 hover:text-primary transition-colors">Termos de Uso</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
