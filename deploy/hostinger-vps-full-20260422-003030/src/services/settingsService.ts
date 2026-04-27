import api from "./api";
import { normalizeMediaUrl } from "@/utils/mediaUrl";

export interface SystemSettings {
  retailerTrainingVideos?: string;

  // Configurações Gerais
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  supportEmail: string;
  supportPhone: string;
  
  // Configurações do Sistema
  maintenanceMode: boolean;
  allowRetailerRegistration: boolean;
  maxOrdersPerDay: number;
  
  // Notificações Básicas
  emailNotifications: boolean;
  smsNotifications: boolean;
  
  // Email/SMTP
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  smtpSecure?: boolean;
  smtpFromEmail?: string;
  smtpFromName?: string;
  
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  seoOgImage?: string;
  
  // Pagamento
  paymentMethods?: string;
  paymentBankName?: string;
  paymentBankAgency?: string;
  paymentBankAccount?: string;
  paymentPixKey?: string;
  paymentPixKeyType?: string;
  autoApprovePayment?: boolean;
  
  // Segurança
  sessionTimeout?: number;
  maxLoginAttempts?: number;
  requireEmailVerification?: boolean;
  twoFactorAuth?: boolean;
  passwordMinLength?: number;
  passwordRequireUppercase?: boolean;
  passwordRequireNumbers?: boolean;
  passwordRequireSymbols?: boolean;
  
  // Performance
  cacheEnabled?: boolean;
  cacheDuration?: number;
  apiRateLimit?: number;
  imageOptimization?: boolean;
  maxUploadSize?: number;
  
  // Integrações
  whatsappEnabled?: boolean;
  whatsappNumber?: string;
  whatsappApiKey?: string;
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  
  // Notificações Avançadas
  notifyNewOrder?: boolean;
  notifyOrderStatus?: boolean;
  notifyLowStock?: boolean;
  notifyNewTicket?: boolean;
  notifyTicketReply?: boolean;
  notificationEmailTemplate?: string;
  
  // Informações de Contato
  contactPhone?: string;
  contactPhoneRaw?: string;
  contactEmail?: string;
  contactAddress?: string;
  contactCep?: string;
  contactCity?: string;
  contactState?: string;
  contactWhatsApp?: string;
  
  // Mídias Sociais
  socialInstagram?: string;
  socialFacebook?: string;
  socialYoutube?: string;
  socialLinkedin?: string;
  socialTwitter?: string;
  socialTikTok?: string;
  
  // Mensagem WhatsApp
  whatsappContactMessage?: string;
  
  // Branding e Identidade Visual
  brandingLogoUrl?: string;
  brandingLogoFavicon?: string;
  brandingPrimaryColor?: string;
  brandingSecondaryColor?: string;
  
  // Informações da Empresa
  companyLegalName?: string;
  companyTradeName?: string;
  showCompanyTradeName?: boolean;
  showCompanyTradeNameHeader?: boolean;
  showCompanyTradeNameFooter?: boolean;
  showCompanySloganFooter?: boolean;
  companyCnpj?: string;
  companyIe?: string;
  companyIm?: string;
  companyWebsite?: string;
  companyFac?: string;
  companyDescription?: string;
  companySlogan?: string;
  companyYearFounded?: string;

  // Conteúdo da página Sobre
  aboutHeroBadge?: string;
  aboutHeroTitle?: string;
  aboutHeroDescription?: string;
  aboutMissionTitle?: string;
  aboutMissionDescription?: string;
  aboutVisionTitle?: string;
  aboutVisionDescription?: string;
  aboutValuesTitle?: string;
  aboutValuesDescription?: string;
  aboutValuesItems?: string;
  aboutStatsItems?: string;
  aboutAchievementsTitle?: string;
  aboutAchievementsDescription?: string;
  aboutAchievementsItems?: string;
  aboutCtaTitle?: string;
  aboutCtaDescription?: string;
  aboutHeroPrimaryLabel?: string;
  aboutHeroSecondaryLabel?: string;
  aboutCtaPrimaryLabel?: string;
  aboutCtaSecondaryLabel?: string;

  // Conteúdo da página Ajuda
  helpHeroBadge?: string;
  helpHeroTitle?: string;
  helpHeroDescription?: string;
  helpSearchPlaceholder?: string;
  helpFaqItems?: string;
  helpBackLabel?: string;
  helpNoResultsTitle?: string;
  helpNoResultsDescription?: string;
  helpNoResultsButtonLabel?: string;
  helpContactTitle?: string;
  helpContactDescription?: string;
  helpWhatsappTitle?: string;
  helpWhatsappDescription?: string;
  helpWhatsappLabel?: string;
  helpPhoneTitle?: string;
  helpPhoneLabel?: string;
  helpEmailTitle?: string;
  helpEmailLabel?: string;

  // Conteúdo da seção Contato da Home
  homeContactTitle?: string;
  homeContactDescription?: string;
  homeContactWhatsappLabel?: string;
  homeContactPhoneLabel?: string;
  homeContactInfoBadge?: string;
  homeContactPageButtonLabel?: string;

  // Conteúdo da página Contato
  contactPageBadge?: string;
  contactPageTitle?: string;
  contactPageDescription?: string;
  contactPageWhatsappTitle?: string;
  contactPageWhatsappDescription?: string;
  contactPageWhatsappButtonLabel?: string;
  contactPagePhoneTitle?: string;
  contactPagePhoneDescription?: string;
  contactPagePhoneButtonLabel?: string;
  contactPageEmailTitle?: string;
  contactPageEmailDescription?: string;
  contactPageEmailButtonLabel?: string;
  contactPageAddressTitle?: string;
  contactPageAddressDescription?: string;

  // Navegação
  showNavHome?: boolean;
  showNavCatalog?: boolean;
  showNavFavorites?: boolean;
  showNavAbout?: boolean;
  showNavHelp?: boolean;
  showNavServices?: boolean;
  showNavBrands?: boolean;
  showNavContact?: boolean;
  showAdminAccessButton?: boolean;
  showHeaderPhone?: boolean;
  showRetailerAreaButton?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SettingsHistory {
  id: number;
  setting_key: string;
  old_value: string | null;
  new_value: string;
  changed_by: string;
  changed_by_email: string | null;
  changed_at: string;
}

export const settingsService = {
  /** Configurações públicas (Header, Footer, etc.) – não exige login */
  async getPublic(): Promise<SystemSettings | null> {
    try {
      const response = await api.get<ApiResponse<SystemSettings>>("/settings/public");
      if (response.data.success && response.data.data) {
        return {
          ...response.data.data,
          brandingLogoUrl: normalizeMediaUrl(response.data.data.brandingLogoUrl),
          brandingLogoFavicon: normalizeMediaUrl(response.data.data.brandingLogoFavicon),
          seoOgImage: normalizeMediaUrl(response.data.data.seoOgImage),
        };
      }
      return null;
    } catch {
      return null;
    }
  },

  async getAll(): Promise<SystemSettings | null> {
    try {
      const response = await api.get<ApiResponse<SystemSettings>>("/settings");
      if (response.data.success && response.data.data) {
        return {
          ...response.data.data,
          brandingLogoUrl: normalizeMediaUrl(response.data.data.brandingLogoUrl),
          brandingLogoFavicon: normalizeMediaUrl(response.data.data.brandingLogoFavicon),
          seoOgImage: normalizeMediaUrl(response.data.data.seoOgImage),
        };
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar configurações:", error);
      return null;
    }
  },

  async update(settings: Partial<SystemSettings>): Promise<SystemSettings | null> {
    try {
      const response = await api.put<ApiResponse<SystemSettings>>("/settings", settings);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return null;
    } catch (error: any) {
      console.error("Erro ao atualizar configurações:", error);
      throw new Error(error.response?.data?.error || "Erro ao atualizar configurações");
    }
  },

  async getHistory(settingKey?: string, limit: number = 50): Promise<SettingsHistory[]> {
    try {
      const params = new URLSearchParams();
      if (settingKey) params.append("settingKey", settingKey);
      params.append("limit", limit.toString());
      
      const response = await api.get<ApiResponse<SettingsHistory[]>>(
        `/settings/history?${params.toString()}`
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      return [];
    }
  },
};
