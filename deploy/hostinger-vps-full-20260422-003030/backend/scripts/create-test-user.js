const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function createTestUser() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3307'),
    user: process.env.DB_USER || 'donassistec_user',
    password: process.env.DB_PASSWORD || 'donassistec_password',
    database: process.env.DB_NAME || 'donassistec_db',
  });

  try {
    const email = 'teste@donassistec.com';
    const password = 'teste123';
    const passwordHash = await bcrypt.hash(password, 10);
    const id = `retailer-test-${Date.now()}`;

    // Verificar se usuário já existe
    const [existing] = await connection.execute(
      'SELECT id FROM retailers WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      console.log('✅ Usuário de teste já existe!');
      console.log('📧 Email: teste@donassistec.com');
      console.log('🔑 Senha: teste123');
      return;
    }

    // Criar usuário de teste
    await connection.execute(
      `INSERT INTO retailers (id, email, password_hash, company_name, contact_name, phone, cnpj, role, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        email,
        passwordHash,
        'Loja de Teste DonAssistec',
        'João Silva',
        '(11) 99999-9999',
        '12.345.678/0001-90',
        'retailer',
        true
      ]
    );

    console.log('✅ Usuário de teste criado com sucesso!');
    console.log('📧 Email: teste@donassistec.com');
    console.log('🔑 Senha: teste123');
    console.log('🏢 Empresa: Loja de Teste DonAssistec');
    console.log('👤 Contato: João Silva');
  } catch (error) {
    console.error('❌ Erro ao criar usuário de teste:', error.message);
  } finally {
    await connection.end();
  }
}

createTestUser();
