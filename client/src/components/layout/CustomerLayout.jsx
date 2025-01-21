import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/auth.context';
import { Header } from '.';

/**
 * CustomerLayout - Layout wrapper for customer pages
 */
export default function CustomerLayout({ children }) {
  const { user } = useAuth();

  const navItems = [
    { label: 'Dashboard', href: '/customer' },
    { label: 'My Tickets', href: '/customer/tickets' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header 
        showNav={true}
        navItems={navItems}
        userEmail={user?.email}
      />

      {/* Mobile Navigation */}
      <nav className="md:hidden border-b border-muted">
        <div className="container mx-auto px-4 py-2 flex gap-4">
          {navItems.map(item => (
            <Link 
              key={item.href}
              to={item.href} 
              className="text-muted-foreground hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
} 