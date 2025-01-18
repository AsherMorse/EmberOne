/** Shared layout for authentication pages */

import Link from 'next/link';
import type { ReactElement } from 'react';

import AuthForm from '@/components/auth/AuthForm';

interface AuthPageProps {
  /** Page title */
  title: string;
  /** Page description */
  description: string;
  /** Current auth page type */
  type: 'login' | 'signup';
}

/** Consistent layout wrapper for auth pages */
export default function AuthPage({ title, description, type }: AuthPageProps): ReactElement {
  const altLink =
    type === 'login'
      ? { text: "Don't have an account? Sign up", href: '/signup' }
      : { text: 'Already have an account? Log in', href: '/login' };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      {/* Auth container */}
      <div className="w-full max-w-md p-6 bg-background border border-muted rounded-lg shadow-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-muted-foreground mt-2">{description}</p>
        </div>

        <AuthForm type={type} />

        {/* Auth toggle link */}
        <div className="mt-6 text-center">
          <Link href={altLink.href} className="text-sm text-muted-foreground hover:text-foreground">
            {altLink.text}
          </Link>
        </div>
      </div>
    </main>
  );
}
