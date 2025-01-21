import { forwardRef } from 'react';
import { Link } from 'react-router-dom';

const Button = forwardRef(({
  children,
  type = 'button',
  variant = 'primary',
  className = '',
  fullWidth = false,
  to,
  ...props
}, ref) => {
  const baseStyles = 'px-4 py-2 rounded-lg transition-all font-medium inline-flex items-center justify-center';
  const variants = {
    primary: 'bg-accent text-white hover:opacity-90',
    secondary: 'border-2 border-accent text-accent hover:bg-accent hover:text-white',
    ghost: 'text-muted-foreground hover:text-accent',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const variantClass = variants[variant];
  const classes = `${baseStyles} ${variantClass} ${widthClass} ${className}`;

  if (to) {
    return (
      <Link
        ref={ref}
        to={to}
        className={classes}
        {...props}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button; 