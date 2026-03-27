-- Cria order_items se não existir (compatível com 04_orders_schema).
-- Depende de: orders e phone_models.

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
    INDEX idx_order (order_id),
    INDEX idx_model (model_id),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
