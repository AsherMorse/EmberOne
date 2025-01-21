import { useAuth } from '../../contexts/auth.context';

/**
 * AuthLoader - Handles initial auth state loading
 * Shows a loading spinner while checking authentication
 */
export default function AuthLoader({ children }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return children;
} 