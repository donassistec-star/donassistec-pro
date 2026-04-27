const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function createAdminUser() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3307'),
    user: process.env.DB_USER || 'donassistec_user',
    password: process.env.DB_PASSWORD || 'donassistec_password',
    database: process.env.DB_NAME || 'donassistec_db',
  });

  try {
    const email = 'admin@donassistec.com';
    const password = 'admin123';
    const passwordHash = await bcrypt.hash(password, 10);
    const id = `admin-${Date.now()}`;

    // Verificar se usuário admin já existe
    const [existing] = await connection.execute(
      'SELECT id FROM retailers WHERE email = ? OR role = ?',
      [email, 'admin']
    );

    if (existing.length > 0) {
      console.log('✅ Usuário admin já existe!');
      console.log('📧 Email: admin@donassistec.com');
      console.log('🔑 Senha: admin123');
      return;
    }

    // Criar usuário admin
    await connection.execute(
      `INSERT INTO retailers (id, email, password_hash, company_name, contact_name, phone, cnpj, role, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        email,
        passwordHash,
        'Administração DonAssistec',
        'Administrador',
        '(11) 99999-9999',
        '00.000.000/0001-00',
        'admin',
        true
      ]
    );

    console.log('✅ Usuário admin criado com sucesso!');
    console.log('📧 Email: admin@donassistec.com');
    console.log('🔑 Senha: admin123');
    console.log('🏢 Empresa: Administração DonAssistec');
    console.log('👤 Contato: Administrador');
    console.log('🔐 Role: admin');
  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error.message);
  } finally {
    await connection.end();
  }
}

createAdminUser();
