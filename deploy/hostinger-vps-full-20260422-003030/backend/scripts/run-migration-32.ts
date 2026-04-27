import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import pool from "../src/config/database";
import mysql2 from "mysql2";

async function run() {
  const [columns] = await pool.query<mysql2.RowDataPacket[]>(
    "SHOW COLUMNS FROM retailer_price_tables"
  );

  const columnNames = columns.map((column) => String(column.Field));

  if (!columnNames.includes("featured_to_retailers")) {
    await pool.query(
      "ALTER TABLE retailer_price_tables ADD COLUMN featured_to_retailers TINYINT(1) NOT NULL DEFAULT 0 AFTER visible_to_retailers"
    );
  }

  if (!columnNames.includes("sort_order")) {
    await pool.query(
      "ALTER TABLE retailer_price_tables ADD COLUMN sort_order INT NOT NULL DEFAULT 0 AFTER featured_to_retailers"
    );
  }

  const filePath = path.join(process.cwd(), "database", "migrations", "32_retailer_price_tables_display.sql");
  const sql = fs.readFileSync(filePath, "utf-8");
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const st of statements) {
    await pool.query(st + ";");
  }

  console.log("✅ Migration 32_retailer_price_tables_display aplicada com sucesso.");
  await pool.end();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("❌ Erro ao aplicar migration:", err.message);
  await pool.end().catch(() => {});
  process.exit(1);
});
