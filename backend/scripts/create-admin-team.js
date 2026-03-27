/**
 * Cria ou atualiza usuário da equipe admin (admin_team).
 * Rode no SERVIDOR DE PRODUÇÃO (onde a API de donassistec.com.br roda).
 *
 * Uso:
 *   node scripts/create-admin-team.js
 *   email=admin2@donassistec.com senha=admin123 nome=Admin2 node scripts/create-admin-team.js
 *   (se já existe) email=admin2@donassistec.com senha=admin123 reset=1 node scripts/create-admin-team.js
 */
const bcrypt = require("bcrypt");
const mysql = require("mysql2/promise");
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const email = process.env.email || process.env.EMAIL || "ronei@donassistec.com";
const senha = process.env.senha || process.env.SENHA || process.env.password || "admin123";
const nome = process.env.nome || process.env.NOME || process.env.name || "Administrador";
const reset = /^1|true|sim|s|yes|y$/i.test(String(process.env.reset || process.env.RESET || ""));

async function createAdminTeam() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3307", 10),
    user: process.env.DB_USER || "donassistec_user",
    password: process.env.DB_PASSWORD || "donassistec_password",
    database: process.env.DB_NAME || "donassistec_db",
  });

  try {
    const [existing] = await connection.execute("SELECT id FROM admin_team WHERE email = ?", [email]);
    if (existing.length > 0) {
      if (reset) {
        const hash = await bcrypt.hash(senha, 10);
        await connection.execute(
          "UPDATE admin_team SET password_hash = ?, name = ?, active = 1, updated_at = CURRENT_TIMESTAMP WHERE email = ?",
          [hash, nome, email]
        );
        console.log("✅ Senha, nome e ativo atualizados para:", email);
      } else {
        console.log("✅ Usuário já existe:", email);
        console.log("   Para redefinir senha: email=" + email + " senha=novasenha reset=1 node scripts/create-admin-team.js");
        return;
      }
    } else {
      const id = `ateam-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const passwordHash = await bcrypt.hash(senha, 10);
      await connection.execute(
        `INSERT INTO admin_team (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, 'admin')`,
        [id, email, passwordHash, nome]
      );
      console.log("✅ Usuário da equipe criado:", email);
    }
    console.log("📧 E-mail:", email, "| 🔑 Senha:", senha, "| 👤 Nome:", nome);
    console.log("Faça login em https://donassistec.com.br/admin/login com este e-mail e senha.");
  } catch (err) {
    if (err.code === "ER_NO_SUCH_TABLE") {
      console.error("❌ Tabela admin_team não existe. Execute a migration 29_admin_team.sql primeiro.");
    } else {
      console.error("❌ Erro:", err.message);
    }
  } finally {
    await connection.end();
  }
}

createAdminTeam();
