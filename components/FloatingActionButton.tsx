'use client'
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface FloatingActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
}

const FloatingActionButton = forwardRef<HTMLButtonElement, FloatingActionButtonProps>(
  ({ className, children, position = 'bottom-right', ...props }, ref) => {
    const positions = {
      'bottom-right': 'bottom-6 right-6',
      'bottom-left': 'bottom-6 left-6',
      'top-right': 'top-6 right-6',
      'top-left': 'top-6 left-6'
    }
    
    return (
      <button
        className={cn(
          'fixed z-50 w-14 h-14 rounded-full',
          'bg-gradient-to-r from-brand-600 to-brand-700',
          'text-white shadow-2xl',
          'hover:from-brand-500 hover:to-brand-600',
          'hover:scale-110 active:scale-95',
          'transition-all duration-300',
          'backdrop-blur-xl',
          'shadow-[0_8px_32px_rgba(124,58,237,0.4)]',
          'hover:shadow-[0_12px_40px_rgba(124,58,237,0.6)]',
          'flex items-center justify-center',
          positions[position],
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

FloatingActionButton.displayName = 'FloatingActionButton'

export default FloatingActionButton
