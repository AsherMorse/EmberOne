/** Form input component with validation */

import type { InputHTMLAttributes, ReactElement } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Label text for the input */
  label: string;
  /** Error message to display */
  error?: string;
}

/** Input with consistent styling and error handling */
export default function Input({
  label,
  error,
  id,
  className = '',
  ...props
}: InputProps): ReactElement {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-1 text-foreground">
        {label}
      </label>
      <input
        id={id}
        className={`w-full px-3 py-2 rounded-md bg-background text-foreground border ${
          error ? 'border-red-500' : 'border-muted'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
