import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/auth.context';

/**
 * ProtectedRoute - Higher Order Component for protecting routes based on auth state and roles
 * @param {Object} props - Component props
 * @param {React.Component} props.component - Component to render if authorized
 * @param {string} [props.requiredRole] - Role required to access this route
 * @returns {React.Component} Protected route component
 */
export default function ProtectedRoute({ component: Component, requiredRole }) {
  const { isAuthenticated, loading, hasPermission } = useAuth();
  const location = useLocation();

  // Show nothing while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if a role is required
  if (requiredRole && !hasPermission(requiredRole)) {
    // Redirect to the user's default role route
    return <Navigate to={`/${role}`} replace />;
  }

  // Render the protected component
  return <Component />;
} 