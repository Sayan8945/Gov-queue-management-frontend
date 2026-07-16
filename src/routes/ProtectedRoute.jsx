import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_HOME_ROUTE } from '@/constants/roles';

/**
 * Guards a route subtree behind simulated auth + optional role check.
 * TODO(backend): once real sessions exist, this should also handle token
 * expiry/refresh instead of relying purely on localStorage-persisted state.
 */
export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_HOME_ROUTE[user.role] || '/'} replace />;
  }

  return <Outlet />;
}
