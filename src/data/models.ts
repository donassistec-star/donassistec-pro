export interface PhoneModel {
  id: string;
  brand: string;
  name: string;
  image: string;
  videoUrl?: string;
  videoThumbnail?: string;
  videos?: {
    id: string;
    title: string;
    url: string;
    thumbnail?: string;
    duration?: string;
  }[];
  services: {
    reconstruction: boolean;
    glassReplacement: boolean;
    partsAvailable: boolean;
  };
  availability: "in_stock" | "order" | "out_of_stock";
  premium: boolean;
  popular: boolean;
}

export interface Brand {
  id: string;
  name: string;
  icon?: string;
  logo?: string;
  color?: string;
}

export const brands: Brand[] = [
  { 
    id: "apple", 
    name: "Apple", 
    logo: "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/apple.svg",
    color: "#000000"
  },
  { 
    id: "samsung", 
    name: "Samsung", 
    logo: "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/samsung.svg",
    color: "#1428A0"
  },
  { 
    id: "xiaomi", 
    name: "Xiaomi", 
    logo: "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/xiaomi.svg",
    color: "#FF6900"
  },
  { 
    id: "motorola", 
    name: "Motorola", 
    logo: "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/motorola.svg",
    color: "#5C92FA"
  },
  { 
    id: "lg", 
    name: "LG", 
    logo: "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/lg.svg",
    color: "#A50034"
  },
  { 
    id: "huawei", 
    name: "Huawei", 
    logo: "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/huawei.svg",
    color: "#FF0000"
  },
];

/** Tipos de serviço para filtro (fallback quando a API não retorna); IDs alinhados com a tabela services */
export const serviceTypes = [
  { id: "service_reconstruction", name: "Reconstrução", icon: "🔧" },
  { id: "service_glass", name: "Troca de Vidro", icon: "🪟" },
  { id: "service_parts", name: "Peças Disponíveis", icon: "📦" },
  { id: "service_battery", name: "Troca de Bateria", icon: "🔋" },
  { id: "service_screen", name: "Troca de Tela", icon: "📱" },
  { id: "service_camera", name: "Reparo de Câmera", icon: "📷" },
  { id: "service_charging", name: "Reparo de Carregamento", icon: "🔌" },
  { id: "service_software", name: "Atualização/Formatação", icon: "💻" },
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
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    videos: [
      {
        id: "1",
        title: "Reconstrução de Tela iPhone 15 Pro Max",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnail: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80",
        duration: "5:30",
      },
      {
        id: "2",
        title: "Troca de Vidro - Tutorial Completo",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnail: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80",
        duration: "8:15",
      },
    ],
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
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    videos: [
      {
        id: "1",
        title: "Reconstrução iPhone 14 Pro",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnail: "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400&q=80",
        duration: "4:45",
      },
    ],
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
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    videos: [
      {
        id: "1",
        title: "Reconstrução iPhone 13 Pro Max",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnail: "https://images.unsplash.com/photo-1632633173522-47456de71b76?w=400&q=80",
        duration: "7:15",
      },
    ],
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
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    videos: [
      {
        id: "1",
        title: "Reconstrução de Tela Galaxy S24 Ultra",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnail: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80",
        duration: "6:20",
      },
    ],
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
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    videos: [
      {
        id: "1",
        title: "Reconstrução Galaxy S23 Ultra",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnail: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80",
        duration: "6:45",
      },
    ],
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
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    videos: [
      {
        id: "1",
        title: "Reconstrução Galaxy A54",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnail: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80",
        duration: "5:20",
      },
    ],
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
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    videos: [
      {
        id: "1",
        title: "Reconstrução Redmi Note 13 Pro",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnail: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80",
        duration: "6:10",
      },
      {
        id: "2",
        title: "Troca de Vidro - Tutorial Completo",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnail: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80",
        duration: "8:30",
      },
    ],
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
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    videos: [
      {
        id: "1",
        title: "Reconstrução Motorola Edge 40 Pro",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnail: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80",
        duration: "5:45",
      },
    ],
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
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    videos: [
      {
        id: "1",
        title: "Reconstrução Moto G84 5G",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnail: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80",
        duration: "5:00",
      },
    ],
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
  // Mais modelos Apple
  {
    id: "iphone-15",
    brand: "apple",
    name: "iPhone 15",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80",
    services: { reconstruction: true, glassReplacement: true, partsAvailable: true },
    availability: "in_stock",
    premium: false,
    popular: true,
  },
  {
    id: "iphone-14",
    brand: "apple",
    name: "iPhone 14",
    image: "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400&q=80",
    services: { reconstruction: true, glassReplacement: true, partsAvailable: true },
    availability: "in_stock",
    premium: false,
    popular: true,
  },
  {
    id: "iphone-13",
    brand: "apple",
    name: "iPhone 13",
    image: "https://images.unsplash.com/photo-1632633173522-47456de71b76?w=400&q=80",
    services: { reconstruction: true, glassReplacement: true, partsAvailable: true },
    availability: "in_stock",
    premium: false,
    popular: true,
  },
  // Mais modelos Samsung
  {
    id: "galaxy-s24",
    brand: "samsung",
    name: "Galaxy S24",
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80",
    services: { reconstruction: true, glassReplacement: true, partsAvailable: true },
    availability: "in_stock",
    premium: true,
    popular: true,
  },
  {
    id: "galaxy-s23",
    brand: "samsung",
    name: "Galaxy S23",
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80",
    services: { reconstruction: true, glassReplacement: true, partsAvailable: true },
    availability: "in_stock",
    premium: false,
    popular: true,
  },
  {
    id: "galaxy-a34",
    brand: "samsung",
    name: "Galaxy A34 5G",
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80",
    services: { reconstruction: true, glassReplacement: true, partsAvailable: true },
    availability: "in_stock",
    premium: false,
    popular: false,
  },
  {
    id: "galaxy-z-flip-5",
    brand: "samsung",
    name: "Galaxy Z Flip 5",
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80",
    services: { reconstruction: false, glassReplacement: true, partsAvailable: true },
    availability: "order",
    premium: true,
    popular: false,
  },
  // Mais modelos Xiaomi
  {
    id: "xiaomi-14",
    brand: "xiaomi",
    name: "Xiaomi 14",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    videos: [
      {
        id: "1",
        title: "Reconstrução Xiaomi 14",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnail: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80",
        duration: "7:20",
      },
    ],
    services: { reconstruction: true, glassReplacement: true, partsAvailable: true },
    availability: "in_stock",
    premium: true,
    popular: true,
  },
  {
    id: "redmi-note-13",
    brand: "xiaomi",
    name: "Redmi Note 13",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80",
    services: { reconstruction: true, glassReplacement: true, partsAvailable: true },
    availability: "in_stock",
    premium: false,
    popular: true,
  },
  {
    id: "poco-x6",
    brand: "xiaomi",
    name: "POCO X6",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80",
    services: { reconstruction: true, glassReplacement: true, partsAvailable: true },
    availability: "in_stock",
    premium: false,
    popular: false,
  },
  // Mais modelos Motorola
  {
    id: "moto-g73",
    brand: "motorola",
    name: "Moto G73 5G",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    videos: [
      {
        id: "1",
        title: "Reconstrução Moto G73 5G",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnail: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80",
        duration: "5:30",
      },
    ],
    services: { reconstruction: true, glassReplacement: true, partsAvailable: true },
    availability: "in_stock",
    premium: false,
    popular: true,
  },
  {
    id: "moto-razr-40",
    brand: "motorola",
    name: "Moto Razr 40",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80",
    services: { reconstruction: false, glassReplacement: true, partsAvailable: true },
    availability: "order",
    premium: true,
    popular: false,
  },
];
