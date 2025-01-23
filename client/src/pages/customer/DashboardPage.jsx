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

        // Fetch open tickets count
        const openResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets?status=OPEN&limit=1`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Fetch in progress tickets count
        const inProgressResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets?status=IN_PROGRESS&limit=1`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Fetch waiting tickets count
        const waitingResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets?status=WAITING&limit=1`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Fetch closed tickets count
        const closedResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets?status=CLOSED&limit=1`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Check if any request failed
        if (!openResponse.ok || !inProgressResponse.ok || !waitingResponse.ok || !closedResponse.ok) {
          throw new Error('Failed to fetch tickets');
        }

        // Parse responses
        const openData = await openResponse.json();
        const inProgressData = await inProgressResponse.json();
        const waitingData = await waitingResponse.json();
        const closedData = await closedResponse.json();
        
        // Set stats from pagination totals
        setStats({
          open: openData.pagination.total || 0,
          in_progress: inProgressData.pagination.total || 0,
          waiting: waitingData.pagination.total || 0,
          closed: closedData.pagination.total || 0
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