import { useState } from 'react';
import { Button, StarRating } from '../ui';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth.context';

export default function FeedbackForm({ ticketId, onSuccess }) {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState({
    rating: 0,
    text: ''
  });

  const handleChange = (field) => (value) => {
    setFeedback(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!token) {
      setError('Authentication required');
      return;
    }

    // Validate rating
    if (!feedback.rating || feedback.rating < 1 || feedback.rating > 5) {
      setError('Please provide a rating');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          feedbackRating: feedback.rating,
          feedbackText: feedback.text.trim() || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit feedback');
      }

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Navigate back to tickets list
      navigate('/customer/tickets');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/customer/tickets');
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-destructive">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Rating *
          </label>
          <StarRating
            value={feedback.rating}
            onChange={handleChange('rating')}
            disabled={loading}
          />
          <p className="text-sm text-muted-foreground mt-2">
            1 star = Very Unsatisfied, 5 stars = Very Satisfied
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Additional Comments
          </label>
          <textarea
            className="w-full px-3 py-2 rounded-lg border border-muted bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed min-h-[100px]"
            placeholder="Share your experience with our service (optional)"
            value={feedback.text}
            onChange={(e) => handleChange('text')(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="flex gap-3">
          <Button type="submit" loading={loading}>
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
} 