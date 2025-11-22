import React, { createContext, useContext, useState } from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

const DialogContext = createContext(null);

export function Dialog({ open: controlledOpen, onOpenChange, children }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogTrigger({ asChild, children, ...props }) {
  const { setOpen } = useContext(DialogContext);
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { ...props, onClick: () => setOpen(true) });
  }
  
  return (
    <button {...props} onClick={() => setOpen(true)}>
      {children}
    </button>
  );
}

export function DialogContent({ className, children, ...props }) {
  const { open, setOpen } = useContext(DialogContext);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={() => setOpen(false)}
    >
      <div
        className="fixed inset-0 bg-black/50"
        onClick={(e) => e.stopPropagation()}
      />
      <div
        className={cn(
          'relative z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-background rounded-lg shadow-lg p-6',
          className
        )}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ className, ...props }) {
  return (
    <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left mb-4', className)} {...props} />
  );
}

export function DialogTitle({ className, ...props }) {
  return (
    <h2 className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />
  );
}

export function DialogDescription({ className, ...props }) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)} {...props} />
  );
}

export function DialogFooter({ className, ...props }) {
  return (
    <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4', className)} {...props} />
  );
}

export function DialogClose({ className, ...props }) {
  const { setOpen } = useContext(DialogContext);
  
  return (
    <button
      type="button"
      className={cn(
        'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        className
      )}
      onClick={() => setOpen(false)}
      {...props}
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </button>
  );
}

