-- Criar banco de dados se não existir
CREATE DATABASE IF NOT EXISTS donassistec_db;
USE donassistec_db;

-- Tabela de marcas
CREATE TABLE IF NOT EXISTS brands (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    logo_url VARCHAR(500),
    icon_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de modelos de celular
CREATE TABLE IF NOT EXISTS phone_models (
    id VARCHAR(100) PRIMARY KEY,
    brand_id VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    image_url VARCHAR(500),
    video_url VARCHAR(500),
    availability ENUM('in_stock', 'order', 'out_of_stock') DEFAULT 'in_stock',
    premium BOOLEAN DEFAULT FALSE,
    popular BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE,
    INDEX idx_brand (brand_id),
    INDEX idx_popular (popular),
    INDEX idx_premium (premium),
    INDEX idx_availability (availability)
);

-- Tabela de serviços dos modelos
CREATE TABLE IF NOT EXISTS model_services (
    model_id VARCHAR(100) NOT NULL,
    reconstruction BOOLEAN DEFAULT FALSE,
    glass_replacement BOOLEAN DEFAULT FALSE,
    parts_available BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (model_id),
    FOREIGN KEY (model_id) REFERENCES phone_models(id) ON DELETE CASCADE
);

-- Tabela de vídeos dos modelos
CREATE TABLE IF NOT EXISTS model_videos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    model_id VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    duration VARCHAR(20),
    video_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (model_id) REFERENCES phone_models(id) ON DELETE CASCADE,
    INDEX idx_model (model_id)
);

-- Tabela de tipos de serviços
CREATE TABLE IF NOT EXISTS service_types (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(10),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir tipos de serviços padrão
INSERT INTO service_types (id, name, icon, description) VALUES
('reconstruction', 'Reconstrução de Tela', '🔧', 'Processo industrial com máquinas de última geração'),
('glassReplacement', 'Troca de Vidro', '🪟', 'Substituição apenas do vidro frontal'),
('partsAvailable', 'Peças Disponíveis', '📦', 'Catálogo completo de peças originais e compatíveis')
ON DUPLICATE KEY UPDATE name=VALUES(name);
