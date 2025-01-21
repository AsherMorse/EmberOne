import { forwardRef, useState, useRef, useEffect } from 'react';

const Select = forwardRef(({ 
  label,
  className = '',
  error,
  value,
  onChange,
  children,
  placeholder = 'Select option...',
  ...props 
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const selectRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get selected option text
  useEffect(() => {
    const options = Array.from(children);
    const selected = options.find(option => option.props.value === value);
    setSelectedOption(selected?.props.children || placeholder);
  }, [value, children, placeholder]);

  const handleSelect = (optionValue, optionLabel) => {
    setIsOpen(false);
    if (onChange) {
      const event = {
        target: { value: optionValue }
      };
      onChange(event);
    }
  };

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
      )}
      <button
        type="button"
        className="w-full px-3 py-2 rounded-lg border border-muted bg-background text-sm text-foreground hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
        {...props}
      >
        <span className={value ? '' : 'text-muted-foreground'}>
          {selectedOption}
        </span>
        <span className={`text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 rounded-lg border border-muted bg-background shadow-lg">
          <div className="py-1 max-h-60 overflow-auto">
            {Array.from(children).map((option, index) => (
              <button
                key={option.props.value || index}
                type="button"
                className="w-full px-3 py-2 text-sm text-left hover:bg-muted/50 focus:outline-none focus:bg-muted/50"
                onClick={() => handleSelect(option.props.value, option.props.children)}
              >
                {option.props.children}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select; 