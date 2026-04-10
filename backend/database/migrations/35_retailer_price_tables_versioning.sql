-- Migration: Add versioning support to retailer_price_tables
-- Created: 2026-04-10
-- Purpose: Enable version tracking for price tables with rollback capability

ALTER TABLE retailer_price_tables
ADD COLUMN version INT NOT NULL DEFAULT 1 AFTER sort_order,
ADD COLUMN changed_by INT AFTER version,
ADD COLUMN change_reason VARCHAR(255) AFTER changed_by,
ADD INDEX idx_version (version),
ADD INDEX idx_changed_by (changed_by);

-- Add foreign key for changed_by (if admin_users table exists)
ALTER TABLE retailer_price_tables
ADD CONSTRAINT fk_retailer_price_tables_changed_by 
FOREIGN KEY (changed_by) REFERENCES admin_users(id) ON DELETE SET NULL;
