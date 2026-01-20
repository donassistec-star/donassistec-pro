export interface PhoneModel {
  id: string;
  brand: string;
  name: string;
  image: string;
  services: {
    reconstruction: boolean;
    glassReplacement: boolean;
    partsAvailable: boolean;
  };
  availability: "in_stock" | "order" | "out_of_stock";
  premium: boolean;
  popular: boolean;
}

export const brands = [
  { id: "apple", name: "Apple", icon: "🍎" },
  { id: "samsung", name: "Samsung", icon: "📱" },
  { id: "xiaomi", name: "Xiaomi", icon: "📲" },
  { id: "motorola", name: "Motorola", icon: "📞" },
  { id: "lg", name: "LG", icon: "📺" },
  { id: "huawei", name: "Huawei", icon: "🌐" },
];

export const serviceTypes = [
  { id: "reconstruction", name: "Reconstrução de Tela", icon: "🔧" },
  { id: "glassReplacement", name: "Troca de Vidro", icon: "🪟" },
  { id: "partsAvailable", name: "Peças Disponíveis", icon: "📦" },
];

export const availabilityOptions = [
  { id: "in_stock", name: "Em Estoque", color: "success" },
  { id: "order", name: "Sob Encomenda", color: "warning" },
  { id: "out_of_stock", name: "Indisponível", color: "error" },
];

export const phoneModels: PhoneModel[] = [
  // Apple
  {
    id: "iphone-15-pro-max",
    brand: "apple",
    name: "iPhone 15 Pro Max",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80",
    services: { reconstruction: true, glassReplacement: true, partsAvailable: true },
    availability: "in_stock",
    premium: true,
    popular: true,
  },
  {
    id: "iphone-15-pro",
    brand: "apple",
    name: "iPhone 15 Pro",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80",
    services: { reconstruction: true, glassReplacement: true, partsAvailable: true },
    availability: "in_stock",
    premium: true,
    popular: true,
  },
  {
    id: "iphone-14-pro-max",
    brand: "apple",
    name: "iPhone 14 Pro Max",
    image: "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400&q=80",
    services: { reconstruction: true, glassReplacement: true, partsAvailable: true },
    availability: "in_stock",
    premium: true,
    popular: true,
  },
  {
    id: "iphone-14-pro",
    brand: "apple",
    name: "iPhone 14 Pro",
    image: "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400&q=80",
    services: { reconstruction: true, glassReplacement: true, partsAvailable: true },
    availability: "in_stock",
    premium: false,
    popular: false,
  },
  {
    id: "iphone-13-pro-max",
    brand: "apple",
    name: "iPhone 13 Pro Max",
    image: "https://images.unsplash.com/photo-1632633173522-47456de71b76?w=400&q=80",
    services: { reconstruction: true, glassReplacement: true, partsAvailable: true },
    availability: "in_stock",
    premium: false,
    popular: true,
  },
  {
    id: "iphone-12",
    brand: "apple",
    name: "iPhone 12",
    image: "https://images.unsplash.com/photo-1611472173362-3f53dbd65d80?w=400&q=80",
    services: { reconstruction: true, glassReplacement: true, partsAvailable: true },
    availability: "in_stock",
    premium: false,
    popular: false,
  },
  // Samsung
  {
    id: "galaxy-s24-ultra",
    brand: "samsung",
    name: "Galaxy S24 Ultra",
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80",
    services: { reconstruction: true, glassReplacement: true, partsAvailable: true },
    availability: "in_stock",
    premium: true,
    popular: true,
  },
  {
    id: "galaxy-s24-plus",
    brand: "samsung",
    name: "Galaxy S24+",
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80",
    services: { reconstruction: true, glassReplacement: true, partsAvailable: true },
    availability: "in_stock",
    premium: true,
    popular: false,
  },
  {
    id: "galaxy-s23-ultra",
    brand: "samsung",
    name: "Galaxy S23 Ultra",
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80",
    services: { reconstruction: true, glassReplacement: true, partsAvailable: true },
    availability: "in_stock",
    premium: false,
    popular: true,
  },
  {
    id: "galaxy-a54",
    brand: "samsung",
    name: "Galaxy A54 5G",
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80",
    services: { reconstruction: true, glassReplacement: true, partsAvailable: true },
    availability: "in_stock",
    premium: false,
    popular: true,
  },
  {
    id: "galaxy-z-fold-5",
    brand: "samsung",
    name: "Galaxy Z Fold 5",
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80",
    services: { reconstruction: false, glassReplacement: false, partsAvailable: true },
    availability: "order",
    premium: true,
    popular: false,
  },
  // Xiaomi
  {
    id: "xiaomi-14-ultra",
    brand: "xiaomi",
    name: "Xiaomi 14 Ultra",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80",
    services: { reconstruction: true, glassReplacement: true, partsAvailable: true },
    availability: "in_stock",
    premium: true,
    popular: true,
  },
  {
    id: "redmi-note-13-pro",
    brand: "xiaomi",
    name: "Redmi Note 13 Pro",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80",
    services: { reconstruction: true, glassReplacement: true, partsAvailable: true },
    availability: "in_stock",
    premium: false,
    popular: true,
  },
  {
    id: "poco-x6-pro",
    brand: "xiaomi",
    name: "POCO X6 Pro",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80",
    services: { reconstruction: true, glassReplacement: true, partsAvailable: true },
    availability: "in_stock",
    premium: false,
    popular: false,
  },
  // Motorola
  {
    id: "edge-40-pro",
    brand: "motorola",
    name: "Edge 40 Pro",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80",
    services: { reconstruction: true, glassReplacement: true, partsAvailable: true },
    availability: "in_stock",
    premium: true,
    popular: true,
  },
  {
    id: "moto-g84",
    brand: "motorola",
    name: "Moto G84 5G",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80",
    services: { reconstruction: true, glassReplacement: true, partsAvailable: true },
    availability: "in_stock",
    premium: false,
    popular: true,
  },
  {
    id: "moto-g54",
    brand: "motorola",
    name: "Moto G54",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80",
    services: { reconstruction: true, glassReplacement: true, partsAvailable: true },
    availability: "in_stock",
    premium: false,
    popular: false,
  },
  // LG
  {
    id: "lg-velvet",
    brand: "lg",
    name: "LG Velvet",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80",
    services: { reconstruction: false, glassReplacement: true, partsAvailable: true },
    availability: "order",
    premium: false,
    popular: false,
  },
  {
    id: "lg-k62",
    brand: "lg",
    name: "LG K62",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80",
    services: { reconstruction: false, glassReplacement: true, partsAvailable: true },
    availability: "order",
    premium: false,
    popular: false,
  },
  // Huawei
  {
    id: "huawei-p60-pro",
    brand: "huawei",
    name: "Huawei P60 Pro",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80",
    services: { reconstruction: true, glassReplacement: true, partsAvailable: true },
    availability: "order",
    premium: true,
    popular: false,
  },
  {
    id: "huawei-nova-12",
    brand: "huawei",
    name: "Huawei Nova 12",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80",
    services: { reconstruction: true, glassReplacement: true, partsAvailable: true },
    availability: "in_stock",
    premium: false,
    popular: false,
  },
];
