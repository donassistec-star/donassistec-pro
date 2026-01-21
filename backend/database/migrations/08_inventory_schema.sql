-- Add stock quantity to phone_models (MySQL 5.7 compatibility)
ALTER TABLE phone_models 
ADD COLUMN stock_quantity INT DEFAULT 0;

ALTER TABLE phone_models 
ADD COLUMN min_stock_level INT DEFAULT 5;

-- Create index for stock queries
CREATE INDEX idx_stock ON phone_models(stock_quantity);
