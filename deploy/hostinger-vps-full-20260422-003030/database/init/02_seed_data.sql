USE donassistec_db;

-- Inserir marcas
INSERT INTO brands (id, name, logo_url, icon_name) VALUES
('apple', 'Apple', 'https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/apple.svg', 'AppleIcon'),
('samsung', 'Samsung', 'https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/samsung.svg', 'SamsungIcon'),
('xiaomi', 'Xiaomi', 'https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/xiaomi.svg', 'XiaomiIcon'),
('motorola', 'Motorola', 'https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/motorola.svg', 'MotorolaIcon'),
('lg', 'LG', 'https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/lg.svg', 'LgIcon'),
('huawei', 'Huawei', 'https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/huawei.svg', 'HuaweiIcon')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Inserir modelos Apple
INSERT INTO phone_models (id, brand_id, name, image_url, video_url, availability, premium, popular) VALUES
('iphone-15-pro-max', 'apple', 'iPhone 15 Pro Max', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'in_stock', TRUE, TRUE),
('iphone-15-pro', 'apple', 'iPhone 15 Pro', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80', NULL, 'in_stock', TRUE, TRUE),
('iphone-14-pro-max', 'apple', 'iPhone 14 Pro Max', 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400&q=80', NULL, 'in_stock', TRUE, TRUE),
('iphone-13-pro-max', 'apple', 'iPhone 13 Pro Max', 'https://images.unsplash.com/photo-1632633173522-47456de71b76?w=400&q=80', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'in_stock', FALSE, TRUE),
('iphone-15', 'apple', 'iPhone 15', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80', NULL, 'in_stock', FALSE, TRUE),
('iphone-14', 'apple', 'iPhone 14', 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400&q=80', NULL, 'in_stock', FALSE, TRUE),
('iphone-13', 'apple', 'iPhone 13', 'https://images.unsplash.com/photo-1632633173522-47456de71b76?w=400&q=80', NULL, 'in_stock', FALSE, TRUE),
('iphone-12', 'apple', 'iPhone 12', 'https://images.unsplash.com/photo-1611472173362-3f53dbd65d80?w=400&q=80', NULL, 'in_stock', FALSE, FALSE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Inserir modelos Samsung
INSERT INTO phone_models (id, brand_id, name, image_url, video_url, availability, premium, popular) VALUES
('galaxy-s24-ultra', 'samsung', 'Galaxy S24 Ultra', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'in_stock', TRUE, TRUE),
('galaxy-s24-plus', 'samsung', 'Galaxy S24+', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80', NULL, 'in_stock', TRUE, FALSE),
('galaxy-s23-ultra', 'samsung', 'Galaxy S23 Ultra', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'in_stock', FALSE, TRUE),
('galaxy-a54', 'samsung', 'Galaxy A54 5G', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'in_stock', FALSE, TRUE),
('galaxy-s24', 'samsung', 'Galaxy S24', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80', NULL, 'in_stock', TRUE, TRUE),
('galaxy-s23', 'samsung', 'Galaxy S23', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80', NULL, 'in_stock', FALSE, TRUE),
('galaxy-a34', 'samsung', 'Galaxy A34 5G', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80', NULL, 'in_stock', FALSE, FALSE),
('galaxy-z-fold-5', 'samsung', 'Galaxy Z Fold 5', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80', NULL, 'order', TRUE, FALSE),
('galaxy-z-flip-5', 'samsung', 'Galaxy Z Flip 5', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80', NULL, 'order', TRUE, FALSE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Inserir modelos Xiaomi
INSERT INTO phone_models (id, brand_id, name, image_url, video_url, availability, premium, popular) VALUES
('xiaomi-14-ultra', 'xiaomi', 'Xiaomi 14 Ultra', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'in_stock', TRUE, TRUE),
('redmi-note-13-pro', 'xiaomi', 'Redmi Note 13 Pro', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'in_stock', FALSE, TRUE),
('xiaomi-14', 'xiaomi', 'Xiaomi 14', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'in_stock', TRUE, TRUE),
('redmi-note-13', 'xiaomi', 'Redmi Note 13', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80', NULL, 'in_stock', FALSE, TRUE),
('poco-x6', 'xiaomi', 'POCO X6', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80', NULL, 'in_stock', FALSE, FALSE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Inserir modelos Motorola
INSERT INTO phone_models (id, brand_id, name, image_url, video_url, availability, premium, popular) VALUES
('edge-40-pro', 'motorola', 'Edge 40 Pro', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'in_stock', TRUE, TRUE),
('moto-g84', 'motorola', 'Moto G84 5G', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'in_stock', FALSE, TRUE),
('moto-g54', 'motorola', 'Moto G54', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80', NULL, 'in_stock', FALSE, FALSE),
('moto-g73', 'motorola', 'Moto G73 5G', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'in_stock', FALSE, TRUE),
('moto-razr-40', 'motorola', 'Moto Razr 40', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80', NULL, 'order', TRUE, FALSE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Inserir modelos LG
INSERT INTO phone_models (id, brand_id, name, image_url, video_url, availability, premium, popular) VALUES
('lg-velvet', 'lg', 'LG Velvet', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80', NULL, 'order', FALSE, FALSE),
('lg-k62', 'lg', 'LG K62', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80', NULL, 'order', FALSE, FALSE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Inserir modelos Huawei
INSERT INTO phone_models (id, brand_id, name, image_url, video_url, availability, premium, popular) VALUES
('huawei-p60-pro', 'huawei', 'Huawei P60 Pro', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80', NULL, 'order', TRUE, FALSE),
('huawei-nova-12', 'huawei', 'Huawei Nova 12', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80', NULL, 'in_stock', FALSE, FALSE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Inserir serviços para modelos (todos têm reconstrução, troca de vidro e peças disponíveis por padrão)
INSERT INTO model_services (model_id, reconstruction, glass_replacement, parts_available) 
SELECT id, TRUE, TRUE, TRUE FROM phone_models
ON DUPLICATE KEY UPDATE reconstruction=TRUE, glass_replacement=TRUE, parts_available=TRUE;

-- Alguns modelos especiais
UPDATE model_services SET reconstruction=FALSE, glass_replacement=FALSE WHERE model_id IN ('galaxy-z-fold-5', 'galaxy-z-flip-5', 'moto-razr-40');
UPDATE model_services SET reconstruction=FALSE WHERE model_id IN ('lg-velvet', 'lg-k62');

-- Inserir alguns vídeos de exemplo
INSERT INTO model_videos (model_id, title, url, thumbnail_url, duration, video_order) VALUES
('iphone-15-pro-max', 'Reconstrução de Tela iPhone 15 Pro Max', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80', '5:30', 1),
('iphone-15-pro-max', 'Troca de Vidro - Tutorial Completo', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80', '8:15', 2),
('galaxy-s24-ultra', 'Reconstrução de Tela Galaxy S24 Ultra', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&q=80', '6:20', 1),
('redmi-note-13-pro', 'Reconstrução Redmi Note 13 Pro', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80', '6:10', 1),
('redmi-note-13-pro', 'Troca de Vidro - Tutorial Completo', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80', '8:30', 2)
ON DUPLICATE KEY UPDATE title=VALUES(title);
