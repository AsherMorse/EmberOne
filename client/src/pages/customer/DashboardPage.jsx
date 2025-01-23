import { useState, useEffect } from 'react';
import { CustomerLayout } from '../../components/layout';
import { Button } from '../../components/ui';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/auth.context';

export default function DashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    open: 0,
    in_progress: 0,
    waiting: 0,
    closed: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch all statuses in parallel
        const statuses = ['OPEN', 'IN_PROGRESS', 'WAITING', 'CLOSED'];
        const responses = await Promise.all(
          statuses.map(status =>
            fetch(`${import.meta.env.VITE_API_URL}/api/tickets?status=${status}&limit=1`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })
          )
        );

        // Check if any request failed
        const failedResponse = responses.find(r => !r.ok);
        if (failedResponse) {
          throw new Error('Failed to fetch tickets');
        }

        // Parse all responses
        const results = await Promise.all(responses.map(r => r.json()));
        
        // Set stats from pagination totals
        setStats({
          open: results[0].pagination.totalItems || 0,
          in_progress: results[1].pagination.totalItems || 0,
          waiting: results[2].pagination.totalItems || 0,
          closed: results[3].pagination.totalItems || 0
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  return (
    <CustomerLayout>
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-lg border border-muted bg-card">
          <p className="text-sm text-muted-foreground mb-1">Open Tickets</p>
          <p className="text-2xl font-bold text-accent">
            {loading ? '...' : stats.open}
          </p>
        </div>
        <div className="p-4 rounded-lg border border-muted bg-card">
          <p className="text-sm text-muted-foreground mb-1">In Progress</p>
          <p className="text-2xl font-bold text-accent">
            {loading ? '...' : stats.in_progress}
          </p>
        </div>
        <div className="p-4 rounded-lg border border-muted bg-card">
          <p className="text-sm text-muted-foreground mb-1">Waiting</p>
          <p className="text-2xl font-bold text-accent">
            {loading ? '...' : stats.waiting}
          </p>
        </div>
        <div className="p-4 rounded-lg border border-muted bg-card">
          <p className="text-sm text-muted-foreground mb-1">Resolved</p>
          <p className="text-2xl font-bold text-accent">
            {loading ? '...' : stats.closed}
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 mb-8">
          <p className="text-red-600">{error}</p>
        </div>
      )}

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