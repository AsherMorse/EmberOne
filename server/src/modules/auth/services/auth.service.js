import { supabase } from '../../../config/supabase.js';
import { profileService } from '../../profiles/services/profile.service.js';

/**
 * Service class for handling authentication-related operations
 */
class AuthService {
  /**
   * Register a new user with Supabase Auth
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User's email
   * @param {string} userData.password - User's password
   * @param {string} [userData.role='CUSTOMER'] - User's role
   * @returns {Promise<Object>} Registration result with user and profile data
   */
  async signUp({ email, password, role = 'CUSTOMER' }) {
    // Create auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: process.env.CLIENT_URL,
        data: { role: role.toUpperCase() }
      }
    });

    if (error) throw error;
    if (!data.user) throw new Error('Failed to create user');

    // Create user profile
    const profile = await profileService.createProfile(data.user);

    return {
      message: 'Please check your email to confirm your account',
      user: {
        id: data.user.id,
        email: data.user.email,
        role: data.user.user_metadata?.role || 'CUSTOMER',
        emailConfirmed: data.user.email_confirmed_at ? true : false
      },
      profile: {
        id: profile.id,
        fullName: profile.fullName,
        email: profile.email,
        role: profile.role
      }
    };
  }

  /**
   * Sign in a user with email and password
   * @param {Object} credentials - User credentials
   * @param {string} credentials.email - User's email
   * @param {string} credentials.password - User's password
   * @returns {Promise<Object>} Session and user data
   */
  async signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    if (!data.session || !data.user) {
      throw new Error('Invalid credentials');
    }

    // Get user profile
    const profile = await profileService.getProfile(data.user.id);

    return {
      session: {
        accessToken: data.session.access_token,
        expiresAt: data.session.expires_at
      },
      user: {
        id: data.user.id,
        email: data.user.email,
        role: data.user.user_metadata?.role || 'CUSTOMER',
        emailConfirmed: data.user.email_confirmed_at ? true : false,
        lastSignIn: data.user.last_sign_in_at
      },
      profile: {
        id: profile.id,
        fullName: profile.fullName,
        email: profile.email,
        role: profile.role
      }
    };
  }

  /**
   * Sign out user from all devices
   * @returns {Promise<void>}
   */
  async signOut() {
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    if (error) throw error;
  }

  /**
   * Get user profile from database
   * @param {string} userId - User ID to fetch profile for
   * @returns {Promise<Object>} User profile data
   */
  async getProfile(userId) {
    return profileService.getProfile(userId);
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, updates) {
    return profileService.updateProfile(userId, updates);
  }
}

export const authService = new AuthService();
