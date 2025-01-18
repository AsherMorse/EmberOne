/** Primary button component with loading state */

import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Content to display inside the button */
  children: ReactNode;
  /** Whether the button is in a loading state */
  loading?: boolean;
  /** Loading text to display when loading is true */
  loadingText?: string;
}

/** Button with consistent styling and loading state */
export default function Button({
  children,
  loading = false,
  loadingText,
  className = '',
  disabled,
  ...props
}: ButtonProps): ReactElement {
  return (
    <button
      className={`w-full bg-accent text-background py-2 px-4 rounded-md hover:bg-accent/90 disabled:opacity-50 ${className}`}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? loadingText || 'Loading...' : children}
    </button>
  );
}
