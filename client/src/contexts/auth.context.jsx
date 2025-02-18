import { createContext, useContext, useState, useEffect } from 'react';

/**
 * Available user roles in the system
 */
export const ROLES = {
  CUSTOMER: 'customer',
  AGENT: 'agent',
  ADMIN: 'admin',
};

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
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/session`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          // Only clear session if it's an auth error (401/403)
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('session');
            throw new Error('Invalid session');
          }
          throw new Error(data.error || 'Failed to validate session');
        }

        setUser(data.user);
      } catch (err) {
        setError(err.message);
        // Don't clear session on network errors
        if (err.message === 'Invalid session') {
          localStorage.removeItem('session');
        }
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
        const errorMessage = (() => {
          switch (response.status) {
            case 401:
              return 'Invalid email or password';
            case 400:
              return data.message || 'Invalid input';
            default:
              return data.message || 'An error occurred while signing in';
          }
        })();
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      localStorage.setItem('session', data.session.accessToken);
      setUser(data.user);

      return data.user.role.toLowerCase() || ROLES.CUSTOMER;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (email, password, fullName, role) => {
    try {
      setError(null);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password,
          fullName,
          role: role.toUpperCase()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = (() => {
          switch (response.status) {
            case 409:
              return 'Email already registered';
            case 400:
              return data.message || 'Invalid input';
            default:
              return data.message || 'An error occurred while registering';
          }
        })();
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      // After registration, we need to sign in
      const loginResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error('Registration successful but failed to sign in automatically');
      }

      localStorage.setItem('session', loginData.session.accessToken);
      setUser(loginData.user);

      return loginData.user.role.toLowerCase() || ROLES.CUSTOMER;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('session');
    setUser(null);
  };

  /**
   * Check if the user has one of the specified roles
   * @param {string|string[]} roles - Single role or array of roles to check
   * @returns {boolean} Whether the user has any of the specified roles
   */
  const hasRole = (roles) => {
    if (!user) return false;
    const userRole = user.role?.toLowerCase();
    if (!userRole) return false;
    
    if (Array.isArray(roles)) {
      return roles.includes(userRole);
    }
    return roles === userRole;
  };

  /**
   * Check if the user has permission to access a specific route/feature
   * @param {string} requiredRole - The role required for access
   * @returns {boolean} Whether the user has permission
   */
  const hasPermission = (requiredRole) => {
    if (!user) return false;
    const userRole = user.role?.toLowerCase();
    if (!userRole) return false;

    // Admin has access to everything
    if (userRole === ROLES.ADMIN) return true;

    // Agents can access agent and customer routes
    if (userRole === ROLES.AGENT && requiredRole !== ROLES.ADMIN) return true;

    // Customers can only access customer routes
    return userRole === requiredRole;
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    hasRole,
    hasPermission,
    isAuthenticated: !!user,
    role: user?.role?.toLowerCase() || null,
    token: localStorage.getItem('session')
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