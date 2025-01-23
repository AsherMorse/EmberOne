import { useEffect } from 'react';
import { useAuth } from '../../contexts/auth.context';

export function SessionCheck({ children }) {
  const { logout } = useAuth();

  useEffect(() => {
    // Function to check session validity
    const checkSession = async () => {
      try {
        const token = localStorage.getItem('session');
        if (!token) return;

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/session`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          // If session is invalid, clear local storage and trigger logout
          localStorage.removeItem('session');
          logout();
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('Session check failed:', error);
        localStorage.removeItem('session');
        logout();
        window.location.href = '/login';
      }
    };

    // Check session immediately
    checkSession();

    // Set up interval check (every 5 minutes)
    const interval = setInterval(checkSession, 5 * 60 * 1000);

    // Set up focus check
    const handleFocus = () => {
      console.log('focus check');
      checkSession();
    };

    // Add focus listener to both window and document for better coverage
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        console.log('visibility check');
        checkSession();
      }
    });

    // Cleanup
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [logout]);

  return children;
} 