import express, { Request, Response } from "express";
import { createServer } from "http";
import cors from "cors";
import dotenv from "dotenv";
import { initializeSocket } from "./services/socket";
import brandsRoutes from "./routes/brands";
import modelsRoutes from "./routes/models";
import homeContentRoutes from "./routes/homeContent";
import ordersRoutes from "./routes/orders";
import authRoutes from "./routes/auth";
import retailersRoutes from "./routes/retailers";
import settingsRoutes from "./routes/settings";
import auditLogsRoutes from "./routes/auditLogs";
import uploadRoutes from "./routes/upload";
import dynamicPricingRoutes from "./routes/dynamicPricing";
import reviewsRoutes from "./routes/reviews";
import ticketsRoutes from "./routes/tickets";
import couponsRoutes from "./routes/coupons";
import servicesRoutes from "./routes/services";
import productViewsRoutes from "./routes/productViews";
import prePedidosRoutes from "./routes/prePedidos";
import adminTeamRoutes from "./routes/adminTeam";
import retailerPriceTablesRoutes from "./routes/retailerPriceTables";
import pool from "./config/database";
import path from "path";
import { isAdminBootstrapEnabled } from "./config/security";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = parseInt(process.env.PORT || "3001", 10);

if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET?.trim()) {
  throw new Error("JWT_SECRET é obrigatório para iniciar o backend em produção.");
}

// Inicializar Socket.IO
initializeSocket(httpServer);

// Middlewares
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:8200";
app.use(cors({
  origin: (origin, callback) => {
    // Aceitar requisições sem origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);
    
    // Lista de origens permitidas
    const allowedOrigins = [
      corsOrigin,
      "http://localhost:8200",
      "http://127.0.0.1:8200",
      "http://177.67.32.204:8200",
      "http://177.67.32.204",
      "http://donassistec.com.br",
      "https://donassistec.com.br",
      "http://www.donassistec.com.br",
      "https://www.donassistec.com.br",
      /^http:\/\/.*:8200$/, // Aceitar qualquer IP na porta 8200
    ];
    
    // Verificar se a origem está permitida
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === "string") {
        return origin === allowed;
      }
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos de uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health check
app.get("/health", async (req: Request, res: Response) => {
  try {
    await pool.getConnection();
    res.json({
      success: true,
      message: "API está funcionando e conectada ao banco de dados",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: "Erro ao conectar ao banco de dados",
      message: error.message,
    });
  }
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/brands", brandsRoutes);
app.use("/api/models", modelsRoutes);
app.use("/api/home-content", homeContentRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/retailers", retailersRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/audit-logs", auditLogsRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/dynamic-pricing", dynamicPricingRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/tickets", ticketsRoutes);
app.use("/api/coupons", couponsRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/product-views", productViewsRoutes);
app.use("/api/pre-pedidos", prePedidosRoutes);
app.use("/api/admin-team", adminTeamRoutes);
app.use("/api/retailer-price-tables", retailerPriceTablesRoutes);
// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Rota não encontrada",
  });
});

// Error Handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error("Erro:", err);
  res.status(500).json({
    success: false,
    error: "Erro interno do servidor",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Iniciar servidor HTTP (com Socket.IO)
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 API disponível em http://0.0.0.0:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  console.log(`📱 Endpoints:`);
  console.log(`   - POST /api/auth/register - Registrar lojista`);
  console.log(`   - POST /api/auth/login - Login`);
  console.log(`   - GET /api/auth/me - Dados do usuário autenticado`);
  console.log(`   - GET /api/brands - Listar marcas`);
  console.log(`   - GET /api/models - Listar modelos`);
  console.log(`   - GET /api/models/:id - Detalhes do modelo`);
  console.log(`   - GET /api/home-content - Obter conteúdo da home`);
  console.log(`   - PUT /api/home-content - Atualizar conteúdo da home`);
  console.log(`   - GET /api/orders - Listar pedidos`);
  console.log(`   - POST /api/orders - Criar pedido`);
  console.log(
    `🔐 Bootstrap admin: ${isAdminBootstrapEnabled() ? "habilitado" : "desabilitado"}`
  );
});
