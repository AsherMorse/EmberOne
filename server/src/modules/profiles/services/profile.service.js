import { db } from '../../../db/index.js';
import { profiles } from '../../../db/schema/profiles.js';
import { eq } from 'drizzle-orm';

/**
 * Common profile selector
 */
const profileSelector = {
  id: profiles.id,
  userId: profiles.userId,
  email: profiles.email,
  fullName: profiles.fullName,
  role: profiles.role,
  createdAt: profiles.createdAt,
  updatedAt: profiles.updatedAt
};

/**
 * Service class for handling profile-related operations
 */
class ProfileService {
  /**
   * Get profile ID from user ID
   */
  async getProfileId(userId) {
    const [profile] = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.userId, userId));

    if (!profile) {
      throw new Error('Profile not found');
    }

    return profile.id;
  }

  /**
   * Get full profile from user ID
   */
  async getProfile(userId) {
    const [profile] = await db
      .select(profileSelector)
      .from(profiles)
      .where(eq(profiles.userId, userId));

    if (!profile) {
      throw new Error('Profile not found');
    }

    return profile;
  }

  /**
   * Create a new profile
   */
  async createProfile(userData) {
    if (!userData?.id || !userData?.email) {
      throw new Error('Invalid user data for profile creation');
    }

    const username = userData.email.split('@')[0];
    const role = (userData.user_metadata?.role || 'CUSTOMER').toUpperCase();

    const [profile] = await db
      .insert(profiles)
      .values({
        userId: userData.id,
        email: userData.email,
        fullName: userData.user_metadata?.full_name || username,
        role,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    return profile;
  }

  /**
   * Update a profile
   */
  async updateProfile(userId, updates) {
    const [profile] = await db
      .update(profiles)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(profiles.userId, userId))
      .returning();

    if (!profile) {
      throw new Error('Profile not found');
    }

    return profile;
  }

  /**
   * Check if a profile exists
   */
  async profileExists(userId) {
    const [profile] = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.userId, userId));

    return Boolean(profile);
  }
}

export const profileService = new ProfileService(); 