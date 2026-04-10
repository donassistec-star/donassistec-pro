-- Migration: Track retailer price changes over time
-- Created: 2026-04-10
-- Purpose: Record price history for analytics, trends, and business intelligence

CREATE TABLE retailer_price_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  table_id INT NOT NULL,
  date DATE NOT NULL,
  
  -- Service identification
  service_key VARCHAR(255) NOT NULL,  -- normalized: "samsung_a15_vidro"
  service_name VARCHAR(255) NOT NULL, -- display: "Samsung A15 > Troca de Vidro"
  
  -- Price tracking
  old_price DECIMAL(10, 2) NULL,
  new_price DECIMAL(10, 2) NOT NULL,
  price_change_percent DECIMAL(5, 2) NULL,  -- e.g., 5.50 for 5.5% change
  price_change_amount DECIMAL(10, 2) NULL,  -- e.g., 10.00 for R$10 increase
  
  -- Metadata
  admin_user_id INT NULL,
  change_source VARCHAR(50) NULL,  -- 'manual_edit', 'bulk_import', 'rollback'
  notes VARCHAR(500) NULL,
  
  -- Timestamps
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Keys & Indexes
  FOREIGN KEY (table_id) REFERENCES retailer_price_tables(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE SET NULL,
  
  -- Performance indexes
  UNIQUE KEY uk_table_date_service (table_id, date, service_key),
  KEY idx_table_id (table_id),
  KEY idx_date (date),
  KEY idx_service_key (service_key),
  KEY idx_table_date (table_id, date),
  KEY idx_price_change (table_id, date, price_change_percent),
  
  CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- View: Price trends by service
CREATE VIEW v_retailer_price_trends AS
SELECT 
  table_id,
  service_key,
  service_name,
  date,
  new_price,
  old_price,
  price_change_percent,
  price_change_amount,
  ROW_NUMBER() OVER (PARTITION BY table_id, service_key ORDER BY date ASC) as change_sequence,
  DATEDIFF(
    (SELECT MAX(date) FROM retailer_price_history rph2 WHERE rph2.service_key = rph1.service_key),
    date
  ) as days_since_last_change
FROM retailer_price_history rph1
ORDER BY date DESC;

-- View: Price statistics by date
CREATE VIEW v_retailer_price_stats_daily AS
SELECT 
  table_id,
  date,
  COUNT(DISTINCT service_key) as services_changed,
  COUNT(CASE WHEN price_change_percent > 0 THEN 1 END) as price_increases,
  COUNT(CASE WHEN price_change_percent < 0 THEN 1 END) as price_decreases,
  AVG(ABS(price_change_percent)) as avg_change_percent,
  MAX(price_change_percent) as max_increase_percent,
  MIN(price_change_percent) as max_decrease_percent,
  SUM(CASE WHEN price_change_amount > 0 THEN price_change_amount ELSE 0 END) as total_increase_amount,
  SUM(CASE WHEN price_change_amount < 0 THEN ABS(price_change_amount) ELSE 0 END) as total_decrease_amount
FROM retailer_price_history
GROUP BY table_id, date
ORDER BY date DESC;

-- View: Service price variance (volatility)
CREATE VIEW v_retailer_price_variance AS
SELECT 
  table_id,
  service_key,
  service_name,
  COUNT(*) as change_count,
  AVG(new_price) as avg_price,
  MIN(new_price) as min_price,
  MAX(new_price) as max_price,
  STDDEV(new_price) as price_stddev,
  (MAX(new_price) - MIN(new_price)) as price_range,
  ((MAX(new_price) - MIN(new_price)) / AVG(new_price) * 100) as volatility_percent,
  MAX(date) as last_changed,
  MIN(date) as first_recorded
FROM retailer_price_history
GROUP BY table_id, service_key
HAVING change_count > 1
ORDER BY volatility_percent DESC;
