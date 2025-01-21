import express from 'express';
import { authController } from './controllers/auth.controller.js';
import { validateAuthInput } from './utils/validation.utils.js';
import { requireAuth } from './middleware/auth.middleware.js';

const router = express.Router();

/**
 * @route POST /auth/signup
 * @desc Register a new user and create profile
 * @access Public
 */
router.post('/signup', validateAuthInput, authController.signUp);

/**
 * @route POST /auth/signin
 * @desc Sign in a user and create a new session
 * @access Public
 */
router.post('/signin', validateAuthInput, authController.signIn);

/**
 * @route POST /auth/signout
 * @desc Sign out user from all devices and invalidate current session
 * @access Private
 */
router.post('/signout', requireAuth, authController.signOut);

/**
 * @route GET /auth/session
 * @desc Get current session
 * @access Private
 */
router.get('/session', requireAuth, authController.getSession);

/**
 * @route GET /auth/profile
 * @desc Get current user's profile
 * @access Private
 */
router.get('/profile', requireAuth, authController.getProfile);

export default router;
