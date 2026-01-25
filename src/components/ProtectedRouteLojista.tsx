import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteLojistaProps {
  children: React.ReactElement;
}

/** Protege rotas exclusivas para lojistas (role === "retailer"). Redireciona para /lojista/login se não logado ou se não for lojista. */
const ProtectedRouteLojista = ({ children }: ProtectedRouteLojistaProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/lojista/login" replace />;
  }

  if (user?.role !== "retailer") {
    return <Navigate to="/lojista/login" replace />;
  }

  return children;
};

export default ProtectedRouteLojista;
