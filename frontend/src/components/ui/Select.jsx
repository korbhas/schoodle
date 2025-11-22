import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown, Check } from 'lucide-react';

export function Select({ value, onValueChange, children, className, ...props }) {
  const [open, setOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  const selectedChild = React.Children.toArray(children).find(
    (child) => React.isValidElement(child) && child.props.value === value
  );
  const selectedLabel = (React.isValidElement(selectedChild) && selectedChild.props.children) || 'Select...';

  return (
    <div className={cn('relative', className)} ref={selectRef} {...props}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
        )}
      >
        <span>{selectedLabel}</span>
        <ChevronDown className={cn('h-4 w-4 opacity-50 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-auto">
          {React.Children.map(children, (child) =>
            React.isValidElement(child)
              ? React.cloneElement(child, {
                  selected: child.props.value === value,
                  onSelect: (val) => {
                    onValueChange?.(val);
                    setOpen(false);
                  }
                })
              : child
          )}
        </div>
      )}
    </div>
  );
}

export function SelectItem({ value, children, selected, onSelect, className, ...props }) {
  return (
    <div
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
        selected && 'bg-accent',
        className
      )}
      onClick={() => onSelect?.(value)}
      {...props}
    >
      {selected && <Check className="mr-2 h-4 w-4" />}
      {children}
    </div>
  );
}

export function SelectContent({ children }) {
  return <div>{children}</div>;
}

export function SelectValue({ placeholder }) {
  return <span>{placeholder}</span>;
}

