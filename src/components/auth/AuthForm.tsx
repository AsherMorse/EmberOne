'use client';

/** Authentication form with email/password fields and validation */

import { useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { AUTH_CONFIG } from '@/lib/auth/config';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface FormData {
  email: string;
  password: string;
}

interface ValidationErrors {
  email?: string;
  password?: string;
}

interface AuthFormProps {
  /** Type of auth form to display */
  type: 'login' | 'signup';
}

/** Handles user authentication with email and password */
export default function AuthForm({ type }: AuthFormProps) {
  const { logIn, signUp } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Validate email
    if (!formData.email) {
      errors.email = AUTH_CONFIG.ERRORS.INVALID_EMAIL;
    }

    // Validate password
    if (!formData.password) {
      errors.password = AUTH_CONFIG.ERRORS.INVALID_PASSWORD;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (type === 'login') {
        await logIn(formData.email, formData.password);
      } else {
        await signUp(formData.email, formData.password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : AUTH_CONFIG.ERRORS.UNKNOWN_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const buttonText = type === 'login' ? 'Log in' : 'Sign up';
  const loadingText = type === 'login' ? 'Logging in...' : 'Signing up...';

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
      {/* Email input field */}
      <Input
        id="email"
        type="email"
        label="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        error={validationErrors.email}
        required
      />

      {/* Password input field */}
      <Input
        id="password"
        type="password"
        label="Password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        error={validationErrors.password}
        required
      />

      {/* Error message display */}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Submit button */}
      <Button type="submit" loading={loading} loadingText={loadingText}>
        {buttonText}
      </Button>
    </form>
  );
}
