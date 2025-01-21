import express from 'express';
import { supabase } from '../config/supabase.js';
import { validateAuthInput } from '../middleware/validation.js';
import { requireAuth } from '../middleware/auth.js';
import { createUserProfile } from '../utils/auth.utils.js';

const router = express.Router();

/**
 * @route POST /auth/signup
 * @desc Register a new user and create profile
 * @access Public
 */
router.post('/signup', validateAuthInput, async (req, res) => {
  try {
    const { email, password, role = 'CUSTOMER' } = req.body;

    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: process.env.CLIENT_URL,
        data: { role: role.toUpperCase() }
      }
    });

    if (error) throw error;

    // Create user profile in database using admin client
    const profile = await createUserProfile(data.user);

    res.status(201).json({
      message: 'Please check your email to confirm your account',
      user: data.user,
      profile
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route POST /auth/signin
 * @desc Sign in a user and create a new session
 * @access Public
 */
router.post('/signin', validateAuthInput, async (req, res) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword(req.body);
    if (error) throw error;

    res.json({
      session: data.session,
      user: data.user
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

/**
 * @route POST /auth/signout
 * @desc Sign out user from all devices and invalidate current session
 * @access Private
 */
router.post('/signout', requireAuth, async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    if (error) throw error;

    res.json({ message: 'Signed out from all devices' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route GET /auth/session
 * @desc Get current session
 * @access Private
 */
router.get('/session', requireAuth, async (req, res) => {
  try {
    res.json({ 
      user: req.user,
      role: req.user.user_metadata?.role?.toUpperCase() || 'CUSTOMER'
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router; 