import { authService } from '../services/auth.service.js';
import { profileService } from '../../profiles/services/profile.service.js';

/**
 * Extract user info from request
 */
const getUserInfo = (req) => {
  const userId = req.user?.id;
  const role = req.user?.user_metadata?.role?.toUpperCase() || 'CUSTOMER';
  return { userId, role };
};

/**
 * Controller for handling authentication-related routes
 */
class AuthController {
  /**
   * Register a new user
   */
  async signUp(req, res) {
    try {
      const result = await authService.signUp(req.body);
      res.status(201).json(result);
    } catch (error) {
      console.error('Sign up error:', error);
      if (error.message === 'Email already registered') {
        return res.status(409).json({
          message: error.message,
          code: 409
        });
      }
      res.status(500).json({
        message: 'Failed to create account',
        code: 500
      });
    }
  }

  /**
   * Sign in a user
   */
  async signIn(req, res) {
    try {
      const result = await authService.signIn(req.body);
      res.json(result);
    } catch (error) {
      console.error('Sign in error:', error);
      if (error.message === 'Invalid credentials') {
        return res.status(401).json({
          message: error.message,
          code: 401
        });
      }
      res.status(500).json({
        message: 'Failed to sign in',
        code: 500
      });
    }
  }

  /**
   * Sign out a user
   */
  async signOut(req, res) {
    try {
      await authService.signOut();
      res.json({
        message: 'Signed out successfully'
      });
    } catch (error) {
      console.error('Sign out error:', error);
      res.status(500).json({
        message: 'Failed to sign out',
        code: 500
      });
    }
  }

  /**
   * Get current session information
   */
  async getSession(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: 'No active session',
          code: 401
        });
      }

      res.json({
        user: {
          id: req.user.id,
          email: req.user.email,
          role: req.user.user_metadata?.role || 'CUSTOMER',
          emailConfirmed: req.user.email_confirmed_at ? true : false,
          lastSignIn: req.user.last_sign_in_at
        }
      });
    } catch (error) {
      console.error('Session error:', error);
      res.status(500).json({
        message: 'Failed to get session',
        code: 500
      });
    }
  }

  /**
   * Get user profile
   */
  async getProfile(req, res) {
    try {
      // Profile is already attached by middleware
      res.json({ profile: req.profile });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        message: 'Failed to get profile',
        code: 500
      });
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req, res) {
    try {
      const profile = await profileService.updateProfile(req.user.id, req.body);
      res.json({
        message: 'Profile updated successfully',
        profile
      });
    } catch (error) {
      console.error('Update profile error:', error);
      if (error.message === 'Profile not found') {
        return res.status(404).json({
          message: error.message,
          code: 404
        });
      }
      res.status(500).json({
        message: 'Failed to update profile',
        code: 500
      });
    }
  }
}

export const authController = new AuthController();
