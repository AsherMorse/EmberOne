import { supabaseAdmin } from '../config/supabase.js';

/**
 * Creates a user profile in the database after successful signup
 * @param {Object} user - User object from Supabase Auth
 * @returns {Promise<Object>} Created profile
 */
export const createUserProfile = async (user) => {
  try {
    if (!user?.id || !user?.email) {
      throw new Error('Invalid user data for profile creation');
    }

    // Extract username from email
    const username = user.email.split('@')[0];

    console.log('Creating profile for user:', {
      username,
      email: user.email,
      metadata: user.user_metadata
    });

    // Insert profile into database using Supabase Admin client
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || username,
        role: (user.user_metadata?.role || 'customer').toUpperCase(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
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
}; 