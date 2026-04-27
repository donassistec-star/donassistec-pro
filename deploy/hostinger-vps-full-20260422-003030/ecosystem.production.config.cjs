/**
 * PM2 para produção: backend (igual) + frontend servindo o build (dist).
 * Uso: npm run build && pm2 start ecosystem.production.config.cjs
 * Ou só o frontend: pm2 start ecosystem.production.config.cjs --only donassistec-frontend
 */
module.exports = {
  apps: [
    {
      name: "donassistec-backend",
      script: "./backend/dist/index.js",
      cwd: "/home/DonAssistec",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        HOST: "127.0.0.1",
        PORT: 3001,
        DB_HOST: "localhost",
        DB_PORT: "3307",
        DB_NAME: "donassistec_db",
        DB_USER: "donassistec_user",
        DB_PASSWORD: "donassistec_password",
        CORS_ORIGIN: "http://localhost:8200",
        // JWT_SECRET: Set via environment variable - NEVER hardcode!
        JWT_EXPIRES_IN: "7d",
      },
      error_file: "./logs/backend-error.log",
      out_file: "./logs/backend-out.log",
      log_file: "./logs/backend-combined.log",
      time: true,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
    },
    {
      name: "donassistec-frontend",
      script: "npm",
      args: "run start:prod",
      cwd: "/home/DonAssistec",
      instances: 1,
      exec_mode: "fork",
      env: { NODE_ENV: "production" },
      error_file: "./logs/frontend-error.log",
      out_file: "./logs/frontend-out.log",
      log_file: "./logs/frontend-combined.log",
      time: true,
      autorestart: true,
      watch: false,
      max_memory_restart: "200M",
    },
  ],
};
