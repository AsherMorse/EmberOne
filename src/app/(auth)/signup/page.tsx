/** Sign up page with registration form */

import type { ReactElement } from 'react';

import AuthPage from '@/components/auth/AuthPage';

/** Renders the sign up page */
export default function SignUpPage(): ReactElement {
  return <AuthPage title="Create Account" description="Sign up for a new account" type="signup" />;
}
