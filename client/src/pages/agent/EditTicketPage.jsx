import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AgentLayout } from '../../components/layout';
import { Button, Input, Select } from '../../components/ui';
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
    status: 'OPEN',
    assignedAgentId: null
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
            'Authorization': `Bearer ${localStorage.getItem('session')}`,
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
      setSaving(true);
      setError(null);

      const updates = {
        status: ticket.status
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('session')}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update ticket');
      }

      navigate('/agent/tickets');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/agent/tickets');
  };

  if (loading) {
    return (
      <AgentLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <p className="text-muted-foreground">Loading ticket...</p>
        </div>
      </AgentLayout>
    );
  }

  return (
    <AgentLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Update Ticket Status</h1>
          <p className="text-muted-foreground mt-1">
            As an agent, you can update the ticket status.
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
              value={ticket.title}
              disabled={true}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 rounded-lg border border-muted bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed min-h-[200px]"
              value={ticket.description}
              disabled={true}
            />
          </div>

          <div>
            <Select
              label="Priority"
              value={ticket.priority}
              disabled={true}
            >
              <option value="LOW">Low - Non-urgent issue</option>
              <option value="MEDIUM">Medium - Standard priority</option>
              <option value="HIGH">High - Urgent issue</option>
              <option value="CRITICAL">Critical - Immediate attention needed</option>
            </Select>
          </div>

          <div>
            <Select
              label="Status"
              value={ticket.status}
              onChange={handleChange('status')}
              required
              disabled={saving}
            >
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="WAITING">Waiting</option>
              <option value="CLOSED">Closed</option>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" loading={saving}>
              {saving ? 'Saving...' : 'Update Status'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </AgentLayout>
  );
} 