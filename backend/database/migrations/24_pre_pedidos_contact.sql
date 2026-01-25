-- Novos campos de contato e observações em pre_pedidos (evolução do fluxo de fechamento)
ALTER TABLE pre_pedidos
  ADD COLUMN contact_name VARCHAR(255) NULL,
  ADD COLUMN contact_company VARCHAR(255) NULL,
  ADD COLUMN contact_phone VARCHAR(50) NULL,
  ADD COLUMN contact_email VARCHAR(255) NULL,
  ADD COLUMN notes TEXT NULL,
  ADD COLUMN is_urgent TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN retailer_id VARCHAR(255) NULL;
