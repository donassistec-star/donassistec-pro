/**
 * Lista os e-mails dos usuários da equipe (admin_team).
 * Use para saber com qual e-mail fazer login.
 *
 * Uso: node backend/scripts/list-admin-team.js
 */
const mysql = require("mysql2/promise");
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3307", 10),
    user: process.env.DB_USER || "donassistec_user",
    password: process.env.DB_PASSWORD || "donassistec_password",
    database: process.env.DB_NAME || "donassistec_db",
  });

  try {
    const [rows] = await connection.execute(
      "SELECT email, name, role, active FROM admin_team ORDER BY created_at"
    );
    if (rows.length === 0) {
      console.log("Nenhum usuário na admin_team. Crie um com: node scripts/create-admin-team.js");
      return;
    }
    console.log("Usuários da equipe (admin_team):");
    rows.forEach((r) => {
      console.log("  -", r.email, "|", r.name, "|", r.role, "|", r.active ? "ativo" : "inativo");
    });
    console.log("\nFaça login em /admin/login com um desses e-mails e a senha definida no create-admin-team ou no reset-admin-team-password.");
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
