-- Migration para transformar tabela model_services antiga em nova estrutura
-- Esta migration verifica a estrutura existente e migra se necessário

-- Primeiro, garantir que a tabela services existe (migration 13)
CREATE TABLE IF NOT EXISTS services (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_services_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir serviços padrão se não existirem
INSERT INTO services (id, name, description, active) VALUES
  ('service_reconstruction', 'Reconstrução', 'Serviço de reconstrução completa do aparelho', TRUE),
  ('service_glass', 'Troca de Vidro', 'Troca de vidro da tela', TRUE),
  ('service_parts', 'Peças Disponíveis', 'Peças disponíveis para reposição', TRUE),
  ('service_battery', 'Troca de Bateria', 'Substituição da bateria', TRUE),
  ('service_screen', 'Troca de Tela', 'Substituição completa da tela', TRUE),
  ('service_camera', 'Reparo de Câmera', 'Reparo ou substituição de câmera', TRUE),
  ('service_charging', 'Reparo de Carregamento', 'Reparo do sistema de carregamento', TRUE),
  ('service_software', 'Atualização/Formatação', 'Atualização de software ou formatação', TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Verificar se a tabela model_services tem a estrutura antiga (sem service_id)
-- Se sim, transformá-la na nova estrutura

-- Passo 1: Verificar se service_id existe
-- Se não existir, a tabela está na estrutura antiga e precisa ser migrada

-- Passo 2: Criar tabela temporária com nova estrutura
CREATE TABLE IF NOT EXISTS model_services_new (
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

-- Passo 3: Verificar estrutura atual e migrar dados se necessário
-- NOTA: Como não podemos executar condicionais diretamente no SQL,
-- você precisa verificar manualmente se a coluna service_id existe.
-- Execute os comandos abaixo apenas se a tabela tiver a estrutura antiga:

-- Se a tabela tem estrutura antiga (com reconstruction, glass_replacement, parts_available):
-- DELETE FROM model_services_new; -- Limpar se já existir dados
-- INSERT INTO model_services_new (id, model_id, service_id, price, available)
-- SELECT 
--   CONCAT('model_service_', model_id, '_reconstruction_', UNIX_TIMESTAMP()),
--   model_id,
--   'service_reconstruction',
--   0.00,
--   reconstruction
-- FROM model_services WHERE reconstruction = TRUE
-- UNION ALL
-- SELECT 
--   CONCAT('model_service_', model_id, '_glass_', UNIX_TIMESTAMP()),
--   model_id,
--   'service_glass',
--   0.00,
--   glass_replacement
-- FROM model_services WHERE glass_replacement = TRUE
-- UNION ALL
-- SELECT 
--   CONCAT('model_service_', model_id, '_parts_', UNIX_TIMESTAMP()),
--   model_id,
--   'service_parts',
--   0.00,
--   parts_available
-- FROM model_services WHERE parts_available = TRUE;

-- Passo 4: Renomear tabelas (execute apenas após migrar dados)
-- RENAME TABLE model_services TO model_services_old;
-- RENAME TABLE model_services_new TO model_services;
-- DROP TABLE model_services_old;

-- ALTERNATIVA: Se a tabela já não existe ou você quer recriar do zero:
-- DROP TABLE IF EXISTS model_services;
-- RENAME TABLE model_services_new TO model_services;
