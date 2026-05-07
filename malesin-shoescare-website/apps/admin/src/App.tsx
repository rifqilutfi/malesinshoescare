import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import OrderPage from "./pages/dashboard/OrderPage";
import OrdersPage from "./pages/dashboard/OrdersPage";
import ServicesPage from "./pages/dashboard/ServicesPage";
import TrackingPage from "./pages/dashboard/TrackingPage";
import PaymentPage from "./pages/dashboard/PaymentPage";
import ReportsPage from "./pages/dashboard/ReportsPage";
import WorkshopPage from "./pages/dashboard/WorkshopPage";
import KurirPage from "./pages/dashboard/KurirPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected dashboard routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardOverview />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="order" element={<OrderPage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="tracking" element={<TrackingPage />} />
              <Route path="payment" element={<PaymentPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="workshop" element={<WorkshopPage />} />
              <Route path="kurir" element={<KurirPage />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
