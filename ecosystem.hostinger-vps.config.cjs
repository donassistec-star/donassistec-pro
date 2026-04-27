/**
 * PM2 portatil para VPS Hostinger.
 * Usa caminhos relativos ao diretorio onde o projeto for extraido.
 */
module.exports = {
  apps: [
    {
      name: "donassistec-backend",
      script: "./backend/dist/index.js",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        HOST: "127.0.0.1",
        PORT: 3001,
        DB_HOST: "127.0.0.1",
        DB_PORT: "3307",
        DB_NAME: "donassistec_db",
        DB_USER: "donassistec_user",
        DB_PASSWORD: "donassistec_password",
        CORS_ORIGIN: "https://donassistec.com.br",
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
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
      },
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
