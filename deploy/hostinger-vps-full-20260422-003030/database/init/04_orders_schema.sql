USE donassistec_db;

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY,
    retailer_id VARCHAR(100) NOT NULL, -- ID do lojista (email ou ID único)
    company_name VARCHAR(200) NOT NULL,
    contact_name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    phone VARCHAR(50),
    cnpj VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    notes TEXT,
    status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
    total DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_retailer (retailer_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
);

-- Tabela de itens do pedido
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    model_id VARCHAR(100) NOT NULL,
    model_name VARCHAR(200) NOT NULL,
    brand_name VARCHAR(100),
    quantity INT NOT NULL DEFAULT 1,
    reconstruction BOOLEAN DEFAULT FALSE,
    glass_replacement BOOLEAN DEFAULT FALSE,
    parts_available BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (model_id) REFERENCES phone_models(id) ON DELETE SET NULL,
    INDEX idx_order (order_id),
    INDEX idx_model (model_id)
);
