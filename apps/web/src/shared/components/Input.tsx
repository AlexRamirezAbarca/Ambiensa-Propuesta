'use client'

import { type InputHTMLAttributes, forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  fullWidth?: boolean
  variant?: 'dark' | 'light'
}

const themes = {
  dark: {
    label: 'text-slate-300',
    input: 'bg-slate-900/50 border-slate-700/50 hover:border-slate-500 text-white placeholder:text-slate-500 backdrop-blur-sm',
    eye: 'text-slate-400 hover:text-blue-400',
  },
  light: {
    label: 'text-slate-700',
    input: 'bg-white border-slate-200 hover:border-blue-400 text-slate-800 placeholder:text-slate-400',
    eye: 'text-slate-400 hover:text-blue-600',
  },
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', fullWidth = true, type = 'text', variant = 'dark', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'
    const t = themes[variant]

    return (
      <div className={`relative flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''} mb-2`}>
        {label && (
          <label className={`text-sm font-semibold ml-1 ${t.label}`}>
            {label}
          </label>
        )}
        <div className="relative w-full">
          <input
            ref={ref}
            type={isPassword ? (showPassword ? 'text' : 'password') : type}
            className={`
              w-full px-4 py-3 border rounded-xl text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
              transition-all
              ${t.input}
              ${isPassword ? 'pr-11' : ''}
              ${error ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500' : ''}
              ${className}
            `}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors focus:outline-none p-1 ${t.eye}`}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
        {error && (
          <span className="text-[11px] font-medium text-red-500 ml-1">
            {error}
          </span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
