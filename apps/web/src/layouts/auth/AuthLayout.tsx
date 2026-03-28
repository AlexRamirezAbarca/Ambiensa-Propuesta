'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 overflow-hidden text-[length:var(--foreground)]">
      
      {/* --- FONDO ANIMADO Y PARTICULAS MODERNAS --- */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-950 to-slate-950" />
      
      {/* Orbitas / Esferas flotantes abstractas */}
      <motion.div 
        animate={{ y: [0, -20, 0], opacity: [0.3, 0.5, 0.3] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        className="absolute top-[10%] left-[20%] w-[35rem] h-[35rem] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"
      />
      
      <motion.div 
        animate={{ y: [0, 30, 0], x: [0, 20, 0], opacity: [0.2, 0.4, 0.2] }}
        transition={{ repeat: Infinity, duration: 10, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[-10%] right-[10%] w-[40rem] h-[40rem] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"
      />

      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
      {/* -------------------------------------- */}

      {/* PANEL DE CRISTAL ESMERILADO (Glassmorphism) */}
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md mx-4 sm:mx-0 
                   bg-white/[0.03] backdrop-blur-xl border border-white/10 
                   rounded-[2rem] p-6 sm:p-10 shadow-2xl shadow-blue-900/20"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-[2rem] pointer-events-none" />
        
        {/* Cabecera / Marca dentro del panel */}
        <div className="relative mb-10 flex flex-col items-center">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-5">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Ambiensa ERP</h1>
          <p className="text-slate-400 mt-2 text-sm text-center">Acceso seguro nivel empresarial</p>
        </div>

        {/* CONTENEDOR INTERCAMBIABLE (Formularios) */}
        <div className="relative z-20 theme-dark">
          {children}
        </div>
      </motion.div>

    </div>
  )
}
