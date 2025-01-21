import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/auth.context';

export default function Logo() {
  const { isAuthenticated } = useAuth();
  const linkPath = isAuthenticated ? '/login' : '/';

  return (
    <Link to={linkPath} className="flex items-center gap-2 hover:opacity-90 transition-opacity">
      <img src="/flame.svg" alt="EmberOne Logo" className="w-8 h-8" />
      <span className="text-3xl font-bold text-accent translate-y-[1px]">EmberOne</span>
    </Link>
  );
} 