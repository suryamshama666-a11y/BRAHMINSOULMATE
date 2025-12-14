import React, { useState, useRef, useEffect, createContext, useContext, ReactNode, cloneElement, isValidElement } from 'react';

// Context for dropdown state
interface DropdownContextType {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  triggerRef: React.RefObject<HTMLElement>;
}

const DropdownContext = createContext<DropdownContextType | undefined>(undefined);

// Props for the main DropdownMenu component
interface DropdownMenuProps {
  children: ReactNode;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen, triggerRef }}>
      <div className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  );
};

// Props for the DropdownMenuTrigger component
interface DropdownMenuTriggerProps {
  children: ReactNode;
  asChild?: boolean;
}

export const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({ 
  children, 
  asChild = false 
}) => {
  const context = useContext(DropdownContext);
  if (!context) throw new Error('DropdownMenuTrigger must be used within a DropdownMenu');

  const { isOpen, setIsOpen, triggerRef } = context;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  if (asChild && isValidElement(children)) {
    return cloneElement(children as React.ReactElement<any>, {
      onClick: (e: React.MouseEvent) => {
        handleClick(e);
        if ((children as React.ReactElement<any>).props.onClick) {
          (children as React.ReactElement<any>).props.onClick(e);
        }
      },
      ref: triggerRef,
      'aria-expanded': isOpen,
      'aria-haspopup': true,
    });
  }

  return (
    <button
      type="button"
      className="inline-flex justify-center items-center"
      onClick={handleClick}
      ref={triggerRef as React.RefObject<HTMLButtonElement>}
      aria-expanded={isOpen}
      aria-haspopup={true}
    >
      {children}
    </button>
  );
};

// Props for the DropdownMenuContent component
interface DropdownMenuContentProps {
  children: ReactNode;
  align?: 'start' | 'end' | 'center';
  className?: string;
}

export const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({ 
  children, 
  align = 'center',
  className = '' 
}) => {
  const context = useContext(DropdownContext);
  if (!context) throw new Error('DropdownMenuContent must be used within a DropdownMenu');

  const { isOpen, setIsOpen, triggerRef } = context;
  const contentRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, setIsOpen, triggerRef]);

  // Close dropdown when pressing Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  // Calculate alignment classes
  const alignmentClasses = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
  };

  return (
    <div
      ref={contentRef}
      className={`absolute z-50 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-200 ${alignmentClasses[align]} ${className}`}
      role="menu"
      aria-orientation="vertical"
      tabIndex={-1}
    >
      <div className="py-1">{children}</div>
    </div>
  );
};

// Props for the DropdownMenuItem component
interface DropdownMenuItemProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({ 
  children, 
  onClick, 
  className = '',
  disabled = false
}) => {
  const context = useContext(DropdownContext);
  if (!context) throw new Error('DropdownMenuItem must be used within a DropdownMenu');

  const { setIsOpen } = context;

  const handleClick = () => {
    if (disabled) return;
    if (onClick) onClick();
    setIsOpen(false);
  };

  return (
    <button
      type="button"
      className={`w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      role="menuitem"
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};