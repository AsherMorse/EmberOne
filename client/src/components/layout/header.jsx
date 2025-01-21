import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../branding';
import { Button } from '../ui';
import { useAuth } from '../../contexts/auth.context';

export default function Header({ showNav = true, navItems = [], userEmail }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="border-b border-muted py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Logo />
          {showNav && navItems.length > 0 && (
            <nav className="hidden md:flex items-center gap-4">
              {navItems.map(item => (
                <Link 
                  key={item.href}
                  to={item.href} 
                  className="text-muted-foreground hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
        <div className="flex items-center gap-4">
          {userEmail && (
            <span className="text-sm text-muted-foreground hidden md:inline">
              {userEmail}
            </span>
          )}
          {showNav ? (
            <Button variant="ghost" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <div className="space-x-4">
              <Button variant="ghost" to="/login">
                Login
              </Button>
              <Button variant="secondary" to="/register">
                Register
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 