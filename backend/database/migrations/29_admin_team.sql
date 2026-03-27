-- Usuários da equipe (admin, user, técnico, gerente) com controle de módulos
-- Migration 29

-- Tabela de usuários da equipe administrativa
CREATE TABLE IF NOT EXISTS admin_team (
    id VARCHAR(100) PRIMARY KEY,
    email VARCHAR(200) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(200) NOT NULL,
    role ENUM('admin', 'gerente', 'tecnico', 'user') NOT NULL DEFAULT 'user',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_active (active)
);

-- Módulos visíveis por função (padrão)
CREATE TABLE IF NOT EXISTS admin_role_modules (
    role VARCHAR(20) NOT NULL,
    module_key VARCHAR(50) NOT NULL,
    PRIMARY KEY (role, module_key),
    INDEX idx_role (role)
);

-- Overrides por usuário (ocultar ou mostrar módulos em relação ao padrão da função)
CREATE TABLE IF NOT EXISTS admin_user_module_overrides (
    user_id VARCHAR(100) NOT NULL,
    module_key VARCHAR(50) NOT NULL,
    visible TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (user_id, module_key),
    FOREIGN KEY (user_id) REFERENCES admin_team(id) ON DELETE CASCADE,
    INDEX idx_user (user_id)
);

-- Seed: módulos padrão por função
-- admin: todos os módulos
INSERT IGNORE INTO admin_role_modules (role, module_key) VALUES
('admin', 'dashboard'),
('admin', 'home-content'),
('admin', 'modelos'),
('admin', 'marcas'),
('admin', 'servicos'),
('admin', 'pedidos'),
('admin', 'pre-pedidos'),
('admin', 'tickets'),
('admin', 'estoque'),
('admin', 'cupons'),
('admin', 'lojistas'),
('admin', 'relatorios'),
('admin', 'avaliacoes'),
('admin', 'precos-dinamicos'),
('admin', 'logs'),
('admin', 'configuracoes'),
('admin', 'equipe');

-- gerente: todos exceto equipe (gestão de equipe só admin)
INSERT IGNORE INTO admin_role_modules (role, module_key) VALUES
('gerente', 'dashboard'),
('gerente', 'home-content'),
('gerente', 'modelos'),
('gerente', 'marcas'),
('gerente', 'servicos'),
('gerente', 'pedidos'),
('gerente', 'pre-pedidos'),
('gerente', 'tickets'),
('gerente', 'estoque'),
('gerente', 'cupons'),
('gerente', 'lojistas'),
('gerente', 'relatorios'),
('gerente', 'avaliacoes'),
('gerente', 'precos-dinamicos'),
('gerente', 'logs'),
('gerente', 'configuracoes');

-- user: foco comercial e suporte
INSERT IGNORE INTO admin_role_modules (role, module_key) VALUES
('user', 'dashboard'),
('user', 'pedidos'),
('user', 'pre-pedidos'),
('user', 'tickets'),
('user', 'lojistas'),
('user', 'relatorios'),
('user', 'avaliacoes');

-- tecnico: foco em produtos, estoque e pedidos
INSERT IGNORE INTO admin_role_modules (role, module_key) VALUES
('tecnico', 'dashboard'),
('tecnico', 'modelos'),
('tecnico', 'marcas'),
('tecnico', 'servicos'),
('tecnico', 'pedidos'),
('tecnico', 'pre-pedidos'),
('tecnico', 'estoque');
