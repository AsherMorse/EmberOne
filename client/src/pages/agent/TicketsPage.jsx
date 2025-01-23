import { AgentLayout } from '../../components/layout';
import { Button, Select, Input, Checkbox } from '../../components/ui';
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
    limit: 10
  });

  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    search: '',
    onlyAssigned: false
  });

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit
      });

      // Add filters to query params
      if (filters.status) queryParams.append('status', filters.status.toUpperCase());
      if (filters.priority) queryParams.append('priority', filters.priority.toUpperCase());
      if (filters.search.trim()) queryParams.append('search', filters.search.trim());
      if (filters.sortBy) {
        queryParams.append('sortBy', filters.sortBy);
        queryParams.append('sortOrder', filters.sortOrder);
      }
      if (filters.onlyAssigned) queryParams.append('onlyAssigned', 'true');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('session')}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      setTickets(data.tickets || []);
      setPagination(prev => ({
        ...prev,
        total: parseInt(data.pagination.total) || 0,
        page: parseInt(data.pagination.page) || 1,
        pages: parseInt(data.pagination.pages) || 1
      }));
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('session')}`
          }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        setUserProfile(data.profile);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.message);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleFilterChange = (key) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
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
      fetchTickets();
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

      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search tickets..."
              value={filters.search}
              onChange={handleFilterChange('search')}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
          <Select 
            value={filters.status}
            onChange={handleFilterChange('status')}
            className="w-full"
          >
            <option value="">All Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="WAITING">Waiting</option>
            <option value="CLOSED">Closed</option>
          </Select>

          <Select 
            value={filters.priority}
            onChange={handleFilterChange('priority')}
            className="w-full"
          >
            <option value="">All Priority</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </Select>

          <Select 
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              setFilters(prev => ({ ...prev, sortBy, sortOrder }));
            }}
            className="w-full"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="updatedAt-desc">Recently Updated</option>
            <option value="priority-desc">Highest Priority</option>
            <option value="priority-asc">Lowest Priority</option>
          </Select>

          <Checkbox
            id="onlyAssigned"
            label="Only My Tickets"
            checked={filters.onlyAssigned}
            onChange={handleFilterChange('onlyAssigned')}
          />
        </div>
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
                      <Button variant="outline" size="sm" disabled>View</Button>
                      <Button variant="secondary" size="sm" disabled>Claim</Button>
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
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-muted/50">
                  <td className="p-4 text-sm">
                    <div className="text-primary">{ticket.title}</div>
                    <div className="text-muted-foreground text-xs mt-1">
                      {ticket.customer.fullName}
                    </div>
                  </td>
                  <td className="p-4 text-sm">
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="p-4 text-sm">
                    <PriorityBadge priority={ticket.priority} />
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-sm">
                    {ticket.assignedAgentId ? (
                      <span className="text-blue-500">
                        {ticket.assignedAgentId === userProfile?.id ? 'Assigned to you' : 'Assigned'}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </td>
                  <td className="p-4 text-sm">
                    <div className="flex gap-2">
                      <Link to={`/agent/tickets/${ticket.id}`}>
                        <Button variant="outline" size="sm">View</Button>
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
          <div className="p-4 text-center text-muted-foreground">
            No tickets found
          </div>
        )}
      </div>

      {/* Pagination */}
      {tickets.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {tickets.length} of {pagination.total} tickets
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.pages}
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

function StatusBadge({ status }) {
  const statusStyles = {
    OPEN: 'bg-green-500/20 text-green-500',
    IN_PROGRESS: 'bg-blue-500/20 text-blue-500',
    WAITING: 'bg-yellow-500/20 text-yellow-500',
    CLOSED: 'bg-gray-500/20 text-gray-500'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || ''}`}>
      {status.toLowerCase().replace('_', ' ')}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const priorityStyles = {
    LOW: 'bg-gray-500/20 text-gray-500',
    MEDIUM: 'bg-blue-500/20 text-blue-500',
    HIGH: 'bg-yellow-500/20 text-yellow-500',
    CRITICAL: 'bg-red-500/20 text-red-500'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityStyles[priority] || ''}`}>
      {priority.toLowerCase()}
    </span>
  );
} 