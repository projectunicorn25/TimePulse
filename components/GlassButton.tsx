'use client'
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent'
    
    const variants = {
      primary: 'bg-gradient-to-r from-brand-600 to-brand-700 text-white hover:from-brand-500 hover:to-brand-600 focus:ring-brand-500/50 shadow-lg hover:shadow-xl hover:shadow-brand-500/25',
      secondary: 'bg-[var(--glass-bg)] backdrop-blur-xl border border-[rgb(var(--border))] text-zinc-100 hover:bg-[rgb(var(--card))]/80 hover:border-[rgb(var(--border-light))] focus:ring-brand-500/50',
      ghost: 'text-zinc-300 hover:text-zinc-100 hover:bg-[var(--glass-bg)] backdrop-blur-xl focus:ring-brand-500/50',
      danger: 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 focus:ring-red-500/50 shadow-lg hover:shadow-xl hover:shadow-red-500/25'
    }
    
    const sizes = {
      sm: 'px-3 py-2 text-sm rounded-lg',
      md: 'px-4 py-3 text-sm rounded-lg',
      lg: 'px-6 py-4 text-base rounded-xl'
    }
    
    const glassEffect = variant === 'secondary' || variant === 'ghost' 
      ? 'shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]'
      : 'shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]'
    
    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          glassEffect,
          'hover:scale-105 active:scale-95',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)

GlassButton.displayName = 'GlassButton'

export default GlassButton
