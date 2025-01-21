import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CustomerLayout, AgentLayout } from '../../components/layout';
import { Button, Input, Select } from '../../components/ui';
import { useAuth } from '../../contexts/auth.context';

export default function EditTicketPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
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

        const response = await fetch(`/api/tickets/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch ticket');
        }

        const data = await response.json();
        setTicket(data.ticket);
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
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        status: ticket.status
      };

      const response = await fetch(`/api/tickets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update ticket');
      }

      // Redirect back based on role
      navigate(role === 'CUSTOMER' ? '/customer/tickets' : '/agent/tickets');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(role === 'CUSTOMER' ? '/customer/tickets' : '/agent/tickets');
  };

  const Layout = role === 'CUSTOMER' ? CustomerLayout : AgentLayout;

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[400px]">
          <p className="text-muted-foreground">Loading ticket...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Edit Ticket</h1>
          <p className="text-muted-foreground mt-1">
            Update the ticket details below.
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
              onChange={handleChange('title')}
              required
              disabled={saving || role === 'CUSTOMER'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 rounded-lg border border-muted bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed min-h-[200px]"
              value={ticket.description}
              onChange={handleChange('description')}
              required
              disabled={saving || role === 'CUSTOMER'}
            />
          </div>

          <div>
            <Select
              label="Priority"
              value={ticket.priority}
              onChange={handleChange('priority')}
              required
              disabled={saving || role === 'CUSTOMER'}
            >
              <option value="LOW">Low - Non-urgent issue</option>
              <option value="MEDIUM">Medium - Standard priority</option>
              <option value="HIGH">High - Urgent issue</option>
              <option value="CRITICAL">Critical - Immediate attention needed</option>
            </Select>
          </div>

          {role !== 'CUSTOMER' && (
            <>
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
            </>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="submit" loading={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
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
    </Layout>
  );
} 