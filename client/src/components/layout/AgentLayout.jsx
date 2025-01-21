import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/auth.context';
import { Header } from '.';

export default function AgentLayout({ children }) {
  const { user } = useAuth();

  const navItems = [
    { label: 'Dashboard', href: '/agent' },
    { label: 'Tickets', href: '/agent/tickets' }
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
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-2 flex gap-6">
          {navItems.map(item => (
            <Link 
              key={item.href}
              to={item.href} 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
} 