/**
 * Aplica a migration 29_admin_team.sql (tabelas admin_team, admin_role_modules, admin_user_module_overrides).
 * Uso: cd backend && npx tsx scripts/run-migration-29.ts
 * ou: npm run migrate:admin-team
 */
import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import pool from "../src/config/database";

async function run() {
  const filePath = path.join(process.cwd(), "database", "migrations", "29_admin_team.sql");
  const sql = fs.readFileSync(filePath, "utf-8");
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  for (const st of statements) {
    await pool.query(st + ";");
  }
  console.log("✅ Migration 29_admin_team aplicada com sucesso.");
  await pool.end();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("❌ Erro ao aplicar migration:", err.message);
  await pool.end().catch(() => {});
  process.exit(1);
});
