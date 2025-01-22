import { Router } from 'express';
import { authController } from './controllers/auth.controller.js';
import { requireAuth } from './middleware/auth.middleware.js';
import { resolveProfile } from '../profiles/middleware/profile.middleware.js';
import { validateSignUp, validateSignIn, validateProfileUpdate } from './utils/validation.utils.js';

const router = Router();

/**
 * @route POST /auth/signup
 * @desc Register a new user and create profile
 * @access Public
 */
router.post('/signup', validateSignUp, authController.signUp);

/**
 * @route POST /auth/signin
 * @desc Sign in a user and create a new session
 * @access Public
 */
router.post('/signin', validateSignIn, authController.signIn);

/**
 * @route POST /auth/signout
 * @desc Sign out user from all devices and invalidate current session
 * @access Private
 */
router.post('/signout', requireAuth, authController.signOut);

/**
 * @route GET /auth/session
 * @desc Get current session information
 * @access Private
 */
router.get('/session', requireAuth, authController.getSession);

/**
 * @route GET /auth/profile
 * @desc Get current user's profile
 * @access Private
 */
router.get('/profile', requireAuth, resolveProfile, authController.getProfile);

/**
 * @route PATCH /auth/profile
 * @desc Update current user's profile
 * @access Private
 */
router.patch('/profile', requireAuth, validateProfileUpdate, resolveProfile, authController.updateProfile);

export default router;
