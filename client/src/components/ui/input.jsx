export default function Input({
  label,
  id,
  name,
  type = 'text',
  required = false,
  disabled = false,
  value,
  onChange,
  placeholder,
  error,
  className = '',
  ...props
}) {
  return (
    <div className={className}>
      {label && (
        <label 
          htmlFor={id} 
          className={`block text-sm font-medium mb-2 ${
            disabled ? 'text-muted-foreground' : 'text-foreground'
          }`}
        >
          {label}
        </label>
      )}
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        disabled={disabled}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 rounded-lg border border-muted bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted/50"
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
} 