import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
// Para APK (Capacitor): use base relativo para assets no WebView
const base = process.env.VITE_CAPACITOR === "true" ? "./" : undefined;

export default defineConfig(({ mode }) => ({
  base,
  optimizeDeps: {
    include: ["exceljs"],
  },
  server: {
    host: "0.0.0.0",
    port: 8200,
    strictPort: true,
    allowedHosts: true,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
    hmr: {
      overlay: false,
      // Ao acessar o dev server por IP (ex: http://177.67.32.204:8200), defina VITE_HMR_HOST=177.67.32.204
      ...(process.env.VITE_HMR_HOST && {
        host: process.env.VITE_HMR_HOST,
        port: parseInt(process.env.VITE_HMR_PORT || "8200", 10),
      }),
    },
    // Em Docker/VM/remoto, se o file watching falhar: VITE_USE_POLLING=1
    ...(process.env.VITE_USE_POLLING === "1" ? { watch: { usePolling: true } } : {}),
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
