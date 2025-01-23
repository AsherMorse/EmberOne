import { commentService } from '../services/comment.service.js';
import { ticketService } from '../../tickets/services/ticket.service.js';

/**
 * Extract user info from request
 */
const getUserInfo = (req) => {
  const role = req.user?.user_metadata?.role?.toUpperCase() || 'CUSTOMER';
  return { role };
};

/**
 * Middleware to check if user has access to the comment
 */
export async function requireCommentAccess(req, res, next) {
  const commentId = req.params.id;
  const { role } = getUserInfo(req);

  try {
    // Get the comment first
    const comment = await commentService.getComment(commentId);
    
    if (!comment) {
      return res.status(404).json({
        message: 'Comment not found',
        code: 404
      });
    }

    // Check if user has access to the ticket
    const hasTicketAccess = await ticketService.hasAccess(comment.ticketId, req.profileId, role);
    if (!hasTicketAccess) {
      return res.status(403).json({
        message: 'Access denied',
        code: 403
      });
    }

    // For internal comments, only agents and admins can access
    if (comment.isInternal && role === 'CUSTOMER') {
      return res.status(403).json({
        message: 'Access denied',
        code: 403
      });
    }

    // Attach the comment to the request for use in later middleware
    req.comment = comment;
    next();
  } catch (error) {
    console.error('Comment access error:', error);
    res.status(500).json({
      message: 'Error checking comment access',
      code: 500
    });
  }
}

/**
 * Middleware to validate if user can update the comment
 */
export async function validateCommentUpdateAccess(req, res, next) {
  const { role } = getUserInfo(req);
  const comment = req.comment; // From previous middleware

  // Only comment author or admin can update
  if (role !== 'ADMIN' && comment.authorId !== req.profileId) {
    return res.status(403).json({
      message: 'Only the comment author or an admin can update this comment',
      code: 403
    });
  }

  // For internal comments, only agents and admins can update
  if (comment.isInternal && role === 'CUSTOMER') {
    return res.status(403).json({
      message: 'Cannot update internal comments',
      code: 403
    });
  }

  next();
}

/**
 * Middleware to ensure only agents/admins can create internal comments
 */
export function validateInternalCommentAccess(req, res, next) {
  const { role } = getUserInfo(req);
  const { isInternal } = req.body;

  if (isInternal && role === 'CUSTOMER') {
    return res.status(403).json({
      message: 'Only agents and admins can create internal comments',
      code: 403
    });
  }

  next();
} 