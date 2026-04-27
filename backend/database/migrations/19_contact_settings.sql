-- Migration para configurações de contato e mídias sociais

INSERT IGNORE INTO system_settings (id, setting_key, setting_value, description) VALUES
-- Informações de Contato
('contact-phone', 'contactPhone', '', 'Telefone de contato principal'),
('contact-phone-raw', 'contactPhoneRaw', '', 'Telefone em formato raw (sem formatação)'),
('contact-email', 'contactEmail', 'contato@donassistec.com.br', 'E-mail de contato'),
('contact-address', 'contactAddress', '', 'Endereço da empresa'),
('contact-cep', 'contactCep', '', 'CEP do endereço'),
('contact-city', 'contactCity', '', 'Cidade'),
('contact-state', 'contactState', '', 'Estado'),
('contact-whatsapp', 'contactWhatsApp', '', 'WhatsApp para Fale Conosco (pode ser diferente do WhatsApp de integração)'),

-- Mídias Sociais
('social-instagram', 'socialInstagram', '', 'URL do perfil do Instagram'),
('social-facebook', 'socialFacebook', '', 'URL do perfil do Facebook'),
('social-youtube', 'socialYoutube', '', 'URL do canal do YouTube'),
('social-linkedin', 'socialLinkedin', '', 'URL do perfil do LinkedIn'),
('social-twitter', 'socialTwitter', '', 'URL do perfil do Twitter/X'),
('social-tiktok', 'socialTikTok', '', 'URL do perfil do TikTok'),

-- Mensagem padrão WhatsApp
('whatsapp-contact-message', 'whatsappContactMessage', 'Olá! Sou lojista e gostaria de saber mais sobre peças e serviços da DonAssistec.', 'Mensagem padrão para contato via WhatsApp')

ON DUPLICATE KEY UPDATE description = VALUES(description);
