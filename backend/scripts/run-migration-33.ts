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

  if (!columnNames.includes("service_templates")) {
    const filePath = path.join(
      process.cwd(),
      "database",
      "migrations",
      "33_retailer_price_tables_service_templates.sql"
    );
    const sql = fs.readFileSync(filePath, "utf-8");
    const statements = sql
      .split(";")
      .map((statement) => statement.trim())
      .filter((statement) => statement.length > 0);

    for (const statement of statements) {
      await pool.query(statement + ";");
    }
  }

  console.log("✅ Migration 33_retailer_price_tables_service_templates aplicada com sucesso.");
  await pool.end();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("❌ Erro ao aplicar migration:", err.message);
  await pool.end().catch(() => {});
  process.exit(1);
});
