import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CustomerLayout } from '../../components/layout';
import { Button, Input } from '../../components/ui';
import { useAuth } from '../../contexts/auth.context';

export default function ViewCommentsPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch ticket and comments
  useEffect(() => {
    const fetchData = async () => {
      if (!token || !id) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch comments
        const commentsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets/${id}/comments`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!commentsResponse.ok) {
          throw new Error('Failed to fetch comments');
        }

        const commentsData = await commentsResponse.json();
        setComments(commentsData);

        // Fetch ticket details
        const ticketResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!ticketResponse.ok) {
          throw new Error('Failed to fetch ticket details');
        }

        const ticketData = await ticketResponse.json();
        setTicket(ticketData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, id]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets/${id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newComment.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const data = await response.json();
      setComments(prev => [data.comment, ...prev]);
      setNewComment('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-muted rounded mb-6"></div>
          <div className="space-y-4">
            <div className="h-24 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Ticket Comments</h1>
            {ticket && (
              <p className="text-muted-foreground mt-1">
                {ticket.title}
              </p>
            )}
          </div>
          <Button
            as={Link}
            to={`/customer/tickets/${id}`}
            variant="outline"
          >
            Back to Ticket
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 mb-6">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {/* Add Comment Form */}
        <form onSubmit={handleSubmitComment} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Add a Comment
            </label>
            <textarea
              className="w-full px-3 py-2 rounded-lg border border-muted bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed min-h-[100px]"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Type your comment here..."
              disabled={submitting}
              required
            />
          </div>
          <Button type="submit" loading={submitting}>
            {submitting ? 'Adding Comment...' : 'Add Comment'}
          </Button>
        </form>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center p-8 border border-muted rounded-lg">
              <p className="text-muted-foreground">No comments yet</p>
            </div>
          ) : (
            comments.map(comment => (
              <div
                key={comment.id}
                className="p-4 rounded-lg border border-muted"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-medium">{comment.author.fullName}</span>
                    <span className="text-muted-foreground text-sm ml-2">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </CustomerLayout>
  );
} 