import { AgentLayout } from '../../components/layout';
import { Button } from '../../components/ui';
import { StarIcon } from '../../components/ui/StarRating';
import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

export default function ViewFeedbackPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('session')}`
          }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        setTicket(data);
      } catch (err) {
        console.error('Error fetching ticket:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  if (loading) {
    return (
      <AgentLayout>
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-muted rounded mb-6"></div>
          <div className="space-y-4">
            <div className="h-24 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </AgentLayout>
    );
  }

  if (error) {
    return (
      <AgentLayout>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-destructive">Error: {error}</p>
        </div>
      </AgentLayout>
    );
  }

  if (!ticket?.feedbackRating) {
    return (
      <AgentLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Ticket Feedback</h1>
            <Link to={`/agent/tickets/${id}`}>
              <Button variant="outline">Back to Ticket</Button>
            </Link>
          </div>
          <div className="rounded-lg border border-muted p-6 text-center text-muted-foreground">
            No feedback has been provided for this ticket yet.
          </div>
        </div>
      </AgentLayout>
    );
  }

  return (
    <AgentLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Ticket Feedback</h1>
          <Link to={`/agent/tickets/${id}`}>
            <Button variant="outline">Back to Ticket</Button>
          </Link>
        </div>

        <div className="rounded-lg border border-muted">
          <div className="p-6 space-y-6">
            {/* Ticket Info */}
            <div className="space-y-2">
              <h2 className="text-lg font-medium">{ticket.title}</h2>
              <p className="text-sm text-muted-foreground">
                Feedback from {ticket.customer.fullName}
              </p>
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Rating</h3>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    className={`w-6 h-6 ${
                      star <= ticket.feedbackRating
                        ? 'text-accent fill-accent'
                        : 'text-muted fill-muted/5'
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  ({ticket.feedbackRating} out of 5)
                </span>
              </div>
            </div>

            {/* Feedback Text */}
            {ticket.feedbackText && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Comments</h3>
                <p className="text-sm p-4 rounded-lg bg-muted/50">
                  {ticket.feedbackText}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AgentLayout>
  );
} 