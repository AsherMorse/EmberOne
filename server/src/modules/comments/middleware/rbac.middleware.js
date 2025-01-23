import { commentService } from '../services/comment.service.js';

/**
 * Middleware to check if user has access to the comment
 */
export async function requireCommentAccess(req, res, next) {
  // TODO: Implement access control
  // - Check if comment exists
  // - Check if user has access to the ticket
  // - For internal comments, check if user is agent/admin
  next();
}

/**
 * Middleware to validate if user can update the comment
 */
export async function validateCommentUpdateAccess(req, res, next) {
  // TODO: Implement update access validation
  // - Check if user is the comment author
  // - Or if user is an admin
  next();
} 