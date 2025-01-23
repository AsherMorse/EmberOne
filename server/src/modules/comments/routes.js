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
 * @route POST /api/comments
 * @desc Create a new comment
 * @access Private
 */
router.post('/', 
  validateCommentCreation,
  validateInternalCommentAccess,
  commentController.createComment
);

/**
 * @route GET /api/comments/:ticketId
 * @desc Get comments for a ticket
 * @access Private
 */
router.get('/:ticketId', 
  requireTicketAccess,
  commentController.getComments
);

/**
 * @route PATCH /api/comments/:id
 * @desc Update a comment
 * @access Private
 */
router.patch('/:id', 
  requireCommentAccess,
  validateCommentUpdateAccess,
  validateCommentUpdate, 
  commentController.updateComment
);

/**
 * @route DELETE /api/comments/:id
 * @desc Delete a comment
 * @access Private
 */
router.delete('/:id',
  requireCommentAccess,
  validateCommentUpdateAccess, // Only author or admin can delete
  commentController.deleteComment
);

export default router; 