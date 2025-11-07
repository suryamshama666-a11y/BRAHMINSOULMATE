
import React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  description?: string;
  className?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function FormField({ label, description, className, required = false, children }: FormFieldProps) {
  return (
    <div className={cn("space-y-2.5 mb-5", className)}>
      <Label className="text-base font-medium flex items-center">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
      {description && (
        <div className="text-sm text-muted-foreground mt-1">{description}</div>
      )}
    </div>
  );
}
