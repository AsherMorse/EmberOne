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
        limit: 10,
        sort: filters.sort === 'newest' ? 'createdAt' : 
              filters.sort === 'oldest' ? 'createdAt' :
              filters.sort === 'updated' ? 'updatedAt' :
              'createdAt',
        order: filters.sort === 'oldest' ? 'asc' : 'desc'
      });

      if (filters.status !== 'all') {
        params.append('status', filters.status.toUpperCase());
      }
      if (filters.priority !== 'all') {
        params.append('priority', filters.priority.toUpperCase());
      }

      const response = await fetch(`/api/tickets?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch tickets');
      }

      const data = await response.json();
      
      setTickets(data.tickets);
      setPagination({
        page: data.pagination.page,
        totalPages: data.pagination.totalPages,
        hasNextPage: data.pagination.hasNextPage,
        hasPrevPage: data.pagination.hasPrevPage
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, pagination.page, filters]);

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
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Loading tickets...</p>
          </div>
        ) : tickets.length > 0 ? (
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">ID</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Title</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Priority</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Created</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Last Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted">
              {tickets.map(ticket => (
                <tr key={ticket.id} className="hover:bg-muted/50">
                  <td className="p-4 text-sm">{ticket.id.slice(0, 8)}</td>
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
    </CustomerLayout>
  );
}