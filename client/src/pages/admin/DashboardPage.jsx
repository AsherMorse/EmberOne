import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/button';

const NavLink = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname === to + '/';

  return (
    <Link
      to={to}
      className={`flex items-center px-4 py-2 text-sm transition-colors rounded-lg ${
        isActive 
          ? 'bg-accent text-accent-foreground font-medium'
          : 'text-muted-foreground hover:bg-muted/50'
      }`}
    >
      {children}
    </Link>
  );
};

const DashboardPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('session');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 border-r border-muted flex flex-col">
        <div className="p-6 border-b border-muted">
          <h1 className="text-lg font-semibold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage tickets and commands</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavLink to="/admin/tickets">
            Tickets
          </NavLink>
          <NavLink to="/admin/commands">
            Ticket Commands
          </NavLink>
        </nav>
        <div className="p-4 border-t border-muted">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Admin Tools v0.1
            </span>
            <Button 
              variant="ghost"
              type="button"
              onClick={handleLogout}
              className="h-8 px-2 text-xs"
            >
              Log out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 