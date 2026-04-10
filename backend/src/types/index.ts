export interface Brand {
  id: string;
  name: string;
  logo_url?: string;
  icon_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PhoneModel {
  id: string;
  brand_id: string;
  name: string;
  image_url?: string;
  video_url?: string;
  availability: "in_stock" | "order" | "out_of_stock";
  premium?: boolean;
  popular?: boolean;
  stock_quantity?: number;
  min_stock_level?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ModelService {
  model_id: string;
  reconstruction: boolean;
  glass_replacement: boolean;
  parts_available: boolean;
}

export interface ModelVideo {
  id: number;
  model_id: string;
  title: string;
  url: string;
  thumbnail_url?: string;
  duration?: string;
  video_order: number;
  created_at?: string;
}

export interface Order {
  id: string;
  retailer_id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  cnpj?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  notes?: string;
  status: "pending" | "processing" | "completed" | "cancelled";
  total: number;
  created_at?: string;
  updated_at?: string;
  /** Vínculo com o pré-pedido de origem (quando o pedido é gerado a partir de um pré-pedido). */
  pre_pedido_id?: string | null;
  /** Número do pré-pedido de origem (para exibir "Pré-pedido PRE-0001") – preenchido pelo backend quando pre_pedido_id existe. */
  pre_pedido_numero?: number | null;
  /** Número sequencial do pedido (PED-0001, PED-0002, ...) – gerado no backend. */
  numero?: number;
}

export interface OrderItem {
  id?: number;
  order_id: string;
  model_id: string;
  model_name: string;
  brand_name?: string;
  quantity: number;
  reconstruction: boolean;
  glass_replacement: boolean;
  parts_available: boolean;
  notes?: string;
  created_at?: string;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface Retailer {
  id: string;
  email: string;
  company_name: string;
  contact_name: string;
  phone?: string;
  cnpj?: string;
  role: "retailer" | "admin";
  active: boolean;
  approval_status: "pending" | "approved" | "rejected";
  approved_at?: string | null;
  approved_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface RetailerRegisterData {
  email: string;
  password: string;
  company_name: string;
  contact_name: string;
  phone?: string;
  cnpj?: string;
}

export interface RetailerLoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    company_name: string;
    contact_name: string;
    phone?: string;
    cnpj?: string;
    role: "retailer" | "admin" | "gerente" | "tecnico" | "user";
    source?: "admin_team" | "retailer";
    modules?: string[];
    approval_status?: "pending" | "approved" | "rejected";
  };
  approval_status?: "pending" | "approved" | "rejected";
  whatsapp_url?: string;
  error?: string;
  message?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface HomeContent {
  showHero?: boolean;
  showBrands?: boolean;
  homeBrandIds?: string[];
  showServices?: boolean;
  showFeatures?: boolean;
  showStats?: boolean;
  showProcess?: boolean;
  showTestimonials?: boolean;
  showDifferentials?: boolean;
  showCta?: boolean;
  heroBadge?: string;
  heroImage?: string;
  showHeroPrimaryCta?: boolean;
  showHeroSecondaryCta?: boolean;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaLabel: string;
  heroCtaLink?: string;
  heroSecondaryCtaLabel: string;
  heroSecondaryCtaLink?: string;
  servicesBadge: string;
  servicesTitle: string;
  servicesSubtitle: string;
  servicesImage?: string;
  servicesImageTitle: string;
  servicesImageDescription: string;
  servicesCards: Array<{
    id: string;
    title: string;
    description: string;
    badge: string;
    features: string[];
  }>;
  servicesHighlights: Array<{
    id: string;
    label: string;
    value: string;
  }>;
  featuresTitle: string;
  featuresSubtitle: string;
  features: Array<{
    id: string;
    title: string;
    description: string;
  }>;
  statsTitle: string;
  statsSubtitle: string;
  stats: Array<{
    id: string;
    value: string;
    label: string;
    description: string;
  }>;
  processTitle: string;
  processSubtitle: string;
  steps: Array<{
    id: string;
    number: string;
    title: string;
    description: string;
    action?: string | null;
    href?: string | null;
  }>;
}
