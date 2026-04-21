-- Tabela para armazenar o conteúdo da página home
CREATE TABLE IF NOT EXISTS home_content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    section VARCHAR(50) NOT NULL UNIQUE,
    content JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_section (section)
);

-- Inserir conteúdo padrão inicial
INSERT INTO home_content (section, content) VALUES
('main', JSON_OBJECT(
    'heroTitle', 'Reconstrução de Telas e Peças Premium para Lojistas',
    'heroSubtitle', '',
    'heroCtaLabel', 'Explorar Catálogo',
    'heroSecondaryCtaLabel', 'Área do Lojista',
    'featuresTitle', 'Por Que Escolher a DonAssistec?',
    'featuresSubtitle', 'Oferecemos os melhores produtos e serviços com os maiores diferenciais do mercado.',
    'features', JSON_ARRAY(
        JSON_OBJECT('id', 'fast-delivery', 'title', 'Entrega Rápida', 'description', 'Processamento rápido de pedidos com logística pensada para o dia a dia do lojista.'),
        JSON_OBJECT('id', 'full-warranty', 'title', 'Garantia Total', 'description', '90 dias de garantia em todos os produtos e serviços de reconstrução.'),
        JSON_OBJECT('id', 'premium-quality', 'title', 'Qualidade Premium', 'description', 'Produtos de alta qualidade com rigoroso controle em cada etapa.'),
        JSON_OBJECT('id', 'support-24-7', 'title', 'Suporte 24/7', 'description', 'Atendimento dedicado para lojistas com suporte contínuo.'),
        JSON_OBJECT('id', 'strategic-partnership', 'title', 'Parceria Estratégica', 'description', 'Relacionamento de longo prazo com benefícios exclusivos para parceiros.'),
        JSON_OBJECT('id', 'competitive-prices', 'title', 'Preços Competitivos', 'description', 'Melhores preços do mercado para lojistas e assistências técnicas.')
    ),
    'statsTitle', 'Resultados que Comprovam',
    'statsSubtitle', 'Nossos números mostram a confiança dos lojistas e a qualidade das entregas.',
    'stats', JSON_ARRAY(
        JSON_OBJECT('id', 'models', 'value', '500+', 'label', 'Modelos Compatíveis', 'description', 'Trabalhamos com todas as principais marcas e modelos do mercado.'),
        JSON_OBJECT('id', 'screens', 'value', '10k+', 'label', 'Telas Reconstruídas', 'description', 'Experiência comprovada em reconstrução de telas.'),
        JSON_OBJECT('id', 'retailers', 'value', '500+', 'label', 'Lojistas Parceiros', 'description', 'Centenas de lojistas confiam na DonAssistec.'),
        JSON_OBJECT('id', 'satisfaction', 'value', '98%', 'label', 'Satisfação', 'description', 'Taxa de satisfação dos nossos clientes.'),
        JSON_OBJECT('id', 'warranty', 'value', '90 dias', 'label', 'Garantia Total', 'description', 'Garantia estendida em todos os produtos.'),
        JSON_OBJECT('id', 'rating', 'value', '5.0', 'label', 'Avaliação Média', 'description', 'Avaliação média dos nossos serviços.')
    ),
    'processTitle', 'Como Funciona o Processo?',
    'processSubtitle', 'Um fluxo simples e eficiente para abastecer sua loja com peças e serviços.',
    'steps', JSON_ARRAY(
        JSON_OBJECT('id', 'step-1', 'number', '01', 'title', 'Explore o Catálogo', 'description', 'Navegue pelo nosso catálogo completo de modelos e peças disponíveis.', 'action', 'Ver Catálogo', 'href', '/catalogo'),
        JSON_OBJECT('id', 'step-2', 'number', '02', 'title', 'Solicite um Orçamento', 'description', 'Entre em contato via WhatsApp ou e-mail para solicitar um orçamento personalizado.', 'action', 'Falar no WhatsApp', 'href', '#contato'),
        JSON_OBJECT('id', 'step-3', 'number', '03', 'title', 'Receba o Orçamento', 'description', 'Nossa equipe envia um orçamento detalhado com preços e prazos de entrega.', 'action', NULL, 'href', NULL),
        JSON_OBJECT('id', 'step-4', 'number', '04', 'title', 'Aprove e Receba', 'description', 'Após aprovação, processamos seu pedido e entregamos no prazo acordado.', 'action', 'Criar Conta', 'href', '/lojista/login')
    )
))
ON DUPLICATE KEY UPDATE content = VALUES(content);
