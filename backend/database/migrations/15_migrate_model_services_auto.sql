-- Migration automática para transformar tabela model_services antiga em nova estrutura
-- Execute este arquivo apenas se a tabela model_services tem estrutura antiga (sem service_id)

-- Backup da tabela antiga
CREATE TABLE IF NOT EXISTS model_services_backup AS SELECT * FROM model_services;

-- Remover tabela antiga
DROP TABLE IF EXISTS model_services;

-- Criar nova tabela com estrutura correta
CREATE TABLE model_services (
  id VARCHAR(255) PRIMARY KEY,
  model_id VARCHAR(255) NOT NULL,
  service_id VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) DEFAULT 0.00,
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (model_id) REFERENCES phone_models(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  UNIQUE KEY unique_model_service (model_id, service_id),
  INDEX idx_model_services_model (model_id),
  INDEX idx_model_services_service (service_id),
  INDEX idx_model_services_available (available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migrar dados da tabela antiga (se houver colunas antigas no backup)
-- Estas queries funcionam apenas se a tabela backup tiver as colunas antigas
INSERT INTO model_services (id, model_id, service_id, price, available)
SELECT 
  CONCAT('model_service_', model_id, '_reconstruction_', UNIX_TIMESTAMP()),
  model_id,
  'service_reconstruction',
  0.00,
  COALESCE(reconstruction, FALSE)
FROM model_services_backup WHERE reconstruction = TRUE
ON DUPLICATE KEY UPDATE available = VALUES(available);

INSERT INTO model_services (id, model_id, service_id, price, available)
SELECT 
  CONCAT('model_service_', model_id, '_glass_', UNIX_TIMESTAMP()),
  model_id,
  'service_glass',
  0.00,
  COALESCE(glass_replacement, FALSE)
FROM model_services_backup WHERE glass_replacement = TRUE
ON DUPLICATE KEY UPDATE available = VALUES(available);

INSERT INTO model_services (id, model_id, service_id, price, available)
SELECT 
  CONCAT('model_service_', model_id, '_parts_', UNIX_TIMESTAMP()),
  model_id,
  'service_parts',
  0.00,
  COALESCE(parts_available, FALSE)
FROM model_services_backup WHERE parts_available = TRUE
ON DUPLICATE KEY UPDATE available = VALUES(available);

-- Limpar backup após verificar que migração funcionou
-- DROP TABLE IF EXISTS model_services_backup;
