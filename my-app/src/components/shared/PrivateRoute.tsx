import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface PrivateRouteProps {
  allowedRoles: string[];
}

const PrivateRoute = ({ allowedRoles }: PrivateRouteProps) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Normalize role just in case (AuthContext handles it mostly, but good to be safe)
  const userRole = typeof currentUser.role === 'object' ? (currentUser.role as any).name : currentUser.role;
  
  // Check if role matches (case insensitive check)
  const hasAccess = allowedRoles.some(role => role.toLowerCase() === (userRole || '').toLowerCase());

  if (!hasAccess) {
    return <Navigate to="/models" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
