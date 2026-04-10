-- Migration: Create price tables history tracking
-- Created: 2026-04-10
-- Purpose: Store complete version history of retailer price tables for auditing and rollback

CREATE TABLE retailer_price_tables_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  table_id INT NOT NULL,
  version INT NOT NULL,
  
  -- Core data snapshot
  slug VARCHAR(120) NOT NULL,
  title VARCHAR(255) NOT NULL,
  effective_date VARCHAR(50) NULL,
  raw_text LONGTEXT NOT NULL,
  parsed_data JSON NOT NULL,
  service_templates JSON NULL,
  
  -- Metadata
  visible_to_retailers BOOLEAN DEFAULT TRUE,
  featured_to_retailers BOOLEAN DEFAULT FALSE,
  
  -- Audit trail
  changed_by INT NULL,
  change_reason VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Keys & indexes
  FOREIGN KEY (table_id) REFERENCES retailer_price_tables(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  UNIQUE KEY uk_table_version (table_id, version),
  KEY idx_table_id (table_id),
  KEY idx_created_at (created_at),
  KEY idx_changed_by (changed_by),
  CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Trigger: Auto-create history when retailer_price_tables is updated
CREATE TRIGGER trg_retailer_price_tables_history_on_update
BEFORE UPDATE ON retailer_price_tables
FOR EACH ROW
BEGIN
  IF NEW.raw_text != OLD.raw_text 
     OR NEW.title != OLD.title 
     OR NEW.parsed_data != OLD.parsed_data
     OR NEW.visible_to_retailers != OLD.visible_to_retailers
     OR NEW.featured_to_retailers != OLD.featured_to_retailers
  THEN
    INSERT INTO retailer_price_tables_history (
      table_id, version, slug, title, effective_date, 
      raw_text, parsed_data, service_templates,
      visible_to_retailers, featured_to_retailers,
      changed_by, change_reason, created_at
    ) VALUES (
      OLD.id, OLD.version, OLD.slug, OLD.title, OLD.effective_date,
      OLD.raw_text, OLD.parsed_data, OLD.service_templates,
      OLD.visible_to_retailers, OLD.featured_to_retailers,
      OLD.changed_by, OLD.change_reason, NOW()
    );
  END IF;
END;
