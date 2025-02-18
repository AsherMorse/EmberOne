import { useState, useEffect } from 'react';
import { AgentLayout } from '../../components/layout';
import { Button } from '../../components/ui';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/auth.context';

export default function DashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    open: 0,
    in_progress: 0,
    waiting: 0,
    closed: 0
  });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;
      try {
        setLoading(true);
        setError(null);

        // Fetch open tickets count
        const openResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets?status=OPEN&onlyAssigned=true&limit=1`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Fetch in progress tickets count
        const inProgressResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets?status=IN_PROGRESS&onlyAssigned=true&limit=1`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Fetch waiting tickets count
        const waitingResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets?status=WAITING&onlyAssigned=true&limit=1`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Fetch closed tickets count
        const closedResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets?status=CLOSED&onlyAssigned=true&limit=1`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!openResponse.ok || !inProgressResponse.ok || !waitingResponse.ok || !closedResponse.ok) {
          throw new Error('Failed to fetch ticket counts');
        }

        const openData = await openResponse.json();
        const inProgressData = await inProgressResponse.json();
        const waitingData = await waitingResponse.json();
        const closedData = await closedResponse.json();
        
        setStats({
          open: openData.pagination.total || 0,
          in_progress: inProgressData.pagination.total || 0,
          waiting: waitingData.pagination.total || 0,
          closed: closedData.pagination.total || 0
        });

        // Fetch assigned tickets
        const assignedResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets?limit=5&onlyAssigned=true`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!assignedResponse.ok) {
          throw new Error('Failed to fetch assigned tickets');
        }

        const assignedData = await assignedResponse.json();
        setTickets(assignedData.tickets);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'WAITING':
        return 'bg-purple-100 text-purple-800';
      case 'CLOSED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <AgentLayout>
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-lg border border-muted bg-card">
          <p className="text-sm text-muted-foreground mb-1">My Open</p>
          <p className="text-2xl font-bold text-accent">
            {loading ? '...' : stats.open}
          </p>
        </div>
        <div className="p-4 rounded-lg border border-muted bg-card">
          <p className="text-sm text-muted-foreground mb-1">My In Progress</p>
          <p className="text-2xl font-bold text-accent">
            {loading ? '...' : stats.in_progress}
          </p>
        </div>
        <div className="p-4 rounded-lg border border-muted bg-card">
          <p className="text-sm text-muted-foreground mb-1">My Waiting</p>
          <p className="text-2xl font-bold text-accent">
            {loading ? '...' : stats.waiting}
          </p>
        </div>
        <div className="p-4 rounded-lg border border-muted bg-card">
          <p className="text-sm text-muted-foreground mb-1">My Closed Today</p>
          <p className="text-2xl font-bold text-accent">
            {loading ? '...' : stats.closed}
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 mb-8">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Recent Activity */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Assigned Tickets</h2>
          <div className="flex gap-4">
            <Button variant="ghost" as={Link} to="/agent/tickets">
              View All Tickets
            </Button>
          </div>
        </div>
        <div className="rounded-lg border border-muted overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">Loading tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No tickets to show.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Title</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Priority</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Created</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted">
                {tickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-muted/50">
                    <td className="p-4 text-sm">{ticket.title}</td>
                    <td className="p-4 text-sm">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-muted">
                        {ticket.status.toLowerCase().replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-muted">
                        {ticket.priority.toLowerCase()}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {formatDate(ticket.createdAt)}
                    </td>
                    <td className="p-4 text-sm">
                      <Button
                        as={Link}
                        to={`/agent/tickets/${ticket.id}`}
                        variant="ghost"
                        className="text-sm"
                      >
                        View Details
                      </Button>
                      <Button
                        as={Link}
                        to={`/agent/tickets/${ticket.id}/comments`}
                        variant="secondary"
                        className="text-sm ml-2"
                      >
                        View Comments
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AgentLayout>
  );
} 