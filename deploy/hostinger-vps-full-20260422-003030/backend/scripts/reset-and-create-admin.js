/**
 * LIMPA a tabela admin_team e CRIA UM ÚNICO usuário admin.
 * Use quando nada estiver funcionando e quiser recomeçar do zero.
 *
 * Rode no servidor (na pasta backend, com o .env de produção):
 *   node scripts/reset-and-create-admin.js
 *   email=admin@donassistec.com senha=Su@Senh@123 nome=Admin node scripts/reset-and-create-admin.js
 */
const bcrypt = require("bcrypt");
const mysql = require("mysql2/promise");
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const email = process.env.email || process.env.EMAIL || "admin@donassistec.com";
const senha = process.env.senha || process.env.SENHA || process.env.password || "admin123";
const nome = process.env.nome || process.env.NOME || process.env.name || "Admin";

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3307", 10),
    user: process.env.DB_USER || "donassistec_user",
    password: process.env.DB_PASSWORD || "donassistec_password",
    database: process.env.DB_NAME || "donassistec_db",
  });

  try {
    await connection.execute("DELETE FROM admin_user_module_overrides");
    await connection.execute("DELETE FROM admin_team");

    const id = `ateam-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const hash = await bcrypt.hash(senha, 10);
    await connection.execute(
      "INSERT INTO admin_team (id, email, password_hash, name, role, active) VALUES (?, ?, ?, ?, 'admin', 1)",
      [id, email, hash, nome]
    );

    console.log("========================================");
    console.log("  ADMIN RESETADO — UM USUÁRIO CRIADO");
    console.log("========================================");
    console.log("  E-mail:", email);
    console.log("  Senha: ", senha);
    console.log("  Nome:  ", nome);
    console.log("========================================");
    console.log("  Faça login em /admin/login com esse e-mail e senha.");
    console.log("========================================");
  } catch (err) {
    if (err.code === "ER_NO_SUCH_TABLE") {
      console.error("❌ Tabela admin_team não existe. Rode antes: npm run migrate:admin-team");
    } else {
      console.error("❌ Erro:", err.message);
    }
    process.exit(1);
  } finally {
    await connection.end();
  }
}

run();
