USE donassistec_db;

-- Tabela de lojistas/usuários
CREATE TABLE IF NOT EXISTS retailers (
    id VARCHAR(100) PRIMARY KEY,
    email VARCHAR(200) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    company_name VARCHAR(200) NOT NULL,
    contact_name VARCHAR(200) NOT NULL,
    phone VARCHAR(50),
    cnpj VARCHAR(50),
    role ENUM('retailer', 'admin') DEFAULT 'retailer',
    active BOOLEAN DEFAULT TRUE,
    approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    approved_at TIMESTAMP NULL DEFAULT NULL,
    approved_by VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_active (active),
    INDEX idx_approval_status (approval_status)
);
