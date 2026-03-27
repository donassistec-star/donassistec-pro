import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import pool from "../src/config/database";

async function run() {
  const filePath = path.join(process.cwd(), "database", "migrations", "31_retailer_price_tables_utf8mb4.sql");
  const sql = fs.readFileSync(filePath, "utf-8");
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const st of statements) {
    await pool.query(st + ";");
  }

  console.log("✅ Migration 31_retailer_price_tables_utf8mb4 aplicada com sucesso.");
  await pool.end();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("❌ Erro ao aplicar migration:", err.message);
  await pool.end().catch(() => {});
  process.exit(1);
});
