/**
 * Verifica se existem pedidos e pré-pedidos para um lojista (por email ou id).
 * Uso: npx tsx scripts/check-retailer-data.ts <email>
 * Ex: npx tsx scripts/check-retailer-data.ts roneinetslim@gmail.com
 */
import "dotenv/config";
import pool from "../src/config/database";

async function run() {
  const email = process.argv[2];
  if (!email) {
    console.log("Uso: npx tsx scripts/check-retailer-data.ts <email-do-lojista>");
    process.exit(1);
  }

  const [retailers] = await pool.execute(
    "SELECT id, email FROM retailers WHERE email = ?",
    [email]
  );
  const r = (retailers as any[])[0];
  if (!r) {
    console.log(`Lojista não encontrado com email: ${email}`);
    process.exit(0);
  }
  const id = r.id;

  const [orders] = await pool.execute(
    "SELECT id, numero, retailer_id, status, created_at FROM orders WHERE retailer_id = ? OR retailer_id = ?",
    [id, email]
  );
  const [prePedidos] = await pool.execute(
    "SELECT id, numero, retailer_id, created_at FROM pre_pedidos WHERE retailer_id = ? OR retailer_id = ?",
    [id, email]
  );

  console.log(`\nLojista: ${email} (id: ${id})\n`);
  console.log(`Pedidos (orders): ${(orders as any[]).length}`);
  (orders as any[]).forEach((o) =>
    console.log(`  - ${o.id} | numero=${o.numero} | retailer_id=${o.retailer_id} | ${o.status} | ${o.created_at}`)
  );
  console.log(`\nPré-pedidos (pre_pedidos): ${(prePedidos as any[]).length}`);
  (prePedidos as any[]).forEach((p) =>
    console.log(`  - ${p.id} | numero=${p.numero} | retailer_id=${p.retailer_id} | ${p.created_at}`)
  );
  console.log("");
  await pool.end();
  process.exit(0);
}

run().catch(async (e) => {
  console.error(e);
  await pool.end().catch(() => {});
  process.exit(1);
});
