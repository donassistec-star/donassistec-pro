// Tipos centralizados para o projeto DonAssistec
// Este arquivo centraliza todas as interfaces e tipos usados no frontend

// Tipos básicos
export type Availability = "in_stock" | "order" | "out_of_stock";
export type DiscountType = "percentage" | "fixed";
export type OrderStatus = "pending" | "processing" | "completed" | "cancelled";
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type UserRole = "retailer" | "admin";

// Brand
export interface Brand {
  id: string;
  name: string;
  icon?: string;
  logo?: string;
  color?: string;
  logo_url?: string;
  icon_name?: string;
  created_at?: string;
  updated_at?: string;
}

// PhoneModel
export interface PhoneModel {
  id: string;
  brand: string;
  brand_id?: string;
  name: string;
  image: string;
  image_url?: string;
  videoUrl?: string;
  video_url?: string;
  videoThumbnail?: string;
  videos?: ModelVideo[];
  services: {
    reconstruction: boolean;
    glassReplacement: boolean;
    partsAvailable: boolean;
  };
  availability: Availability;
  premium: boolean;
  popular: boolean;
  stock_quantity?: number;
  min_stock_level?: number;
  created_at?: string;
  updated_at?: string;
}

// ModelVideo
export interface ModelVideo {
  id: string | number;
  model_id?: string;
  title: string;
  url: string;
  thumbnail?: string;
  thumbnail_url?: string;
  duration?: string;
  video_order?: number;
  created_at?: string;
}

// Order
export interface Order {
  id: string;
  retailer_id: string;
  status: OrderStatus;
  total?: number;
  created_at?: string;
  updated_at?: string;
  items?: OrderItem[];
  coupon_code?: string;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  model_id: string;
  quantity: number;
  price: number;
  model?: PhoneModel;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

// User/Auth
export interface User {
  id: string;
  email: string;
  company_name?: string;
  companyName?: string;
  contact_name?: string;
  contactName?: string;
  phone?: string;
  cnpj?: string;
  role: UserRole;
}

// Retailer
export interface Retailer {
  id: string;
  email: string;
  company_name: string;
  contact_name: string;
  phone?: string;
  cnpj?: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Service (Dynamic Services)
export interface Service {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ModelService {
  model_id: string;
  service_id: string;
  price: number;
  available: boolean;
  created_at?: string;
  updated_at?: string;
  service?: Service;
}

// Review
export interface Review {
  id: string;
  model_id: string;
  retailer_id: string;
  rating: number;
  comment?: string;
  approved: boolean;
  created_at?: string;
  updated_at?: string;
  retailer?: {
    company_name: string;
  };
}

// Dynamic Pricing
export interface DynamicPricing {
  id: string;
  model_id: string;
  min_quantity: number;
  max_quantity?: number;
  price: number;
  discount_percentage?: number;
  created_at?: string;
  updated_at?: string;
}

// Coupon
export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discount_type: DiscountType;
  discount_value: number;
  min_purchase?: number;
  max_discount?: number;
  usage_limit?: number;
  usage_count: number;
  valid_from: string;
  valid_until: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Ticket
export interface Ticket {
  id: string;
  retailer_id: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  created_at?: string;
  updated_at?: string;
  last_message_at?: string;
  messages?: TicketMessage[];
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_type: "retailer" | "admin";
  message: string;
  created_at?: string;
}

export interface TicketWithMessages extends Ticket {
  messages: TicketMessage[];
}

// Audit Log
export interface AuditLog {
  id: string;
  user_id?: string;
  user_email?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
}

// Settings
export interface SystemSettings {
  id: string;
  key: string;
  value: string;
  description?: string;
  updated_at?: string;
}

// Product View Stats
export interface ProductViewStats {
  model_id: string;
  total_views: number;
  unique_views: number;
  last_viewed_at?: string;
}

// Home Content
export interface HomeContent {
  heroTitle: string;
  heroSubtitle: string;
  heroImage?: string;
  heroCtaLink?: string;
  heroBadge?: string;
  featuresTitle?: string;
  featuresSubtitle?: string;
  statsTitle?: string;
  statsSubtitle?: string;
  [key: string]: any;
}

// API Response Generic
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
