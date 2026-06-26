import React from 'react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("bg-white rounded-2xl border border-slate-200/60 shadow-sm", className)} {...props} />
  )
);
Card.displayName = "Card";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900",
        "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: "bg-slate-100 text-slate-900 hover:bg-slate-200",
      primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-500/20",
      secondary: "bg-slate-800 text-white hover:bg-slate-900 shadow-sm",
      danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100",
      ghost: "hover:bg-slate-100 text-slate-600 hover:text-slate-900",
      outline: "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
    };
    
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-slate-400/20 disabled:opacity-50 disabled:pointer-events-none",
          "h-11 px-4 py-2",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export const AnimatedPage = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2, ease: 'easeOut' }}
    className={cn("w-full", className)}
  >
    {children}
  </motion.div>
);
