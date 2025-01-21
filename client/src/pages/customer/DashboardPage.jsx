import { CustomerLayout } from '../../components/layout';
import { Button } from '../../components/ui';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  return (
    <CustomerLayout>
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-lg border border-muted bg-card">
          <p className="text-sm text-muted-foreground mb-1">Open Tickets</p>
          <p className="text-2xl font-bold text-accent">0</p>
        </div>
        <div className="p-4 rounded-lg border border-muted bg-card">
          <p className="text-sm text-muted-foreground mb-1">In Progress</p>
          <p className="text-2xl font-bold text-accent">0</p>
        </div>
        <div className="p-4 rounded-lg border border-muted bg-card">
          <p className="text-sm text-muted-foreground mb-1">Waiting</p>
          <p className="text-2xl font-bold text-accent">0</p>
        </div>
        <div className="p-4 rounded-lg border border-muted bg-card">
          <p className="text-sm text-muted-foreground mb-1">Resolved</p>
          <p className="text-2xl font-bold text-accent">0</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <div className="flex gap-4">
            <Button as={Link} to="/customer/tickets/new">
              New Ticket
            </Button>
            <Button variant="ghost" as={Link} to="/customer/tickets">
              View All
            </Button>
          </div>
        </div>
        <div className="rounded-lg border border-muted overflow-hidden">
          <div className="p-8 text-center">
            <p className="text-muted-foreground">
              No recent activity to show.
            </p>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
} 