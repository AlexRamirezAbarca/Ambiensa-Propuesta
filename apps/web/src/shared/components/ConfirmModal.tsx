'use client'

import { Modal } from './Modal'
import { Button } from './Button'
import { AlertCircle, LucideIcon } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

const config = {
  danger: {
    icon: AlertCircle,
    color: 'text-rose-500',
    bg: 'bg-rose-50',
    border: 'border-rose-100',
    btn: 'bg-rose-600 hover:bg-rose-700 shadow-rose-100'
  },
  warning: {
    icon: AlertCircle,
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    btn: 'bg-amber-600 hover:bg-amber-700 shadow-amber-100'
  },
  info: {
    icon: AlertCircle,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    btn: 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
  }
}

export function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirmar', 
  cancelText = 'Cancelar',
  type = 'info'
}: Props) {
  const { icon: Icon, color, bg, border, btn } = config[type]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="flex flex-col items-center text-center py-6 px-2">
        <div className={`w-20 h-20 ${bg} ${border} border-2 rounded-[2rem] flex items-center justify-center mb-6 shadow-lg`}>
           <Icon className={`w-10 h-10 ${color}`} strokeWidth={2.5} />
        </div>
        
        <h2 className="text-2xl font-black text-[#0f172a] tracking-tight mb-3">
          {title}
        </h2>
        
        <p className="text-slate-400 text-sm font-bold leading-relaxed max-w-[300px]">
          {message}
        </p>

        <div className="grid grid-cols-2 gap-4 w-full mt-10">
          <button 
            onClick={onClose}
            className="h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all border border-slate-100"
          >
            {cancelText}
          </button>
          <Button 
            onClick={() => {
              onConfirm()
              onClose()
            }} 
            className={`h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white shadow-xl ${btn}`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
