/** Log in page with login form */

import type { ReactElement } from 'react';

import AuthPage from '@/components/auth/AuthPage';

/** Renders the log in page */
export default function LoginPage(): ReactElement {
  return <AuthPage title="Welcome Back" description="Log in to your account" type="login" />;
}
