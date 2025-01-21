import { forwardRef } from 'react';
import { Link } from 'react-router-dom';

const Button = forwardRef(({
  children,
  type = 'button',
  variant = 'primary',
  className = '',
  fullWidth = false,
  loading = false,
  disabled = false,
  to,
  ...props
}, ref) => {
  const baseStyles = 'px-4 py-2 rounded-lg transition-all font-medium inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-accent text-white hover:opacity-90 disabled:hover:opacity-50',
    secondary: 'border-2 border-accent text-accent hover:bg-accent hover:text-white disabled:hover:bg-transparent',
    outline: 'border border-muted text-foreground hover:bg-muted/50 disabled:hover:bg-transparent',
    ghost: 'text-muted-foreground hover:text-accent disabled:hover:text-muted-foreground',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const variantClass = variants[variant];
  const classes = `${baseStyles} ${variantClass} ${widthClass} ${className}`;

  const content = loading ? (
    <>
      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      {children}
    </>
  ) : children;

  if (to) {
    return (
      <Link
        ref={ref}
        to={to}
        className={classes}
        {...props}
        aria-disabled={disabled || loading}
        tabIndex={disabled || loading ? -1 : undefined}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {content}
    </button>
  );
});

Button.displayName = 'Button';

export default Button; 