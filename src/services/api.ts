import axios, { AxiosError } from "axios";
import { toast } from "sonner";

// Hosts que usam /api no mesmo host (nginx proxy) – sem :3001
const PRODUCTION_DOMAIN = /^((www\.)?donassistec\.com\.br|177\.67\.32\.204)$/;

// Detectar automaticamente a URL da API baseado na origem atual
const getApiUrl = () => {
  // Se VITE_API_URL estiver definido, usar ele
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Se estiver rodando localmente, usar localhost
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return "http://localhost:3001/api";
  }

  const protocol = window.location.protocol;
  const hostname = window.location.hostname;

  // donassistec.com.br ou 177.67.32.204: API em /api (nginx proxy, sem porta)
  if (PRODUCTION_DOMAIN.test(hostname)) {
    return `${protocol}//${hostname}/api`;
  }

  // Outros hostnames: mesmo host e porta 3001
  return `${protocol}//${hostname}:3001/api`;
};

const api = axios.create({
  baseURL: getApiUrl(),
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("donassistec_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // Erro da API
      const status = error.response.status;
      const data = error.response.data as any;

      // Tratamento de erro 401 (não autorizado)
      if (status === 401) {
        const errorMessage = data?.error || "Token inválido ou expirado";
        console.error("Erro 401:", errorMessage, "URL:", error.config?.url);
        
        // Token expirado ou inválido
        localStorage.removeItem("donassistec_token");
        localStorage.removeItem("donassistec_auth");
        
        // Redirecionar para login apropriado baseado na rota atual
        const currentPath = window.location.pathname;
        
        // Se já estiver em uma página de login, não redirecionar
        if (currentPath.includes("/admin/login") || currentPath.includes("/lojista/login")) {
          toast.error("Sessão expirada. Faça login novamente.");
          return Promise.reject(error);
        }
        
        // Verificar se está em uma rota admin ou lojista
        if (currentPath.startsWith("/admin")) {
          window.location.href = "/admin/login";
        } else if (currentPath.startsWith("/lojista")) {
          window.location.href = "/lojista/login";
        } else {
          // Default: redirecionar para login de lojista (página pública)
          window.location.href = "/lojista/login";
        }
        
        toast.error("Sessão expirada. Faça login novamente.");
        return Promise.reject(error);
      }

      // Tratamento de erro 403 (proibido)
      if (status === 403) {
        toast.error("Você não tem permissão para realizar esta ação.");
        return Promise.reject(error);
      }

      // Tratamento de erro 404 (não encontrado)
      if (status === 404) {
        // Não mostrar toast para 404s, deixar o componente tratar
        console.warn("Recurso não encontrado:", error.config?.url);
        return Promise.reject(error);
      }

      // Tratamento de erro 500 (erro do servidor)
      if (status >= 500) {
        toast.error("Erro no servidor. Tente novamente mais tarde.");
        return Promise.reject(error);
      }

      // Outros erros da API
      const errorMessage = data?.error || data?.message || "Erro ao processar solicitação";
      console.error("Erro da API:", error.response.data);
    } else if (error.request) {
      // Erro de rede (sem resposta do servidor)
      // Backend pode não estar rodando - isso é esperado em desenvolvimento
      // Não logar erros de conexão para manter console limpo
      // Os componentes tratam individualmente se necessário
      const isNetworkError = error.code === "ERR_NETWORK" || error.code === "ERR_CONNECTION_REFUSED";
      if (!isNetworkError) {
        // Apenas logar outros tipos de erros de request
        console.warn("Erro de rede:", error.message);
      }
      // Silenciar completamente erros de conexão - componentes tratam individualmente
    } else {
      // Outro erro
      console.error("Erro:", error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
