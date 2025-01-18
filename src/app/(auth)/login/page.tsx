/** Log in page with login form */

import type { ReactElement } from 'react';

import AuthForm from '@/components/auth/AuthForm';

/** Renders the log in page */
export default function LoginPage(): ReactElement {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      {/* Auth container */}
      <div className="w-full max-w-md p-6 bg-background border border-muted rounded-lg shadow-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">Log in to your account</p>
        </div>

        {/* Auth form */}
        <AuthForm type="login" />
      </div>
    </main>
  );
}
