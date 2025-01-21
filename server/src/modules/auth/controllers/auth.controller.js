import { authService } from '../services/auth.service.js';
import { formatSuccess, formatError } from '../utils/response.utils.js';

/**
 * Controller for handling authentication-related routes
 */
class AuthController {
  /**
   * Register a new user
   * @param {import('express').Request} req - Express request object
   * @param {import('express').Response} res - Express response object
   */
  async signUp(req, res) {
    try {
      const result = await authService.signUp(req.body);
      res.status(201).json(formatSuccess(result));
    } catch (error) {
      console.error('Signup error:', error);
      res.status(400).json(formatError(error.message, 400));
    }
  }

  /**
   * Sign in an existing user
   * @param {import('express').Request} req - Express request object
   * @param {import('express').Response} res - Express response object
   */
  async signIn(req, res) {
    try {
      const result = await authService.signIn(req.body);
      res.json(formatSuccess(result));
    } catch (error) {
      res.status(401).json(formatError(error.message, 401));
    }
  }

  /**
   * Sign out user from all devices
   * @param {import('express').Request} req - Express request object
   * @param {import('express').Response} res - Express response object
   */
  async signOut(req, res) {
    try {
      await authService.signOut();
      res.json(formatSuccess({ message: 'Signed out from all devices' }));
    } catch (error) {
      res.status(400).json(formatError(error.message, 400));
    }
  }

  /**
   * Get current session information
   * @param {import('express').Request} req - Express request object
   * @param {import('express').Response} res - Express response object
   */
  async getSession(req, res) {
    try {
      const sessionData = {
        user: req.user,
        role: req.user.user_metadata?.role?.toUpperCase() || 'CUSTOMER'
      };
      res.json(formatSuccess(sessionData));
    } catch (error) {
      res.status(400).json(formatError(error.message, 400));
    }
  }

  /**
   * Get current user's profile
   * @param {import('express').Request} req - Express request object
   * @param {import('express').Response} res - Express response object
   */
  async getProfile(req, res) {
    try {
      const profile = await authService.getProfile(req.user.id);
      res.json(formatSuccess({ profile }));
    } catch (error) {
      const status = error.message === 'Profile not found' ? 404 : 500;
      res.status(status).json(formatError(error.message, status));
    }
  }
}

export const authController = new AuthController();
