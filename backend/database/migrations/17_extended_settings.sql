-- Migration para adicionar configurações estendidas ao sistema

-- Configurações de Email/SMTP
INSERT INTO system_settings (id, setting_key, setting_value, description) VALUES
('smtp-host', 'smtpHost', 'smtp.gmail.com', 'Servidor SMTP'),
('smtp-port', 'smtpPort', '587', 'Porta SMTP'),
('smtp-user', 'smtpUser', '', 'Usuário SMTP'),
('smtp-password', 'smtpPassword', '', 'Senha SMTP'),
('smtp-secure', 'smtpSecure', 'true', 'Conexão segura SMTP (true/false)'),
('smtp-from-email', 'smtpFromEmail', 'noreply@donassistec.com', 'Email remetente padrão'),
('smtp-from-name', 'smtpFromName', 'DonAssistec', 'Nome remetente padrão')

ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- Configurações de SEO
INSERT INTO system_settings (id, setting_key, setting_value, description) VALUES
('seo-title', 'seoTitle', 'DonAssistec - Reconstrução de Telas e Peças', 'Título SEO'),
('seo-description', 'seoDescription', 'Catálogo B2B de peças e serviços para celulares', 'Descrição SEO'),
('seo-keywords', 'seoKeywords', 'peças celular, reconstrução tela, assistência técnica', 'Palavras-chave SEO'),
('seo-og-image', 'seoOgImage', '', 'Imagem Open Graph')

ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- Configurações de Pagamento
INSERT INTO system_settings (id, setting_key, setting_value, description) VALUES
('payment-methods', 'paymentMethods', 'bank_transfer,pix', 'Métodos de pagamento aceitos'),
('payment-bank-name', 'paymentBankName', '', 'Nome do banco'),
('payment-bank-agency', 'paymentBankAgency', '', 'Agência bancária'),
('payment-bank-account', 'paymentBankAccount', '', 'Conta bancária'),
('payment-pix-key', 'paymentPixKey', '', 'Chave PIX'),
('payment-pix-key-type', 'paymentPixKeyType', 'email', 'Tipo de chave PIX (email/cpf/cnpj/random)'),
('auto-approve-payment', 'autoApprovePayment', 'false', 'Aprovar pagamentos automaticamente')

ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- Configurações de Segurança
INSERT INTO system_settings (id, setting_key, setting_value, description) VALUES
('session-timeout', 'sessionTimeout', '3600', 'Timeout de sessão em segundos'),
('max-login-attempts', 'maxLoginAttempts', '5', 'Máximo de tentativas de login'),
('require-email-verification', 'requireEmailVerification', 'false', 'Exigir verificação de email'),
('two-factor-auth', 'twoFactorAuth', 'false', 'Autenticação de dois fatores'),
('password-min-length', 'passwordMinLength', '8', 'Tamanho mínimo de senha'),
('password-require-uppercase', 'passwordRequireUppercase', 'true', 'Exigir letra maiúscula na senha'),
('password-require-numbers', 'passwordRequireNumbers', 'true', 'Exigir números na senha'),
('password-require-symbols', 'passwordRequireSymbols', 'false', 'Exigir símbolos na senha')

ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- Configurações de Performance
INSERT INTO system_settings (id, setting_key, setting_value, description) VALUES
('cache-enabled', 'cacheEnabled', 'true', 'Habilitar cache'),
('cache-duration', 'cacheDuration', '300', 'Duração do cache em segundos'),
('api-rate-limit', 'apiRateLimit', '100', 'Limite de requisições API por minuto'),
('image-optimization', 'imageOptimization', 'true', 'Otimização automática de imagens'),
('max-upload-size', 'maxUploadSize', '5242880', 'Tamanho máximo de upload em bytes (5MB)')

ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- Configurações de Integração
INSERT INTO system_settings (id, setting_key, setting_value, description) VALUES
('whatsapp-enabled', 'whatsappEnabled', 'true', 'Habilitar integração WhatsApp'),
('whatsapp-number', 'whatsappNumber', '', 'Número WhatsApp (com código do país)'),
('whatsapp-api-key', 'whatsappApiKey', '', 'Chave API WhatsApp'),
('google-analytics-id', 'googleAnalyticsId', '', 'ID Google Analytics'),
('facebook-pixel-id', 'facebookPixelId', '', 'ID Facebook Pixel')

ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- Configurações de Notificações Avançadas
INSERT INTO system_settings (id, setting_key, setting_value, description) VALUES
('notify-new-order', 'notifyNewOrder', 'true', 'Notificar novos pedidos'),
('notify-order-status', 'notifyOrderStatus', 'true', 'Notificar mudanças de status'),
('notify-low-stock', 'notifyLowStock', 'true', 'Notificar estoque baixo'),
('notify-new-ticket', 'notifyNewTicket', 'true', 'Notificar novos tickets'),
('notify-ticket-reply', 'notifyTicketReply', 'true', 'Notificar respostas de tickets'),
('notification-email-template', 'notificationEmailTemplate', 'default', 'Template de email de notificações')

ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);
