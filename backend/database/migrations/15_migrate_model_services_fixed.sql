-- Migration corrigida para transformar tabela model_services antiga em nova estrutura

-- Primeiro, garantir que a tabela services existe com estrutura correta
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

-- Remover tabela antiga se existir
DROP TABLE IF EXISTS model_services;

-- Criar nova tabela SEM foreign keys primeiro
-- Usar tipos de dados e charset compatíveis com as tabelas referenciadas
-- phone_models usa latin1, então vamos usar latin1 para compatibilidade
CREATE TABLE model_services (
  id VARCHAR(255) PRIMARY KEY,
  model_id VARCHAR(100) NOT NULL,  -- Mesmo tipo que phone_models.id
  service_id VARCHAR(255) NOT NULL, -- Mesmo tipo que services.id
  price DECIMAL(10, 2) DEFAULT 0.00,
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_model_service (model_id, service_id),
  INDEX idx_model_services_model (model_id),
  INDEX idx_model_services_service (service_id),
  INDEX idx_model_services_available (available)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Adicionar foreign keys após criar a tabela
-- Se houver problemas de charset/collation, as foreign keys podem ser adicionadas depois
-- Por enquanto, vamos criar sem foreign keys para que a funcionalidade funcione

-- Tentar adicionar foreign key para phone_models
-- ALTER TABLE model_services 
--   ADD CONSTRAINT fk_model_services_model 
--   FOREIGN KEY (model_id) REFERENCES phone_models(id) ON DELETE CASCADE;

-- Tentar adicionar foreign key para services  
-- ALTER TABLE model_services 
--   ADD CONSTRAINT fk_model_services_service 
--   FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE;
