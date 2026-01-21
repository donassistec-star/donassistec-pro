-- Migration para Histórico de Visualizações de Produtos
-- Rastreia quais produtos foram visualizados pelos usuários

CREATE TABLE IF NOT EXISTS product_views (
  id INT AUTO_INCREMENT PRIMARY KEY,
  model_id VARCHAR(100) NOT NULL,
  user_id VARCHAR(255) NULL, -- NULL para visitantes não autenticados
  user_email VARCHAR(255) NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  session_id VARCHAR(255) NULL, -- Para rastrear sessões de visitantes
  INDEX idx_product_views_model (model_id),
  INDEX idx_product_views_user (user_id),
  INDEX idx_product_views_date (viewed_at),
  INDEX idx_product_views_session (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Tabela para estatísticas agregadas de visualizações
CREATE TABLE IF NOT EXISTS product_view_stats (
  model_id VARCHAR(100) PRIMARY KEY,
  total_views INT DEFAULT 0,
  unique_views INT DEFAULT 0,
  last_viewed_at TIMESTAMP NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
