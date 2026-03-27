/**
 * Diagnóstico: por que o login em /admin retorna 401?
 * Rode no servidor, na pasta backend (com o .env de produção):
 *   node scripts/diagnostic-admin-login.js
 *
 * Mostra: se a tabela existe, quantos usuários há, e-mails e o comando para corrigir.
 */
const mysql = require("mysql2/promise");
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

async function run() {
  const config = {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3307", 10),
    user: process.env.DB_USER || "donassistec_user",
    password: process.env.DB_PASSWORD || "donassistec_password",
    database: process.env.DB_NAME || "donassistec_db",
  };

  console.log("========================================");
  console.log("  DIAGNÓSTICO: 401 no /admin/login");
  console.log("========================================");
  console.log("  DB:", config.host + ":" + config.port, "| Base:", config.database);
  console.log("========================================");

  try {
    const connection = await mysql.createConnection(config);
    try {
      const [rows] = await connection.execute(
        "SELECT email, name, role, active FROM admin_team ORDER BY created_at"
      );

      if (rows.length === 0) {
        console.log("\n  ❌ Nenhum usuário na admin_team.");
        console.log("\n  O login em /admin usa APENAS a tabela admin_team.");
        console.log("  Crie um usuário com:\n");
        console.log("    node scripts/reset-and-create-admin.js\n");
        console.log("  Ou com e-mail/senha próprios:");
        console.log("    email=admin@donassistec.com senha=SuaSenha123 nome=Admin node scripts/reset-and-create-admin.js\n");
      } else {
        console.log("\n  ✅ Tabela admin_team existe. Usuários:\n");
        rows.forEach((r, i) => {
          console.log("    " + (i + 1) + ".", r.email, "|", r.name, "|", r.role, "|", r.active ? "ativo" : "INATIVO");
        });
        console.log("\n  Se o login ainda der 401:");
        console.log("    1. Confira se a senha está correta.");
        console.log("    2. Redefina com: email=" + (rows[0]?.email || "seu@email.com") + " senha=NovaSenha123 reset=1 node scripts/create-admin-team.js");
        console.log("       Ou use reset-and-create-admin.js para recomeçar do zero.\n");
      }
    } finally {
      await connection.end();
    }
  } catch (err) {
    if (err.code === "ER_BAD_DB_ERROR") {
      console.log("\n  ❌ Base de dados não existe:", config.database);
    } else if (err.code === "ER_ACCESS_DENIED_ERROR") {
      console.log("\n  ❌ Acesso negado ao MySQL. Verifique DB_USER e DB_PASSWORD no .env");
    } else if (err.code === "ECONNREFUSED") {
      console.log("\n  ❌ Não foi possível conectar em", config.host + ":" + config.port);
      console.log("     O MySQL está rodando? O .env aponta para o servidor certo?");
    } else if (err.code === "ER_NO_SUCH_TABLE") {
      console.log("\n  ❌ Tabela admin_team não existe.");
      console.log("\n  Crie com: npm run migrate:admin-team\n");
    } else {
      console.log("\n  ❌ Erro:", err.message);
    }
    process.exit(1);
  }

  console.log("========================================");
}

run();
