import { Logo } from '../branding';
import { Button } from '../ui';

export default function Header({ showNav = true }) {
  return (
    <header className="border-b border-muted py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Logo />
        {showNav && (
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
    </header>
  );
} 