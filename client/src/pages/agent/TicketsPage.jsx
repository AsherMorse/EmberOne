import { AgentLayout } from '../../components/layout';
import { Button, Select } from '../../components/ui';
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/auth.context';

export default function TicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });

  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    sort: 'createdAt',
    order: 'desc'
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('session')}`
          }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setUserProfile(data.profile);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.message);
      }
    };

    const fetchTickets = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('session')}`
          }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setTickets(data.tickets);
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    fetchTickets();
  }, []);

  const handleFilterChange = (key) => (event) => {
    setFilters(prev => ({
      ...prev,
      [key]: event.target.value
    }));
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleClaimTicket = async (ticketId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets/${ticketId}/assign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('session')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          agentId: userProfile.id
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to claim ticket');
      }

      // Refresh tickets after claiming
      const ticketsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('session')}`
        }
      });
      const data = await ticketsResponse.json();
      setTickets(data.tickets);
    } catch (err) {
      console.error('Error claiming ticket:', err);
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <AgentLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Tickets</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Select 
          className="w-40"
          value={filters.status}
          onChange={handleFilterChange('status')}
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="waiting">Waiting</option>
          <option value="closed">Closed</option>
        </Select>
        <Select 
          className="w-40"
          value={filters.priority}
          onChange={handleFilterChange('priority')}
        >
          <option value="all">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </Select>
        <Select 
          className="w-40"
          value={filters.sort}
          onChange={handleFilterChange('sort')}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="updated">Last Updated</option>
        </Select>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Tickets Table */}
      <div className="rounded-lg border border-muted overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Loading tickets...</p>
          </div>
        ) : tickets.length > 0 ? (
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Title</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Priority</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Created</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Assignment</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted">
              {tickets.map(ticket => (
                <tr key={ticket.id} className="hover:bg-muted/50">
                  <td className="p-4 text-sm">
                    <Link to={`/agent/tickets/${ticket.id}`} className="text-primary hover:underline">
                      {ticket.title}
                    </Link>
                  </td>
                  <td className="p-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      ticket.status === 'OPEN' ? 'bg-blue-100 text-blue-800' :
                      ticket.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                      ticket.status === 'WAITING' ? 'bg-purple-100 text-purple-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {ticket.status.toLowerCase().replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      ticket.priority === 'LOW' ? 'bg-gray-100 text-gray-800' :
                      ticket.priority === 'MEDIUM' ? 'bg-blue-100 text-blue-800' :
                      ticket.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {ticket.priority.toLowerCase()}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-sm">
                    {ticket.assignedAgentId === userProfile?.id ? (
                      <span className="text-green-600 font-medium">Assigned to you</span>
                    ) : ticket.assignedAgentId ? (
                      <span className="text-yellow-600">Assigned to another agent</span>
                    ) : (
                      <span className="text-blue-600">Unassigned</span>
                    )}
                  </td>
                  <td className="p-4 text-sm">
                    <div className="flex gap-2">
                      <Link to={`/agent/tickets/${ticket.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          View
                        </Button>
                      </Link>
                      {!ticket.assignedAgentId && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleClaimTicket(ticket.id)}
                        >
                          Claim
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No tickets found.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {tickets.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              disabled={!pagination.hasPrevPage}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              Previous
            </Button>
            <Button 
              variant="outline"
              disabled={!pagination.hasNextPage}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </AgentLayout>
  );
} 