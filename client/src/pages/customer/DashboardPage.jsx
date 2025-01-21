import { CustomerLayout } from '../../components/layout';
import { Button } from '../../components/ui';

export default function DashboardPage() {
  return (
    <CustomerLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back!</h1>
        <p className="text-muted-foreground">Here's an overview of your support tickets</p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="flex gap-4 flex-wrap">
          <Button>
            Create New Ticket
          </Button>
          <Button variant="secondary">
            View All Tickets
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 rounded-lg border border-muted">
          <h3 className="text-lg font-semibold mb-2">Active Tickets</h3>
          <p className="text-3xl font-bold text-accent">0</p>
        </div>
        <div className="p-6 rounded-lg border border-muted">
          <h3 className="text-lg font-semibold mb-2">Waiting Response</h3>
          <p className="text-3xl font-bold text-accent">0</p>
        </div>
        <div className="p-6 rounded-lg border border-muted">
          <h3 className="text-lg font-semibold mb-2">Resolved</h3>
          <p className="text-3xl font-bold text-accent">0</p>
        </div>
      </div>

      {/* Recent Tickets */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Tickets</h2>
        <div className="rounded-lg border border-muted overflow-hidden">
          <div className="p-8 text-center text-muted-foreground">
            No tickets found. Create your first ticket to get started.
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
} 