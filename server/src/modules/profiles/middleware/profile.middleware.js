import { profileService } from '../services/profile.service.js';

/**
 * Middleware to resolve profile ID and attach it to the request
 * Used in routes that only need profile ID (e.g. tickets)
 */
export const resolveProfileId = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        message: 'Unauthorized',
        code: 401
      });
    }

    const profileId = await profileService.getProfileId(userId);
    req.profileId = profileId;
    next();
  } catch (error) {
    if (error.message === 'Profile not found') {
      return res.status(404).json({
        message: error.message,
        code: 404
      });
    }
    res.status(500).json({
      message: 'Failed to resolve profile',
      code: 500
    });
  }
};

/**
 * Middleware to resolve and attach full profile to request
 * Used in routes that need complete profile info (e.g. auth)
 */
export const resolveProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        message: 'Unauthorized',
        code: 401
      });
    }

    const profile = await profileService.getProfile(userId);
    req.profile = profile;
    next();
  } catch (error) {
    if (error.message === 'Profile not found') {
      return res.status(404).json({
        message: error.message,
        code: 404
      });
    }
    res.status(500).json({
      message: 'Failed to resolve profile',
      code: 500
    });
  }
}; 