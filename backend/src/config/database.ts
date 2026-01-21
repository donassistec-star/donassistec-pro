import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3307"),
  database: process.env.DB_NAME || "donassistec_db",
  user: process.env.DB_USER || "donassistec_user",
  password: process.env.DB_PASSWORD || "donassistec_password",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Testar conexão
pool
  .getConnection()
  .then((connection) => {
    console.log("✅ Conexão com MySQL estabelecida com sucesso!");
    connection.release();
  })
  .catch((error) => {
    console.error("❌ Erro ao conectar ao MySQL:", error.message);
    console.error("Verifique se o Docker está rodando e o banco de dados está acessível.");
  });

export default pool;
