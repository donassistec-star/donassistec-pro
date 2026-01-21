-- Migration para configurações de branding e identidade visual

INSERT IGNORE INTO system_settings (id, setting_key, setting_value, description) VALUES
-- Logo e Identidade Visual
('branding-logo-url', 'brandingLogoUrl', '', 'URL do logo da empresa'),
('branding-logo-favicon', 'brandingLogoFavicon', '', 'URL do favicon'),
('branding-primary-color', 'brandingPrimaryColor', '#6366f1', 'Cor primária da marca (hex)'),
('branding-secondary-color', 'brandingSecondaryColor', '#8b5cf6', 'Cor secundária da marca (hex)'),

-- Informações da Empresa
('company-legal-name', 'companyLegalName', '', 'Razão Social da empresa'),
('company-trade-name', 'companyTradeName', 'DonAssistec', 'Nome Fantasia'),
('company-cnpj', 'companyCnpj', '', 'CNPJ da empresa'),
('company-ie', 'companyIe', '', 'Inscrição Estadual'),
('company-im', 'companyIm', '', 'Inscrição Municipal'),
('company-website', 'companyWebsite', '', 'Website da empresa (.com, etc)'),
('company-fac', 'companyFac', '', 'FAC (Fundo de Aperfeiçoamento Científico ou outro)'),

-- Informações Adicionais
('company-description', 'companyDescription', 'Laboratório premium de reconstrução de telas e revenda de peças para lojistas e assistências técnicas.', 'Descrição da empresa'),
('company-slogan', 'companySlogan', '', 'Slogan da empresa'),
('company-year-founded', 'companyYearFounded', '', 'Ano de fundação')

ON DUPLICATE KEY UPDATE description = VALUES(description);
