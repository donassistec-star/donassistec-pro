import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { HomeContentProvider } from "@/contexts/HomeContentContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import Index from "./pages/Index";
import Catalog from "./pages/Catalog";
import ModelDetail from "./pages/ModelDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import RetailerLogin from "./pages/retailer/RetailerLogin";
import RetailerDashboard from "./pages/retailer/RetailerDashboard";
import RetailerOrders from "./pages/retailer/RetailerOrders";
import RetailerProfile from "./pages/retailer/RetailerProfile";
import RetailerSupport from "./pages/retailer/RetailerSupport";
import RetailerOrderDetail from "./pages/retailer/RetailerOrderDetail";
import RetailerReports from "./pages/retailer/RetailerReports";
import RetailerPrePedidos from "./pages/retailer/RetailerPrePedidos";
import RetailerPrePedidoDetail from "./pages/retailer/RetailerPrePedidoDetail";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import HomeContentAdmin from "./pages/admin/HomeContentAdmin";
import ModelsAdmin from "./pages/admin/ModelsAdmin";
import ModelForm from "./pages/admin/ModelForm";
import ModelVideosAdmin from "./pages/admin/ModelVideosAdmin";
import BrandsAdmin from "./pages/admin/BrandsAdmin";
import BrandForm from "./pages/admin/BrandForm";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminOrderDetail from "./pages/admin/AdminOrderDetail";
import AdminPrePedidos from "./pages/admin/AdminPrePedidos";
import AdminPrePedidoDetail from "./pages/admin/AdminPrePedidoDetail";
import AdminRetailers from "./pages/admin/AdminRetailers";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminReports from "./pages/admin/AdminReports";
import ServicesAdmin from "./pages/admin/ServicesAdmin";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminDynamicPricing from "./pages/admin/AdminDynamicPricing";
import AdminTickets from "./pages/admin/AdminTickets";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminEquipe from "./pages/admin/AdminEquipe";
import AdminRetailerPriceTables from "./pages/admin/AdminRetailerPriceTables";
import AdminRetailerTrainingVideos from "./pages/admin/AdminRetailerTrainingVideos";
import Favorites from "./pages/Favorites";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Help from "./pages/Help";
import Contact from "./pages/Contact";
import ApkDownload from "./pages/ApkDownload";
import NotFound from "./pages/NotFound";
import RetailerPriceTables from "./pages/retailer/RetailerPriceTables";
import RetailerTrainingVideos from "./pages/retailer/RetailerTrainingVideos";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedRouteAdmin from "./components/ProtectedRouteAdmin";
import ProtectedRouteLojista from "./components/ProtectedRouteLojista";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import Favicon from "./components/Favicon";
import SiteMetadata from "./components/SiteMetadata";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <FavoritesProvider>
            <CartProvider>
              <HomeContentProvider>
                <NotificationsProvider>
                <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
                <Favicon />
                <SiteMetadata />
                <ScrollToTop />
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/catalogo" element={<ProtectedRouteLojista><Catalog /></ProtectedRouteLojista>} />
                  <Route path="/modelo/:id" element={<ModelDetail />} />
                  <Route path="/carrinho" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/favoritos" element={<Favorites />} />
                  <Route path="/sobre" element={<About />} />
                  <Route path="/ajuda" element={<Help />} />
                  <Route path="/contato" element={<Contact />} />
                  <Route path="/apk" element={<ApkDownload />} />
                  <Route path="/privacidade" element={<Privacy />} />
                  <Route path="/termos" element={<Terms />} />
                  
                  {/* Retailer Routes */}
                  <Route path="/lojista/login" element={<RetailerLogin />} />
                  <Route
                    path="/lojista/dashboard"
                    element={
                      <ProtectedRoute>
                        <RetailerDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/lojista/pedidos"
                    element={
                      <ProtectedRoute>
                        <RetailerOrders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/lojista/pre-pedidos"
                    element={
                      <ProtectedRoute>
                        <RetailerPrePedidos />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/lojista/pre-pedidos/:id"
                    element={
                      <ProtectedRoute>
                        <RetailerPrePedidoDetail />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/lojista/perfil"
                    element={
                      <ProtectedRoute>
                        <RetailerProfile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/lojista/suporte"
                    element={
                      <ProtectedRoute>
                        <RetailerSupport />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/lojista/pedidos/:id"
                    element={
                      <ProtectedRoute>
                        <RetailerOrderDetail />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/lojista/relatorios"
                    element={
                      <ProtectedRoute>
                        <RetailerReports />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/lojista/tabela-precos"
                    element={
                      <ProtectedRoute>
                        <RetailerPriceTables />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/lojista/videos-explicativos"
                    element={
                      <ProtectedRouteLojista>
                        <RetailerTrainingVideos />
                      </ProtectedRouteLojista>
                    }
                  />
                  
                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedRouteAdmin>
                        <AdminDashboard />
                      </ProtectedRouteAdmin>
                    }
                  />
                  <Route
                    path="/admin/home-content"
                    element={
                      <ProtectedRouteAdmin>
                        <HomeContentAdmin />
                      </ProtectedRouteAdmin>
                    }
                  />
                  <Route
                    path="/admin/modelos"
                    element={
                      <ProtectedRouteAdmin>
                        <ModelsAdmin />
                      </ProtectedRouteAdmin>
                    }
                  />
                  <Route
                    path="/admin/modelos/novo"
                    element={
                      <ProtectedRouteAdmin>
                        <ModelForm />
                      </ProtectedRouteAdmin>
                    }
                  />
                  <Route
                    path="/admin/modelos/:id/editar"
                    element={
                      <ProtectedRouteAdmin>
                        <ModelForm />
                      </ProtectedRouteAdmin>
                    }
                  />
                  <Route
                    path="/admin/modelos/:id/videos"
                    element={
                      <ProtectedRouteAdmin>
                        <ModelVideosAdmin />
                      </ProtectedRouteAdmin>
                    }
                  />
                  <Route
                    path="/admin/marcas"
                    element={
                      <ProtectedRouteAdmin>
                        <BrandsAdmin />
                      </ProtectedRouteAdmin>
                    }
                  />
                  <Route
                    path="/admin/marcas/nova"
                    element={
                      <ProtectedRouteAdmin>
                        <BrandForm />
                      </ProtectedRouteAdmin>
                    }
                  />
                  <Route
                    path="/admin/marcas/:id/editar"
                    element={
                      <ProtectedRouteAdmin>
                        <BrandForm />
                      </ProtectedRouteAdmin>
                    }
                  />
                  <Route
                    path="/admin/pedidos"
                    element={
                      <ProtectedRouteAdmin>
                        <AdminOrders />
                      </ProtectedRouteAdmin>
                    }
                  />
                  <Route
                    path="/admin/pedidos/:id"
                    element={
                      <ProtectedRouteAdmin>
                        <AdminOrderDetail />
                      </ProtectedRouteAdmin>
                    }
                  />
                  <Route
                    path="/admin/pre-pedidos"
                    element={
                      <ProtectedRouteAdmin>
                        <AdminPrePedidos />
                      </ProtectedRouteAdmin>
                    }
                  />
                  <Route
                    path="/admin/pre-pedidos/:id"
                    element={
                      <ProtectedRouteAdmin>
                        <AdminPrePedidoDetail />
                      </ProtectedRouteAdmin>
                    }
                  />
                  <Route
                    path="/admin/lojistas"
                    element={
                      <ProtectedRouteAdmin>
                        <AdminRetailers />
                      </ProtectedRouteAdmin>
                    }
                  />
                  <Route
                    path="/admin/relatorios"
                    element={
                      <ProtectedRouteAdmin>
                        <AdminReports />
                      </ProtectedRouteAdmin>
                    }
                  />
                  <Route
                    path="/admin/configuracoes"
                    element={
                      <ProtectedRouteAdmin>
                        <AdminSettings />
                      </ProtectedRouteAdmin>
                    }
                  />
                  <Route
                    path="/admin/logs"
                    element={
                      <ProtectedRouteAdmin>
                        <AdminAuditLogs />
                      </ProtectedRouteAdmin>
                    }
                  />
                  <Route
                    path="/admin/avaliacoes"
                    element={
                      <ProtectedRouteAdmin>
                        <AdminReviews />
                      </ProtectedRouteAdmin>
                    }
                  />
                  <Route
                    path="/admin/precos-dinamicos"
                    element={
                      <ProtectedRouteAdmin>
                        <AdminDynamicPricing />
                      </ProtectedRouteAdmin>
                    }
                  />
                  <Route
                    path="/admin/tickets"
                    element={
                      <ProtectedRouteAdmin>
                        <AdminTickets />
                      </ProtectedRouteAdmin>
                    }
                  />
                  <Route
                    path="/admin/estoque"
                    element={
                      <ProtectedRouteAdmin>
                        <AdminInventory />
                      </ProtectedRouteAdmin>
                    }
                  />
                  <Route
                    path="/admin/cupons"
                    element={
                      <ProtectedRouteAdmin>
                        <AdminCoupons />
                      </ProtectedRouteAdmin>
                    }
                  />
                  <Route
                    path="/admin/servicos"
                    element={
                      <ProtectedRouteAdmin>
                        <ServicesAdmin />
                      </ProtectedRouteAdmin>
                    }
                  />
                  <Route
                    path="/admin/equipe"
                    element={
                      <ProtectedRouteAdmin>
                        <AdminEquipe />
                      </ProtectedRouteAdmin>
                    }
                  />
                  <Route
                    path="/admin/tabela-precos"
                    element={
                      <ProtectedRouteAdmin>
                        <AdminRetailerPriceTables />
                      </ProtectedRouteAdmin>
                    }
                  />
                  <Route
                    path="/admin/videos-lojista"
                    element={
                      <ProtectedRouteAdmin>
                        <AdminRetailerTrainingVideos />
                      </ProtectedRouteAdmin>
                    }
                  />
                  
                  {/* Redirect /lojista to login */}
                  <Route path="/lojista" element={<Navigate to="/lojista/login" replace />} />
                  {/* Redirect /admin to login */}
                  <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
                  
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
              </NotificationsProvider>
          </HomeContentProvider>
        </CartProvider>
      </FavoritesProvider>
    </AuthProvider>
  </QueryClientProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
