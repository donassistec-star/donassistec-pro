-- Create product_reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
    id VARCHAR(255) PRIMARY KEY,
    model_id VARCHAR(100) NOT NULL,
    retailer_id VARCHAR(255) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (model_id) REFERENCES phone_models(id) ON DELETE CASCADE,
    INDEX idx_model (model_id),
    INDEX idx_retailer (retailer_id),
    INDEX idx_approved (approved)
);
