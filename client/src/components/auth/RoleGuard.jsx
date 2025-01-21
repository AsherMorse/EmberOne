import { useAuth } from '../../contexts/auth.context';

/**
 * RoleGuard - Component for conditionally rendering content based on user roles
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to render if authorized
 * @param {string|string[]} props.roles - Required role(s) to view the content
 * @param {React.ReactNode} [props.fallback] - Content to render if unauthorized
 * @returns {React.ReactNode} The guarded content or fallback
 */
export default function RoleGuard({ children, roles, fallback = null }) {
  const { hasRole } = useAuth();

  if (!hasRole(roles)) {
    return fallback;
  }

  return children;
} 