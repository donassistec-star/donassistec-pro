import { Smartphone, Mail, Phone, MapPin, Instagram, Facebook, Youtube, Linkedin, Twitter } from "lucide-react";
import { Link } from "react-router-dom";
import { useSettings } from "@/hooks/useSettings";
import { getPublicContactInfo } from "@/utils/publicContact";

const Footer = () => {
  const { settings, loading } = useSettings();

  if (loading) {
    return null; // Retorna null durante o carregamento para evitar flash de conteúdo
  }

  const {
    contactPhone,
    contactPhoneRaw,
    contactEmail,
    contactAddress,
    contactCityState,
    contactCep,
    mapsQuery,
    hasPhone,
    hasAddress,
  } = getPublicContactInfo(settings);
  const mapsEmbedUrl = hasAddress
    ? `https://maps.google.com/maps?q=${encodeURIComponent(mapsQuery || contactAddress)}&output=embed`
    : "";
  const mapsExternalUrl = hasAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery || contactAddress)}`
    : "";
  const showCompanyTradeName = (settings?.showCompanyTradeNameFooter ?? settings?.showCompanyTradeName) !== false;
  const showCompanySlogan = settings?.showCompanySloganFooter !== false;

  return (
    <footer className="border-t border-white/10 bg-slate-950/95 pb-8 pt-12 sm:pt-16 text-slate-100">
      <div className="container mx-auto px-4">
        <div className="mb-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              {settings?.brandingLogoUrl ? (
                <img
                  src={settings.brandingLogoUrl}
                  alt={settings.companyTradeName || settings.siteName || "Logo"}
                  className="h-12 w-auto max-w-[180px] object-contain"
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
                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
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
                        <span className="text-xl font-bold text-white">{first}</span>
                        {rest ? <span className="text-xl font-bold text-primary"> {rest}</span> : null}
                      </>
                    );
                  })()}
                </div>
              ) : null}
            </div>
            <p className="mb-4 text-slate-300">
              {settings?.companyDescription || 
                "Laboratório premium de reconstrução de telas e revenda de peças para lojistas e assistências técnicas."}
            </p>
            {showCompanySlogan && settings?.companySlogan && (
              <p className="text-sm font-semibold text-primary mb-4">
                {settings.companySlogan}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              {settings?.socialInstagram && (
                <a href={settings.socialInstagram} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-slate-300 transition-colors hover:bg-primary hover:text-primary-foreground">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {settings?.socialFacebook && (
                <a href={settings.socialFacebook} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-slate-300 transition-colors hover:bg-primary hover:text-primary-foreground">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {settings?.socialYoutube && (
                <a href={settings.socialYoutube} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-slate-300 transition-colors hover:bg-primary hover:text-primary-foreground">
                  <Youtube className="w-5 h-5" />
                </a>
              )}
              {settings?.socialLinkedin && (
                <a href={settings.socialLinkedin} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-slate-300 transition-colors hover:bg-primary hover:text-primary-foreground">
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {settings?.socialTwitter && (
                <a href={settings.socialTwitter} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-slate-300 transition-colors hover:bg-primary hover:text-primary-foreground">
                  <Twitter className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Serviços</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-slate-300 transition-colors hover:text-primary">Reconstrução de Telas</a></li>
              <li><a href="#" className="text-slate-300 transition-colors hover:text-primary">Troca de Vidro</a></li>
              <li><a href="#" className="text-slate-300 transition-colors hover:text-primary">Revenda de Peças</a></li>
              <li><a href="#" className="text-slate-300 transition-colors hover:text-primary">Peças Apple</a></li>
              <li><a href="#" className="text-slate-300 transition-colors hover:text-primary">Peças Samsung</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Contato</h4>
            <ul className="space-y-4">
              {hasPhone ? (
                <li className="flex items-center gap-3 text-slate-300">
                  <Phone className="w-5 h-5 text-primary" />
                  <a href={`tel:${contactPhoneRaw}`} className="hover:text-primary transition-colors">
                    {contactPhone}
                  </a>
                </li>
              ) : null}
              <li className="flex items-center gap-3 text-slate-300">
                <Mail className="w-5 h-5 text-primary" />
                <a href={`mailto:${contactEmail}`} className="hover:text-primary transition-colors">
                  {contactEmail}
                </a>
              </li>
              {hasAddress ? (
                <li className="flex items-start gap-3 text-slate-300">
                  <MapPin className="w-5 h-5 text-primary shrink-0" />
                  <a
                    href={mapsExternalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    <span className="block">{contactAddress}</span>
                    {contactCityState ? <span className="block text-sm text-slate-400">{contactCityState}</span> : null}
                    {contactCep ? (
                      <span className="block text-sm text-slate-400">CEP: {contactCep}</span>
                    ) : null}
                  </a>
                </li>
              ) : null}
            </ul>
            {hasAddress ? (
              <div className="mt-4">
                <iframe
                  src={mapsEmbedUrl}
                  width="100%"
                  height="180"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Mapa da localização"
                ></iframe>
              </div>
            ) : null}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col items-start justify-between gap-4 text-left md:flex-row md:items-center">
            <p className="text-sm text-slate-400">
              © 2025 DonAssistec. Todos os direitos reservados.
            </p>
            <div className="flex flex-col gap-3 text-sm sm:flex-row sm:gap-6">
              <Link to="/privacidade" className="text-slate-400 transition-colors hover:text-primary">Política de Privacidade</Link>
              <Link to="/termos" className="text-slate-400 transition-colors hover:text-primary">Termos de Uso</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
