import { useState, useEffect } from 'react';
import Button from '../../components/ui/button';
import Select from '../../components/ui/select';

const EXAMPLE_TICKETS = [
  {
    id: 1,
    title: "Cannot access account",
    status: "OPEN",
    priority: "HIGH",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    createdAt: "2024-01-28T10:00:00Z",
    updatedAt: "2024-01-28T11:30:00Z"
  },
  {
    id: 2,
    title: "Feature request: Dark mode",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    customerName: "Jane Smith",
    customerEmail: "jane@example.com",
    createdAt: "2024-01-27T15:00:00Z",
    updatedAt: "2024-01-28T09:00:00Z"
  },
  {
    id: 3,
    title: "Bug in checkout process",
    status: "CLOSED",
    priority: "HIGH",
    customerName: "Bob Wilson",
    customerEmail: "bob@example.com",
    createdAt: "2024-01-26T12:00:00Z",
    updatedAt: "2024-01-27T16:00:00Z"
  }
];

function formatId(id) {
  if (!id) return '';
  // If it's a UUID or long ID, take first segment
  if (typeof id === 'string' && id.includes('-')) {
    return id.split('-')[0];
  }
  // If it's a number or short ID, return as is
  return id.toString();
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

function FilterModal({ isOpen, onClose, filters, onApplyFilters }) {
  const [localFilters, setLocalFilters] = useState(filters);

  // Reset local filters when modal opens
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="fixed inset-x-0 top-0 p-6 max-w-2xl mx-auto mt-20">
        <div className="bg-background rounded-lg border border-muted shadow-lg">
          <div className="p-6 border-b border-muted flex justify-between items-center">
            <h3 className="text-lg font-semibold text-foreground">Filter Tickets</h3>
            <Button variant="ghost" onClick={onClose}>✕</Button>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Status"
                value={localFilters.status}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="">All Status</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="WAITING">Waiting</option>
                <option value="CLOSED">Closed</option>
              </Select>

              <Select
                label="Priority"
                value={localFilters.priority}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, priority: e.target.value }))}
              >
                <option value="">All Priority</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </Select>

              <Select
                label="Sort By"
                value={`${localFilters.sortBy}-${localFilters.sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setLocalFilters(prev => ({
                    ...prev,
                    sortBy: field,
                    sortOrder: order
                  }));
                }}
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="updatedAt-desc">Recently Updated</option>
                <option value="priority-desc">Highest Priority</option>
                <option value="priority-asc">Lowest Priority</option>
              </Select>

              <div className="relative">
                <div className="absolute -top-2 right-0 z-10">
                  <span className="px-2 py-0.5 text-xs rounded-full bg-accent/10 text-accent font-medium">
                    Coming Soon
                  </span>
                </div>
                <Select
                  label="Assignment"
                  value={localFilters.assignment}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, assignment: e.target.value }))}
                  disabled={true}
                >
                  <option value="">All Tickets</option>
                  <option value="assigned">Assigned Tickets</option>
                  <option value="unassigned">Unassigned Tickets</option>
                </Select>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-muted flex justify-end gap-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleApply}>
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

const TableCell = {
  id: "w-[4.5rem] truncate",
  title: "w-64 truncate",
  subtitle: "w-32 truncate",
  status: "w-24",
  priority: "w-20",
  customer: "w-40 truncate",
  email: "w-48 truncate",
  date: "w-28 truncate"
};

const TicketsPage = () => {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 6,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchTickets();
  }, [pagination.page, pagination.perPage, filters, searchQuery]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.perPage,
        ...(searchQuery && { search: searchQuery }),
        ...(filters.status && { status: filters.status }),
        ...(filters.priority && { priority: filters.priority }),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('session')}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch tickets');
      }

      const data = await response.json();
      setTickets(data.tickets || []);
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total || 0,
        totalPages: data.pagination.pages || 0
      }));
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handlePerPageChange = (value) => {
    const newPerPage = parseInt(value);
    if (newPerPage >= 1 && newPerPage <= 100) {
      setPagination(prev => ({
        ...prev,
        perPage: newPerPage,
        page: 1
      }));
    }
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when filters change
  };

  return (
    <div className="relative min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-foreground">Tickets</h2>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-muted rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <Button 
            variant="primary"
            onClick={() => setIsFilterModalOpen(true)}
          >
            Filter
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 border border-red-500/20 bg-red-500/10 rounded-lg text-red-500">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-muted overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">ID</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Title</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Priority</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Customer</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Created</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-muted">
            {loading ? (
              [...Array(pagination.perPage)].map((_, index) => (
                <tr key={index} className="animate-pulse h-[72px]">
                  <td className="p-4 text-sm align-middle">
                    <div className={`h-5 bg-muted rounded font-mono ${TableCell.id}`} />
                  </td>
                  <td className="p-4 text-sm align-middle">
                    <div className={`h-5 bg-muted rounded mb-2 ${TableCell.title}`} />
                    <div className={`h-4 bg-muted rounded opacity-70 ${TableCell.subtitle}`} />
                  </td>
                  <td className="p-4 text-sm align-middle">
                    <div className={`h-6 bg-muted rounded-full ${TableCell.status}`} />
                  </td>
                  <td className="p-4 text-sm align-middle">
                    <div className={`h-6 bg-muted rounded-full ${TableCell.priority}`} />
                  </td>
                  <td className="p-4 text-sm align-middle">
                    <div className={`h-5 bg-muted rounded mb-2 ${TableCell.customer}`} />
                    <div className={`h-4 bg-muted rounded opacity-70 ${TableCell.email}`} />
                  </td>
                  <td className="p-4 text-sm align-middle">
                    <div className={`h-5 bg-muted rounded ${TableCell.date}`} />
                  </td>
                  <td className="p-4 text-sm align-middle">
                    <div className={`h-5 bg-muted rounded ${TableCell.date}`} />
                  </td>
                </tr>
              ))
            ) : tickets.length > 0 ? (
              tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-muted/50 h-[72px]">
                  <td className="p-4 text-sm text-muted-foreground font-mono align-middle">
                    <div className={TableCell.id}>{formatId(ticket.id)}</div>
                  </td>
                  <td className="p-4 text-sm align-middle">
                    <div className={`text-primary ${TableCell.title} leading-5 mb-2`}>{ticket.title}</div>
                    <div className={`text-muted-foreground text-xs ${TableCell.subtitle} leading-4`}>
                      {ticket.customer?.fullName}
                    </div>
                  </td>
                  <td className="p-4 text-sm align-middle">
                    <div className={TableCell.status}>
                      <StatusBadge status={ticket.status} />
                    </div>
                  </td>
                  <td className="p-4 text-sm align-middle">
                    <div className={TableCell.priority}>
                      <PriorityBadge priority={ticket.priority} />
                    </div>
                  </td>
                  <td className="p-4 text-sm align-middle">
                    <div className={`text-foreground ${TableCell.customer} leading-5 mb-2`}>{ticket.customer?.fullName}</div>
                    <div className={`text-muted-foreground text-xs ${TableCell.email} leading-4`}>{ticket.customer?.email}</div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground align-middle">
                    <div className={`${TableCell.date} leading-5`}>
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground align-middle">
                    <div className={`${TableCell.date} leading-5`}>
                      {new Date(ticket.updatedAt).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="p-4 text-center text-muted-foreground">
                  No tickets found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-muted-foreground">
          {loading ? (
            <span>Loading...</span>
          ) : tickets.length > 0 ? (
            <div className="space-x-1">
              <span className="text-foreground font-medium">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <span className="text-muted-foreground/60">•</span>
              <span>
                Showing {((pagination.page - 1) * pagination.perPage) + 1} to{' '}
                {Math.min(pagination.page * pagination.perPage, pagination.total)} of{' '}
                {pagination.total} tickets
              </span>
            </div>
          ) : (
            <span>No tickets found</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <label className="text-sm text-muted-foreground whitespace-nowrap mr-2">Per page:</label>
            <input
              type="number"
              className="h-8 w-16 px-2 text-center border border-muted rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent"
              value={pagination.perPage}
              onChange={(e) => handlePerPageChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                  e.preventDefault();
                }
              }}
              onWheel={(e) => e.target.blur()}
              min="1"
              max="100"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={loading || pagination.page === 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={loading || pagination.page >= pagination.totalPages}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <FilterModal 
        isOpen={isFilterModalOpen} 
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  );
};

export default TicketsPage; 