import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-full font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-white text-black border-2 border-[#FF4500] hover:bg-[#FF4500] hover:text-white',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        outline: 'border-2 border-[#FF4500] text-[#FF4500] bg-white hover:bg-[#FF4500] hover:text-white',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'bg-transparent text-primary hover:bg-accent/10',
        link: 'text-primary underline-offset-4 hover:underline',
        accent: 'bg-accent text-primary hover:bg-accent-dark',
      },
      size: {
        default: 'h-10 px-4 py-2 text-base',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-8 text-lg',
        nav: 'h-11 px-5 py-2.5 text-[17px]',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export { buttonVariants };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? 'span' : 'button';

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';