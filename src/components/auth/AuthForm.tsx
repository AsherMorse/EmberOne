'use client';

/** Authentication form with email/password fields and validation */

import { useState } from 'react';
import type { FormEvent, ReactElement } from 'react';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/lib/auth/context';

interface FormData {
  email: string;
  password: string;
}

interface AuthFormProps {
  /** Type of auth form - either 'login' or 'signup' */
  type: 'login' | 'signup';
}

/** Handles user authentication with email and password */
export default function AuthForm({ type }: AuthFormProps): ReactElement {
  const { logIn, signUp } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (type === 'login') {
        await logIn(formData.email, formData.password);
      } else {
        await signUp(formData.email, formData.password);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="email"
        label="Email"
        id="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
        error={error}
      />

      <Input
        type="password"
        label="Password"
        id="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required
        error={error}
      />

      <Button type="submit" loading={loading}>
        {type === 'login' ? 'Log In' : 'Sign Up'}
      </Button>
    </form>
  );
}
