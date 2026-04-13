/* eslint-disable react-refresh/only-export-components */
import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-full font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-white text-black hover:bg-gray-100',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        outline: 'border-2 border-[#FF4500] text-[#FF4500] bg-white hover:bg-[#FF4500] hover:text-white',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'bg-transparent text-primary hover:bg-accent/10',
        link: 'text-primary underline-offset-4 hover:underline',
        accent: 'bg-accent text-primary hover:bg-accent-dark',
        'red-gold': 'bg-gradient-to-r from-red-600 to-amber-500 text-white hover:from-red-700 hover:to-amber-600',
        'gold-red': 'bg-gradient-to-r from-amber-500 to-red-600 text-white hover:from-amber-600 hover:to-red-700',
        primary: 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600',
        'gradient-red-gold': 'bg-gradient-to-r from-red-600 to-amber-500 text-white hover:from-red-700 hover:to-amber-600',
        'gradient-purple-pink': 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600',
        'gradient-blue-cyan': 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-700 hover:to-cyan-600',
        'gradient-emerald-lime': 'bg-gradient-to-r from-emerald-600 to-lime-500 text-white hover:from-emerald-700 hover:to-lime-600',
        maroon: 'bg-[#800020] text-white hover:bg-[#600010]',
        'maroon-outline': 'border-2 border-[#800020] text-[#800020] bg-white hover:bg-[#800020] hover:text-white',
        gold: 'bg-amber-500 text-white hover:bg-amber-600',
        'gold-outline': 'border-2 border-amber-500 text-amber-500 bg-white hover:bg-amber-500 hover:text-white',
        'gradient-amber-rose': 'bg-gradient-to-r from-amber-500 to-rose-500 text-white hover:from-amber-600 hover:to-rose-600',
      },
      size: {
        default: 'h-10 px-4 py-2 text-base',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-8 text-lg',
        nav: 'h-12 px-6 py-3 text-xl',
        icon: 'h-9 w-9',
        pill: 'h-10 px-6 py-2 text-base rounded-full',
        xl: 'h-14 px-10 py-3 text-lg',
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
  ripple?: boolean;
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