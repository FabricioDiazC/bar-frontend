import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute() {
  const { isAuthenticated } = useAuth();
  
  // Si no está logueado, lo manda al Login. Si sí, muestra la página.
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}