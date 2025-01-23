import { db } from '../../../db/index.js';
import { comments } from '../../../db/schema/comments.js';
import { eq } from 'drizzle-orm';
import { createBaseCommentQuery, addCommentFilters } from '../utils/query.utils.js';

/**
 * Service class for handling comment-related operations
 */
class CommentService {
  /**
   * Create a new comment
   * @param {string} ticketId - ID of the ticket to comment on
   * @param {string} authorId - ID of the comment author
   * @param {Object} commentData - Comment data
   * @param {string} commentData.content - The comment text
   * @param {boolean} commentData.isInternal - Whether this is an internal comment
   * @returns {Promise<Object>} Created comment
   */
  async createComment(ticketId, authorId, commentData) {
    const [comment] = await db
      .insert(comments)
      .values({
        ticketId,
        authorId,
        content: commentData.content,
        isInternal: commentData.isInternal || false,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    return this.getComment(comment.id);
  }

  /**
   * Get comments for a ticket
   * @param {string} ticketId - ID of the ticket
   * @param {Object} options - Query options
   * @param {boolean} options.includeInternal - Whether to include internal comments
   * @returns {Promise<Array>} List of comments
   */
  async getTicketComments(ticketId, options = {}) {
    let query = createBaseCommentQuery();
    
    // Apply filters
    query = addCommentFilters(query, {
      ticketId,
      includeInternal: options.includeInternal
    });

    return query;
  }

  /**
   * Update a comment
   * @param {string} commentId - ID of the comment to update
   * @param {Object} updates - Update data
   * @param {string} updates.content - New comment content
   * @returns {Promise<Object>} Updated comment
   */
  async updateComment(commentId, updates) {
    const [comment] = await db
      .update(comments)
      .set({
        content: updates.content,
        updatedAt: new Date()
      })
      .where(eq(comments.id, commentId))
      .returning();

    if (!comment) {
      throw new Error('Comment not found');
    }

    return this.getComment(comment.id);
  }

  /**
   * Delete a comment
   * @param {string} commentId - ID of the comment to delete
   * @returns {Promise<void>}
   */
  async deleteComment(commentId) {
    const [comment] = await db
      .delete(comments)
      .where(eq(comments.id, commentId))
      .returning();

    if (!comment) {
      throw new Error('Comment not found');
    }
  }

  /**
   * Get a single comment by ID
   * @param {string} commentId - ID of the comment
   * @returns {Promise<Object>} Comment object
   */
  async getComment(commentId) {
    const query = createBaseCommentQuery().where(eq(comments.id, commentId));
    const [comment] = await query;

    if (!comment) {
      throw new Error('Comment not found');
    }

    return comment;
  }
}

export const commentService = new CommentService(); 