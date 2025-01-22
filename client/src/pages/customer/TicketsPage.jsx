import { CustomerLayout } from '../../components/layout';
import { Button, Select } from '../../components/ui';
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/auth.context';

export default function TicketsPage() {
  const { token } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    limit: 5,
    pages: 1
  });

  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    sort: 'createdAt',
    order: 'desc'
  });

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
        limit: 5
      });

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
        limit: parseInt(data.pagination.limit) || 5,
        pages: parseInt(data.pagination.pages) || 1
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, pagination.page]);

  useEffect(() => {
    if (token) {
      fetchTickets();
    } else {
      setLoading(false);
    }
  }, [fetchTickets]);

  const handleFilterChange = (key) => (event) => {
    setFilters(prev => ({
      ...prev,
      [key]: event.target.value
    }));
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setLoading(true);
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return (
    <CustomerLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">My Tickets</h1>
        <Button as={Link} to="/customer/tickets/new">New Ticket</Button>
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
                      {ticket.status.toLowerCase()}
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
                    <Button
                      as={Link}
                      to={`/customer/tickets/${ticket.id}`}
                      variant="ghost"
                      className="text-sm"
                    >
                      View Details
                    </Button>
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