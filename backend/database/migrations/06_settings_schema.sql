-- Schema para configurações do sistema
CREATE TABLE IF NOT EXISTS system_settings (
  id VARCHAR(255) PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inserir configurações padrão
INSERT INTO system_settings (id, setting_key, setting_value, description) VALUES
('site-name', 'siteName', 'DonAssistec', 'Nome do site'),
('site-description', 'siteDescription', 'Catálogo B2B de peças e serviços para celulares', 'Descrição do site'),
('site-url', 'siteUrl', 'https://donassistec.com', 'URL do site'),
('support-email', 'supportEmail', 'suporte@donassistec.com', 'Email de suporte'),
('support-phone', 'supportPhone', '(11) 99999-9999', 'Telefone de suporte'),
('maintenance-mode', 'maintenanceMode', 'false', 'Modo de manutenção (true/false)'),
('allow-retailer-registration', 'allowRetailerRegistration', 'true', 'Permitir cadastro de lojistas (true/false)'),
('max-orders-per-day', 'maxOrdersPerDay', '100', 'Máximo de pedidos por dia'),
('email-notifications', 'emailNotifications', 'true', 'Notificações por email (true/false)'),
('sms-notifications', 'smsNotifications', 'false', 'Notificações por SMS (true/false)')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);
