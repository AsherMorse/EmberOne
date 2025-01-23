import { commentService } from '../services/comment.service.js';

/**
 * Controller for handling comment-related routes
 */
class CommentController {
  /**
   * Create a new comment
   */
  async createComment(req, res) {
    try {
      const comment = await commentService.createComment(
        req.body.ticketId,
        req.profileId,
        {
          content: req.body.content,
          isInternal: req.body.isInternal || false
        }
      );
      
      res.json({
        message: 'Comment created successfully',
        comment
      });
    } catch (error) {
      console.error('Create comment error:', error);
      res.status(500).json({
        message: 'Failed to create comment',
        code: 500
      });
    }
  }

  /**
   * Get comments for a ticket
   */
  async getComments(req, res) {
    try {
      const { role } = req.user;
      const comments = await commentService.getTicketComments(
        req.params.ticketId,
        {
          includeInternal: ['AGENT', 'ADMIN'].includes(role)
        }
      );
      
      res.json(comments);
    } catch (error) {
      console.error('Get comments error:', error);
      res.status(500).json({
        message: 'Failed to get comments',
        code: 500
      });
    }
  }

  /**
   * Update a comment
   */
  async updateComment(req, res) {
    try {
      const comment = await commentService.updateComment(
        req.params.id,
        {
          content: req.body.content
        }
      );

      res.json({
        message: 'Comment updated successfully',
        comment
      });
    } catch (error) {
      console.error('Update comment error:', error);
      if (error.message === 'Comment not found') {
        return res.status(404).json({
          message: error.message,
          code: 404
        });
      }
      res.status(500).json({
        message: 'Failed to update comment',
        code: 500
      });
    }
  }

  /**
   * Delete a comment
   */
  async deleteComment(req, res) {
    try {
      await commentService.deleteComment(req.params.id);
      
      res.json({
        message: 'Comment deleted successfully'
      });
    } catch (error) {
      console.error('Delete comment error:', error);
      if (error.message === 'Comment not found') {
        return res.status(404).json({
          message: error.message,
          code: 404
        });
      }
      res.status(500).json({
        message: 'Failed to delete comment',
        code: 500
      });
    }
  }
}

export const commentController = new CommentController(); 