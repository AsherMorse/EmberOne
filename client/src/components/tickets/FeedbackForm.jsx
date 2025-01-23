import { useState } from 'react';
import { Button, Input } from '../ui';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth.context';

export default function FeedbackForm({ ticketId, onSuccess }) {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState({
    rating: '',
    text: ''
  });

  const handleChange = (field) => (event) => {
    let value = event.target.value;
    
    // For rating, ensure it's a number between 1-5
    if (field === 'rating') {
      value = value.replace(/[^1-5]/g, '');
      if (value && (parseInt(value) < 1 || parseInt(value) > 5)) {
        return;
      }
    }

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
    const rating = parseInt(feedback.rating);
    if (!rating || rating < 1 || rating > 5) {
      setError('Please provide a rating between 1 and 5');
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
          feedbackRating: rating,
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
            Rating (1-5) *
          </label>
          <Input
            type="number"
            min="1"
            max="5"
            value={feedback.rating}
            onChange={handleChange('rating')}
            placeholder="Enter a rating from 1 to 5"
            required
            disabled={loading}
            className="w-32"
          />
          <p className="text-sm text-muted-foreground mt-1">
            1 = Very Unsatisfied, 5 = Very Satisfied
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
            onChange={handleChange('text')}
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