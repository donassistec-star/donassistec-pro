-- Migration para adicionar coluna id à tabela model_services se não existir
-- IMPORTANTE: Execute esta migration apenas se a coluna id não existir na tabela

-- Para executar via linha de comando MySQL:
-- mysql -u donassistec_user -p donassistec_db < 14_fix_model_services_id.sql

-- Adicionar coluna id (apenas se não existir - execute manualmente)
-- ALTER TABLE model_services ADD COLUMN id VARCHAR(255) FIRST;

-- Remover PRIMARY KEY antigo e criar novo com id
-- ALTER TABLE model_services DROP PRIMARY KEY;
-- ALTER TABLE model_services ADD PRIMARY KEY (id);

-- Garantir que unique key existe
-- ALTER TABLE model_services ADD UNIQUE KEY IF NOT EXISTS unique_model_service_id (model_id, service_id);

-- Atualizar registros existentes sem id
-- UPDATE model_services 
-- SET id = CONCAT('model_service_', model_id, '_', service_id, '_', UNIX_TIMESTAMP())
-- WHERE id IS NULL OR id = '';

-- NOTA: Como a tabela pode ter estruturas diferentes, o código foi ajustado para
-- funcionar com ambas as estruturas (com e sem coluna id).
