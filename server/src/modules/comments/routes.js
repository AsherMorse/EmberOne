import { Router } from 'express';
import { commentController } from './controllers/comment.controller.js';
import { requireAuth } from '../auth/middleware/auth.middleware.js';
import { resolveProfileId } from '../profiles/middleware/profile.middleware.js';
import { requireTicketAccess } from '../tickets/middleware/rbac.middleware.js';
import { 
  validateCommentCreation, 
  validateCommentUpdate 
} from './utils/validation.utils.js';
import {
  requireCommentAccess,
  validateCommentUpdateAccess,
  validateInternalCommentAccess
} from './middleware/rbac.middleware.js';

const router = Router();

// Apply auth middleware to all routes
router.use(requireAuth);

// Apply profile middleware to all routes
router.use(resolveProfileId);

/**
 * @route POST /api/tickets/:ticketId/comments
 * @desc Create a new comment
 * @access Private
 */
router.post('/:ticketId/comments', 
  validateCommentCreation,
  requireTicketAccess,
  validateInternalCommentAccess,
  commentController.createComment
);

/**
 * @route GET /api/tickets/:ticketId/comments
 * @desc Get comments for a ticket
 * @access Private
 */
router.get('/:ticketId/comments', 
  requireTicketAccess,
  commentController.getComments
);

/**
 * @route PATCH /api/tickets/:ticketId/comments/:id
 * @desc Update a comment
 * @access Private
 */
router.patch('/:ticketId/comments/:id', 
  requireCommentAccess,
  validateCommentUpdateAccess,
  validateCommentUpdate, 
  commentController.updateComment
);

/**
 * @route DELETE /api/tickets/:ticketId/comments/:id
 * @desc Delete a comment
 * @access Private
 */
router.delete('/:ticketId/comments/:id',
  requireCommentAccess,
  validateCommentUpdateAccess,
  commentController.deleteComment
);

export default router; 