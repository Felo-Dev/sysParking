import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ClientsPage from './pages/ClientsPage';
import VehiclesPage from './pages/VehiclesPage';
import RatesPage from './pages/RatesPage';
import InvoicesPage from './pages/InvoicesPage';
import ReportesPage from './pages/ReportesPage';
import EmpleadosPage from './pages/EmpleadosPage';
import EspaciosPage from './pages/EspaciosPage';
import CarteraPage from './pages/CarteraPage';
import CuadrePage from './pages/CuadrePage';
import Loading from './components/Loading';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loading fullScreen />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loading fullScreen />;
  return !isAuthenticated ? children : <Navigate to="/" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="vehiculos" element={<VehiclesPage />} />
        <Route path="clientes" element={<ClientsPage />} />
        <Route path="tarifas" element={<RatesPage />} />
        <Route path="facturas" element={<InvoicesPage />} />
        <Route path="reportes" element={<ReportesPage />} />
        <Route path="empleados" element={<EmpleadosPage />} />
        <Route path="espacios" element={<EspaciosPage />} />
        <Route path="cartera" element={<CarteraPage />} />
        <Route path="cuadre" element={<CuadrePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
