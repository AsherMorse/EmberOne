import { useState } from 'react';
import { CustomerLayout } from '../../components/layout';
import { Button, Input, Select } from '../../components/ui';
import { useAuth } from '../../contexts/auth.context';
import { useNavigate } from 'react-router-dom';

export default function CreateTicketPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ticket, setTicket] = useState({
    title: '',
    description: '',
    priority: 'low'
  });

  const handleChange = (field) => (event) => {
    setTicket(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!token) {
      setError('Authentication required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: ticket.title,
          description: ticket.description,
          priority: ticket.priority.toUpperCase()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create ticket');
      }

      // Redirect to tickets list on success
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
    <CustomerLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Create New Ticket</h1>
          <p className="text-muted-foreground mt-1">
            Please provide details about your issue and we'll get back to you as soon as possible.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Input
              label="Title"
              placeholder="Brief summary of your issue"
              value={ticket.title}
              onChange={handleChange('title')}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 rounded-lg border border-muted bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed min-h-[200px]"
              placeholder="Please provide as much detail as possible about your issue..."
              value={ticket.description}
              onChange={handleChange('description')}
              required
              disabled={loading}
            />
          </div>

          <div>
            <Select
              label="Priority"
              value={ticket.priority}
              onChange={handleChange('priority')}
              required
              disabled={loading}
            >
              <option value="low">Low - Non-urgent issue</option>
              <option value="medium">Medium - Standard priority</option>
              <option value="high">High - Urgent issue</option>
              <option value="critical">Critical - Immediate attention needed</option>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" loading={loading}>
              {loading ? 'Creating...' : 'Create Ticket'}
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
    </CustomerLayout>
  );
} 