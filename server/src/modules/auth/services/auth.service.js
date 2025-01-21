import { supabase } from '../../../config/supabase.js';
import { supabaseAdmin } from '../../../config/supabase.js';
import { db } from '../../../db/index.js';
import { profiles } from '../../../db/schema/profiles.js';
import { eq } from 'drizzle-orm';

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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: process.env.CLIENT_URL,
        data: { role: role.toUpperCase() }
      }
    });

    if (error) throw error;

    // Create user profile in database
    const profile = await this.createUserProfile(data.user);

    return {
      message: 'Please check your email to confirm your account',
      user: data.user,
      profile
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

    return {
      session: data.session,
      user: data.user
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
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    if (!profile) {
      throw new Error('Profile not found');
    }

    return profile;
  }

  /**
   * Create a new user profile in the database
   * @param {Object} user - User object from Supabase Auth
   * @returns {Promise<Object>} Created profile data
   */
  async createUserProfile(user) {
    try {
      if (!user?.id || !user?.email) {
        throw new Error('Invalid user data for profile creation');
      }

      // Extract username from email for default full name
      const username = user.email.split('@')[0];

      const [profile] = await db
        .insert(profiles)
        .values({
          userId: user.id,
          email: user.email,
          fullName: user.user_metadata?.full_name || username,
          role: (user.user_metadata?.role || 'CUSTOMER').toUpperCase(),
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      return profile;
    } catch (error) {
      // Log the full error for debugging
      console.error('Detailed error creating user profile:', {
        error: error.message,
        code: error.code,
        detail: error.detail,
        stack: error.stack
      });
      throw new Error(`Failed to create user profile: ${error.message}`);
    }
  }
}

export const authService = new AuthService();
