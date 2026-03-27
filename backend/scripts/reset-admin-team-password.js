/**
 * Redefine a senha de um usuário da equipe (admin_team).
 * Use quando esquecer a senha ou precisar de uma nova.
 *
 * Uso: email=ronei@donassistec.com senha=novasenha123 node backend/scripts/reset-admin-team-password.js
 *      ou: node backend/scripts/reset-admin-team-password.js  (pede e-mail e senha)
 */
const bcrypt = require("bcrypt");
const mysql = require("mysql2/promise");
const readline = require("readline");
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

let email = process.env.email || process.env.EMAIL;
let senha = process.env.senha || process.env.SENHA || process.env.password;

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((res) => rl.question(question, (a) => { rl.close(); res(a.trim()); }));
}

async function run() {
  if (!email) email = await ask("E-mail do usuário na admin_team: ");
  if (!senha) senha = await ask("Nova senha (mín. 6 caracteres): ");
  if (!email || !senha) {
    console.error("❌ E-mail e senha são obrigatórios. Use: email=xxx senha=yyy node scripts/reset-admin-team-password.js");
    process.exit(1);
  }
  if (senha.length < 6) {
    console.error("❌ A senha deve ter no mínimo 6 caracteres.");
    process.exit(1);
  }

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3307", 10),
    user: process.env.DB_USER || "donassistec_user",
    password: process.env.DB_PASSWORD || "donassistec_password",
    database: process.env.DB_NAME || "donassistec_db",
  });

  try {
    const [rows] = await connection.execute("SELECT id, email FROM admin_team WHERE email = ?", [email]);
    if (rows.length === 0) {
      console.error("❌ E-mail não encontrado na tabela admin_team:", email);
      console.error("   Crie o usuário antes com: node scripts/create-admin-team.js");
      process.exit(1);
    }
    const hash = await bcrypt.hash(senha, 10);
    await connection.execute("UPDATE admin_team SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?", [hash, email]);
    console.log("✅ Senha redefinida com sucesso para:", email);
    console.log("   Faça login em /admin/login com este e-mail e a nova senha.");
  } catch (err) {
    if (err.code === "ER_NO_SUCH_TABLE") {
      console.error("❌ Tabela admin_team não existe. Execute a migration 29_admin_team.sql primeiro.");
    } else {
      console.error("❌ Erro:", err.message);
    }
    process.exit(1);
  } finally {
    await connection.end();
  }
}

run();
