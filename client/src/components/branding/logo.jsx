import { Link } from 'react-router-dom';

export default function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
      <img src="/flame.svg" alt="EmberOne Logo" className="w-8 h-8" />
      <span className="text-3xl font-bold text-accent translate-y-[1px]">EmberOne</span>
    </Link>
  );
} 