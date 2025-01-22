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
    total: 0,
    limit: 5
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
        const queryParams = new URLSearchParams({
          page: pagination.page,
          limit: 5
        }).toString();

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets?${queryParams}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('session')}`
          }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        
        setTickets(data.tickets || []);
        setPagination(prev => ({
          ...prev,
          total: parseInt(data.pagination.total) || 0,
          page: parseInt(data.pagination.page) || 1,
          limit: parseInt(data.pagination.limit) || 5,
          pages: parseInt(data.pagination.pages) || 1
        }));
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    fetchTickets();
  }, [pagination.page]);

  const handleFilterChange = (key) => (event) => {
    setFilters(prev => ({
      ...prev,
      [key]: event.target.value
    }));
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setLoading(true); // Set loading before changing page
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
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
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: 5
      }).toString();

      const ticketsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('session')}`
        }
      });
      const data = await ticketsResponse.json();
      setTickets(data.tickets);
      setPagination(prev => ({
        ...prev,
        total: data.total,
        page: data.page,
        limit: data.limit
      }));
    } catch (err) {
      console.error('Error claiming ticket:', err);
      setError(err.message);
    }
  };

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
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 mb-6">
          <p className="text-destructive">{error}</p>
        </div>
      )}

      {/* Tickets Table */}
      <div className="rounded-lg border border-muted overflow-hidden">
        {loading ? (
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
              {[...Array(5)].map((_, index) => (
                <tr key={index} className="hover:bg-muted/50">
                  <td className="p-4 text-sm">
                    <div className="text-primary animate-pulse">Loading ticket title...</div>
                  </td>
                  <td className="p-4 text-sm">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-500 animate-pulse">
                      loading...
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-500 animate-pulse">
                      loading...
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground animate-pulse">
                    Loading date...
                  </td>
                  <td className="p-4 text-sm">
                    <span className="text-blue-500 animate-pulse">Loading assignment...</span>
                  </td>
                  <td className="p-4 text-sm">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                      >
                        View
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled
                      >
                        Claim
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                      ticket.status === 'OPEN' ? 'bg-blue-500/20 text-blue-500' :
                      ticket.status === 'IN_PROGRESS' ? 'bg-yellow-500/20 text-yellow-500' :
                      ticket.status === 'WAITING' ? 'bg-purple-500/20 text-purple-500' :
                      'bg-green-500/20 text-green-500'
                    }`}>
                      {ticket.status.toLowerCase().replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      ticket.priority === 'LOW' ? 'bg-gray-500/20 text-gray-500' :
                      ticket.priority === 'MEDIUM' ? 'bg-blue-500/20 text-blue-500' :
                      ticket.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-500' :
                      'bg-red-500/20 text-red-500'
                    }`}>
                      {ticket.priority.toLowerCase()}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-sm">
                    {ticket.assignedAgentId === userProfile?.id ? (
                      <span className="text-green-500 font-medium">Assigned to you</span>
                    ) : ticket.assignedAgentId ? (
                      <span className="text-yellow-500">Assigned to another agent</span>
                    ) : (
                      <span className="text-blue-500">Unassigned</span>
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
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-muted-foreground">
          {loading ? (
            'Loading...'
          ) : (
            `Showing page ${pagination.page} of ${pagination.pages}`
          )}
        </p>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            disabled={loading || pagination.page <= 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            Previous
          </Button>
          <Button 
            variant="outline"
            disabled={loading || pagination.page >= pagination.pages}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </AgentLayout>
  );
} 