import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../branding';
import { Button } from '../ui';
import { useAuth } from '../../contexts/auth.context';

export default function Header({ showNav = true, navItems = [], userEmail }) {
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="border-b border-muted py-4 sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Logo />
          {showNav && navItems.length > 0 && (
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map(item => (
                <Link 
                  key={item.href}
                  to={item.href} 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
        <div className="flex items-center gap-6">
          {userEmail && (
            <span className="text-sm text-muted-foreground hidden md:inline">
              {userEmail}
            </span>
          )}
          {isAuthenticated ? (
            <Button variant="ghost" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <div className="space-x-4">
              <Button variant="ghost" as={Link} to="/login">
                Login
              </Button>
              <Button variant="secondary" as={Link} to="/register">
                Register
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 