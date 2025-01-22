import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../../components/layout';
import { Input, Button, Select } from '../../components/ui';
import { useAuth } from '../../contexts/auth.context';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'CUSTOMER'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isAuthenticated, role } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && role) {
      const from = location.state?.from?.pathname || `/${role}`;
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, role, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const role = await register(formData.email, formData.password, formData.fullName, formData.role);
      
      // Navigate to the saved location or role-specific dashboard
      const from = location.state?.from?.pathname || `/${role}`;
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header showNav={false} />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-foreground">Create an account</h1>
            <p className="text-muted-foreground mt-2">Sign up to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}
            
            <Input
              label="Full Name"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              autoComplete="name"
              disabled={isLoading}
            />

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              disabled={isLoading}
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              disabled={isLoading}
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
              disabled={isLoading}
            />

            <Select
              label="I am a"
              name="role"
              value={formData.role}
              onChange={(e) => handleChange({ target: { name: 'role', value: e.target.value }})}
              required
              disabled={isLoading}
            >
              <option value="CUSTOMER">Customer - I need support</option>
              <option value="AGENT">Agent - I provide support</option>
            </Select>

            <Button
              type="submit"
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-accent hover:underline">
                Sign in here
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
} 