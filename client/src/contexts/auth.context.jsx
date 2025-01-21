import { createContext, useContext, useState, useEffect } from 'react';

/**
 * AuthContext - Provides authentication state and methods throughout the application
 */
const AuthContext = createContext(null);

/**
 * AuthProvider - Manages authentication state and provides auth-related functionality
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from stored session
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('session');
        if (!token) {
          setLoading(false);
          return;
        }

        // Validate token and get user data
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/validate`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Invalid session');
        }

        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        setError(err.message);
        localStorage.removeItem('session');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign in');
      }

      localStorage.setItem('session', data.session.access_token);
      setUser(data.user);

      return data.user.user_metadata?.role?.toLowerCase() || 'customer';
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('session');
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    role: user?.user_metadata?.role?.toLowerCase() || null,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth - Custom hook to access auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 