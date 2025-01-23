export function Checkbox({ id, label, checked, onChange, className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex items-center">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          className="peer absolute h-5 w-5 opacity-0 cursor-pointer"
        />
        <div className={`
          h-5 w-5 shrink-0 rounded-[4px]
          border-2 border-input
          bg-background
          hover:border-accent/50
          peer-checked:border-accent peer-checked:bg-accent
          peer-checked:hover:bg-accent/90 peer-checked:hover:border-accent/90
          peer-focus-visible:outline-none 
          peer-focus-visible:ring-2 
          peer-focus-visible:ring-ring
          peer-focus-visible:ring-offset-2
          peer-focus-visible:ring-offset-background
          peer-disabled:cursor-not-allowed 
          peer-disabled:opacity-50
          transition-colors
          pointer-events-none
          dark:border-input/30
        `}>
          {checked && (
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 stroke-accent-foreground stroke-[3]"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 12.3L9.5 18L20 6" />
            </svg>
          )}
        </div>
      </div>
      {label && (
        <label 
          htmlFor={id} 
          className="text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          {label}
        </label>
      )}
    </div>
  );
} 