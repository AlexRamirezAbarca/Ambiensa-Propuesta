'use client'

import { type ButtonHTMLAttributes } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { Spinner } from './Spinner'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost'
  isLoading?: boolean
  fullWidth?: boolean
}

export function Button({
  children,
  variant = 'primary',
  isLoading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'relative flex items-center justify-center rounded-xl font-medium focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden'
  
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50',
    outline: 'border border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700/80 hover:text-white',
    ghost: 'text-slate-400 hover:text-white hover:bg-white/5'
  }

  const sizes = 'px-4 py-3 text-sm'
  const widthClass = fullWidth ? 'w-full' : ''

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes} ${widthClass} ${className}`}
      disabled={disabled || isLoading}
      {...(props as any)}
    >
      {/* Soft shine effect on hover for primary button */}
      {variant === 'primary' && !disabled && !isLoading && (
        <span className="absolute inset-0 block w-full h-full pointer-events-none transform translate-x-[-100%] group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      )}

      {isLoading ? (
        <span className="flex items-center gap-2">
          <Spinner size={18} color="white" />
          <span className="opacity-0">{children}</span> {/* Placeholder */}
          <span className="absolute inset-0 flex items-center justify-center">Verificando...</span>
        </span>
      ) : (
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      )}
    </motion.button>
  )
}
