'use client'

import { Modal } from './Modal'
import { Button } from './Button'
import { CheckCircle, XCircle, Info, LucideIcon } from 'lucide-react'

export type StatusType = 'success' | 'error' | 'info'

interface Props {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: StatusType
}

const config: Record<StatusType, { icon: LucideIcon, color: string, bg: string, border: string }> = {
  success: {
    icon: CheckCircle,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100'
  },
  error: {
    icon: XCircle,
    color: 'text-rose-500',
    bg: 'bg-rose-50',
    border: 'border-rose-100'
  },
  info: {
    icon: Info,
    color: 'text-indigo-500',
    bg: 'bg-indigo-50',
    border: 'border-indigo-100'
  }
}

export function StatusModal({ isOpen, onClose, title, message, type = 'info' }: Props) {
  const { icon: Icon, color, bg, border } = config[type]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="flex flex-col items-center text-center py-6 px-2 animate-in fade-in zoom-in duration-300">
        <div className={`w-24 h-24 ${bg} ${border} border-2 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-xl`}>
           <Icon className={`w-12 h-12 ${color}`} strokeWidth={2.5} />
        </div>
        
        <h2 className="text-2xl font-black text-[#0f172a] tracking-tight mb-3">
          {title}
        </h2>
        
        <p className="text-slate-400 text-sm font-bold leading-relaxed max-w-[280px]">
          {message}
        </p>

        <div className="w-full mt-12">
          <Button 
            onClick={onClose} 
            fullWidth 
            className={`h-14 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-xl ${
              type === 'success' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100' :
              type === 'error' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-100' :
              'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
            }`}
          >
            Entendido
          </Button>
        </div>
      </div>
    </Modal>
  )
}
