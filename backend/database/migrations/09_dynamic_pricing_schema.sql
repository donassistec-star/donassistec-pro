-- Create dynamic_pricing table
CREATE TABLE IF NOT EXISTS dynamic_pricing (
    id VARCHAR(255) PRIMARY KEY,
    model_id VARCHAR(100) NOT NULL,
    min_quantity INT NOT NULL,
    max_quantity INT,
    price DECIMAL(10, 2) NOT NULL,
    discount_percentage DECIMAL(5, 2) DEFAULT 0,
    valid_from DATE,
    valid_until DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (model_id) REFERENCES phone_models(id) ON DELETE CASCADE,
    INDEX idx_model (model_id),
    INDEX idx_quantity (min_quantity, max_quantity)
);
