import { AuthChangeEvent, Session } from '@supabase/supabase-js';

export const AUTH_CONFIG = {
  // Auth endpoints
  LOG_IN: '/auth/login',
  SIGN_UP: '/auth/signup',
  LOG_OUT: '/auth/logout',
  RESET_PASSWORD: '/auth/reset-password',
  UPDATE_PASSWORD: '/auth/update-password',

  // Redirect URLs
  AFTER_LOGIN_URL: '/',
  AFTER_SIGN_UP_URL: '/',
  AFTER_LOGOUT_URL: '/auth/login',

  // Session management
  SESSION_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  REFRESH_THRESHOLD: 60 * 60 * 1000, // 1 hour in milliseconds

  // Auth event handlers
  handleAuthChange: (event: AuthChangeEvent, _session: Session | null) => {
    // Handle auth state changes
    switch (event) {
      case 'SIGNED_IN':
        // Handle log in
        break;
      case 'SIGNED_OUT':
        // Handle log out
        break;
      case 'TOKEN_REFRESHED':
        // Handle token refresh
        break;
      case 'USER_UPDATED':
        // Handle user update
        break;
      case 'PASSWORD_RECOVERY':
        // Handle password recovery
        break;
      default:
        break;
    }
  },

  // Auth validation
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIREMENTS: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },

  // Error messages
  ERRORS: {
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_PASSWORD:
      'Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters',
    PASSWORDS_DONT_MATCH: 'Passwords do not match',
    INVALID_CREDENTIALS: 'Invalid email or password',
    EMAIL_IN_USE: 'Email is already in use',
    WEAK_PASSWORD: 'Password is too weak',
    SESSION_EXPIRED: 'Your session has expired. Please log in again',
    NETWORK_ERROR: 'Network error. Please try again',
    UNKNOWN_ERROR: 'An unknown error occurred. Please try again',
  },
} as const;
