import { useState } from 'react';
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

function FilterModal({ isOpen, onClose }) {
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    sortBy: 'createdAt-desc',
    assignment: ''
  });

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
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="">All Status</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="WAITING">Waiting</option>
                <option value="CLOSED">Closed</option>
              </Select>

              <Select
                label="Priority"
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              >
                <option value="">All Priority</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </Select>

              <Select
                label="Sort By"
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
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
                  label={
                    <div className="flex items-center gap-2">
                      Assignment
                    </div>
                  }
                  value={filters.assignment}
                  onChange={(e) => setFilters(prev => ({ ...prev, assignment: e.target.value }))}
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
            <Button variant="primary">
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

const TicketsPage = () => {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-foreground">Tickets</h2>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search tickets..."
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
            {EXAMPLE_TICKETS.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-muted/50">
                <td className="p-4 text-sm text-foreground">{ticket.id}</td>
                <td className="p-4 text-sm">
                  <div className="text-primary">{ticket.title}</div>
                  <div className="text-muted-foreground text-xs mt-1">
                    {ticket.customerName}
                  </div>
                </td>
                <td className="p-4 text-sm">
                  <StatusBadge status={ticket.status} />
                </td>
                <td className="p-4 text-sm">
                  <PriorityBadge priority={ticket.priority} />
                </td>
                <td className="p-4 text-sm">
                  <div className="text-foreground">{ticket.customerName}</div>
                  <div className="text-muted-foreground text-xs">{ticket.customerEmail}</div>
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
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-muted-foreground">
          Showing {EXAMPLE_TICKETS.length} of {EXAMPLE_TICKETS.length} tickets
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <label className="text-sm text-muted-foreground whitespace-nowrap mr-2">Per page:</label>
            <input
              type="number"
              className="h-8 w-16 px-2 text-center border border-muted rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent"
              value="10"
              min="1"
              max="100"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={true}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={true}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <FilterModal 
        isOpen={isFilterModalOpen} 
        onClose={() => setIsFilterModalOpen(false)} 
      />
    </div>
  );
};

export default TicketsPage; 