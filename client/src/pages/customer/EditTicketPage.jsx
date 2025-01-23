import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CustomerLayout } from '../../components/layout';
import { Button } from '../../components/ui';
import { useAuth } from '../../contexts/auth.context';

export default function EditTicketPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [ticket, setTicket] = useState({
    title: '',
    description: '',
    priority: 'LOW',
    status: 'OPEN'
  });

  // Fetch ticket data
  useEffect(() => {
    const fetchTicket = async () => {
      if (!token || !id) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch ticket');
        }

        const data = await response.json();
        setTicket(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [token, id]);

  const handleDescriptionChange = (event) => {
    setTicket(prev => ({
      ...prev,
      description: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!token) {
      setError('Authentication required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          description: ticket.description
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update ticket');
      }

      const data = await response.json();
      setTicket(data.ticket);

      navigate('/customer/tickets');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/customer/tickets');
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <p className="text-muted-foreground">Loading ticket...</p>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">View Ticket</h1>
          <p className="text-muted-foreground mt-1">
            You can update the description of your ticket below.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Read-only ticket details */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Title
            </label>
            <div className="w-full px-3 py-2 rounded-lg border border-muted bg-muted/50 text-sm text-foreground">
              {ticket.title}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Status
              </label>
              <div className="w-full px-3 py-2 rounded-lg border border-muted bg-muted/50 text-sm text-foreground">
                {ticket.status.toLowerCase()}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Priority
              </label>
              <div className="w-full px-3 py-2 rounded-lg border border-muted bg-muted/50 text-sm text-foreground">
                {ticket.priority.toLowerCase()}
              </div>
            </div>
          </div>

          {/* Editable description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 rounded-lg border border-muted bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed min-h-[200px]"
              value={ticket.description}
              onChange={handleDescriptionChange}
              required
              disabled={saving}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" loading={saving}>
              {saving ? 'Saving...' : 'Update Description'}
            </Button>
            <Button
              as={Link}
              to={`/customer/tickets/${id}/comments`}
              variant="secondary"
            >
              View Comments
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              disabled={saving}
            >
              Back to Tickets
            </Button>
          </div>
        </form>
      </div>
    </CustomerLayout>
  );
} 