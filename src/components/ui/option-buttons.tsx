
import React from 'react';
import { cn } from '@/lib/utils';

interface OptionButtonsProps {
  options: string[];
  selectedOption: string;
  onSelect: (option: string) => void;
  fullWidth?: boolean;
  columns?: 1 | 2 | 3 | 4;
}

export function OptionButtons({ 
  options, 
  selectedOption, 
  onSelect, 
  fullWidth = false,
  columns = 1
}: OptionButtonsProps) {
  return (
    <div className={cn(
      "flex flex-wrap gap-2 sm:gap-3",
      columns === 1 && "flex-col",
      columns === 2 && "grid grid-cols-1 sm:grid-cols-2",
      columns === 3 && "grid grid-cols-1 sm:grid-cols-3",
      columns === 4 && "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4"
    )}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onSelect(option)}
          className={cn(
            "px-4 py-3 rounded-full text-sm bg-muted hover:bg-muted/80 transition-all duration-200",
            selectedOption === option && "bg-brahmin-primary text-white hover:bg-brahmin-dark shadow-sm",
            fullWidth && "w-full"
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
