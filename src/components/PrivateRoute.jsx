import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute() {
  const { isAuthenticated, loading } = useAuth();

  // Si todavía está leyendo el localStorage, no hacemos nada
  //if (loading) return null; 

  // Si no está autenticado, lo manda al login
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}