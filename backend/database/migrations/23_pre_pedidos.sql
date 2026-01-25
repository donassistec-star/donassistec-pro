-- Tabela para registrar pré-pedidos enviados pelo fluxo Finalizar (Pré-orçamento)
CREATE TABLE IF NOT EXISTS pre_pedidos (
  id VARCHAR(36) PRIMARY KEY,
  session_id VARCHAR(255) NULL,
  items_json JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
