import { CustomerLayout } from '../../components/layout';
import { Button, Select, Input } from '../../components/ui';
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/auth.context';

export default function TicketsPage() {
  const { token } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [perPageInput, setPerPageInput] = useState('5');
  const [userInitiatedUpdate, setUserInitiatedUpdate] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    limit: 5,
    pages: 1
  });

  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    search: ''
  });

  // Add debounce function
  const updatePaginationLimit = useCallback((value) => {
    if (loading) return; // Prevent updates while loading
    if (value > 0 && value <= 100) {
      setUserInitiatedUpdate(true);
      setPagination(prev => {
        if (prev.limit === value) return prev; // Prevent unnecessary updates
        return {
          ...prev,
          limit: value,
          page: 1
        };
      });
      setPerPageInput(value.toString());
    } else {
      setPerPageInput(pagination.limit.toString());
    }
  }, [pagination.limit, loading]);

  const fetchTickets = useCallback(async () => {
    try {
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);

      // Build query params
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit
      });

      // Add filters to query params
      if (filters.status) params.append('status', filters.status.toUpperCase());
      if (filters.priority) params.append('priority', filters.priority.toUpperCase());
      if (filters.search.trim()) params.append('search', filters.search.trim());
      if (filters.sortBy) {
        params.append('sortBy', filters.sortBy);
        params.append('sortOrder', filters.sortOrder);
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('session')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch tickets');
      }

      const data = await response.json();
      
      setTickets(data.tickets || []);
      setPagination(prev => ({
        ...prev,
        total: parseInt(data.pagination.total) || 0,
        page: parseInt(data.pagination.page) || 1,
        limit: !userInitiatedUpdate ? (parseInt(data.pagination.limit) || 5) : prev.limit,
        pages: parseInt(data.pagination.pages) || 1
      }));
      
      if (!userInitiatedUpdate) {
        setPerPageInput((parseInt(data.pagination.limit) || 5).toString());
      }
      setUserInitiatedUpdate(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, pagination.page, pagination.limit, filters, userInitiatedUpdate]);

  useEffect(() => {
    if (token) {
      fetchTickets();
    } else {
      setLoading(false);
    }
  }, [fetchTickets]);

  const handleFilterChange = (key) => (event) => {
    const value = event.target.value;
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

  return (
    <CustomerLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">My Tickets</h1>
        <Button as={Link} to="/customer/tickets/new">New Ticket</Button>
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

          <div className="flex items-center h-10">
            <label className="text-sm text-muted-foreground whitespace-nowrap mr-2 flex items-center h-full">Per page:</label>
            <Input
              type="number"
              min="1"
              max="100"
              value={perPageInput}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 100)) {
                  setPerPageInput(value);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const value = parseInt(perPageInput);
                  if (!loading) updatePaginationLimit(value);
                  e.target.blur();
                }
              }}
              onBlur={() => {
                const value = parseInt(perPageInput);
                if (!value || value < 1 || value > 100) {
                  setPerPageInput(pagination.limit.toString());
                }
              }}
              onWheel={(e) => {
                e.preventDefault();
                e.target.blur();
              }}
              className="h-10 w-24 px-2 py-0 text-center"
              step="1"
              onInput={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value) && !loading) {
                  updatePaginationLimit(value);
                }
              }}
            />
          </div>
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
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Last Update</th>
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
                  <td className="p-4 text-sm text-muted-foreground animate-pulse">
                    Loading date...
                  </td>
                  <td className="p-4 text-sm">
                    <Button
                      variant="ghost"
                      className="text-sm"
                      disabled
                    >
                      View Details
                    </Button>
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
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Last Update</th>
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
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {new Date(ticket.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-sm">
                    <div className="flex gap-2">
                      <Button
                        as={Link}
                        to={`/customer/tickets/${ticket.id}`}
                        variant="ghost"
                        className="text-sm"
                      >
                        View Details
                      </Button>
                      {ticket.status === 'CLOSED' && !ticket.feedbackRating && !ticket.feedbackText && (
                        <Button
                          as={Link}
                          to={`/customer/tickets/${ticket.id}/feedback`}
                          variant="secondary"
                          className="text-sm"
                        >
                          Give Feedback
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
            <p className="text-muted-foreground mb-4">No tickets found.</p>
            <Button as={Link} to="/customer/tickets/new">Create Your First Ticket</Button>
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
    </CustomerLayout>
  );
}