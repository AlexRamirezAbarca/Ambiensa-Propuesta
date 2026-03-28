'use client'

import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface SpinnerProps {
  size?: number
  className?: string
  color?: string
}

export function Spinner({ size = 24, className = '', color = 'currentColor' }: SpinnerProps) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, ease: 'linear', duration: 1 }}
      className={`flex items-center justify-center ${className}`}
    >
      <Loader2 size={size} color={color} />
    </motion.div>
  )
}
