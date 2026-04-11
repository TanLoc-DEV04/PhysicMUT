import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface PrivateRouteProps {
  allowedRoles?: string[];
  requiredPermissions?: string[];
}

const PrivateRoute = ({ allowedRoles, requiredPermissions }: PrivateRouteProps) => {
  const { currentUser, hasPermission } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Check generic required permissions (if passed)
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAnyPermission = requiredPermissions.some(perm => hasPermission(perm));
    if (!hasAnyPermission) {
       return <Navigate to="/models" replace />;
    }
    return <Outlet />;
  }

  // Fallback checking legacy roles
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = typeof currentUser.role === 'object' ? (currentUser.role as any).name : currentUser.role;
    const hasAccess = allowedRoles.some(role => role.toLowerCase() === (userRole || '').toLowerCase());

    if (!hasAccess) {
      return <Navigate to="/models" replace />;
    }
  }

  return <Outlet />;
};

export default PrivateRoute;
