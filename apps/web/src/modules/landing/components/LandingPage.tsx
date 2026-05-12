'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight, Shield, Clock, TrendingUp, CheckCircle2,
  ChevronRight, Menu, X, AlertTriangle, Lightbulb,
  Briefcase, BarChart3, Globe, Zap, ArrowUpRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const slides = [
    {
      url: "/slide_1.png",
      title: "Vivienda del Futuro en Guayaquil",
      subtitle: "Innovación habitacional con sello Ambiensa"
    },
    {
      url: "/slide_2.png",
      title: "Control Estratégico 2026",
      subtitle: "Decisiones basadas en datos, no en supuestos"
    },
    {
      url: "/slide_3.png",
      title: "Tecnología en el Corazón de la Obra",
      subtitle: "Empoderando al personal técnico en campo"
    }
  ]

  useEffect(() => {
    // 1. Detección inmediata por Hash (Para invitaciones/recuperaciones)
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
      router.push('/auth/actualizar-clave' + window.location.hash)
      return
    }

    const checkUser = async () => {
      const { data } = await supabase.auth.getSession()
      setIsLoggedIn(!!data.session)
    }
    checkUser()

    // Listener para redirección de recuperación de contraseña / invitación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        router.push('/auth/actualizar-clave')
      }
    })

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => {
      clearInterval(interval)
      subscription.unsubscribe()
    }
  }, [])

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <span className="font-bold text-xl">A</span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                Ambiensa<span className="text-blue-600">ERP</span>
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#problema" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest">Problema</a>
              <a href="#solucion" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest">Solución</a>
              <a href="#ventajas" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest">Ventajas</a>
              <a href="#oportunidades" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest">Oportunidades</a>

              <Link
                href={isLoggedIn ? "/operaciones" : "/login"}
                className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-sm font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95 flex items-center gap-2 uppercase tracking-wider"
              >
                {isLoggedIn ? "Ir al Dashboard" : "Iniciar Demo"}
                <ArrowRight size={18} />
              </Link>
            </div>

            <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero with Carousel */}
      <section className="relative h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0"
            >
              <img
                src={slides[currentSlide].url}
                alt="Ambiensa Slide"
                className="w-full h-full object-cover brightness-[0.95]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-black uppercase tracking-[0.2em] mb-8 shadow-xl">
              <Zap size={14} className="fill-current" />
              Horizonte 2026
            </div>
            <h1 className="text-6xl lg:text-8xl font-black text-slate-900 leading-[0.9] mb-8 tracking-tighter">
              Liderazgo en <br />
              <span className="text-blue-600">Guayaquil.</span>
            </h1>
            <p className="text-xl text-slate-700 leading-relaxed mb-10 font-medium">
              Transformamos la construcción en una ciencia de datos. Control total, transparencia absoluta y rentabilidad garantizada.
            </p>
            <div className="flex gap-4">
              <Link
                href="/login"
                className="bg-slate-900 text-white px-10 py-5 rounded-3xl text-lg font-black hover:bg-blue-600 transition-all shadow-2xl flex items-center gap-3 group"
              >
                Comenzar ahora
                <ArrowRight className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-12 right-12 z-20 flex gap-2">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 transition-all duration-500 rounded-full ${i === currentSlide ? 'w-12 bg-blue-600' : 'w-4 bg-slate-300'}`}
            />
          ))}
        </div>
      </section>

      {/* 1. Problemática */}
      <section id="problema" className="py-32 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="w-24 h-24 bg-rose-100 rounded-3xl flex items-center justify-center text-rose-600 mb-8">
                <AlertTriangle size={48} />
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-8 leading-tight tracking-tight">
                El alto costo de la <span className="text-rose-600 italic">opacidad operativa</span>
              </h2>
              <div className="space-y-8">
                {[
                  { t: "Retrasos Administrativos", d: "La burocracia en el reporte de campo genera cuellos de botella críticos." },
                  { t: "Falta de Evidencia Técnica", d: "Pérdidas económicas por falta de validación visual y geoposicionada." },
                  { t: "Datos Oscuros", d: "Decisiones basadas en reportes manuales propensos a errores humanos." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="w-1.5 h-12 bg-rose-200 rounded-full mt-2" />
                    <div>
                      <h4 className="font-black text-lg text-slate-800 mb-1 uppercase tracking-wider">{item.t}</h4>
                      <p className="text-slate-500 font-medium">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-100 relative">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600 rounded-full blur-3xl opacity-20" />
              <BarChart3 size={80} className="text-slate-200 mb-8" />
              <p className="text-2xl font-bold text-slate-800 leading-snug">
                "Lo que no se mide, no se controla. Lo que no se controla, se pierde."
              </p>
              <div className="mt-12 pt-12 border-t border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white font-bold">!</div>
                <span className="text-rose-600 font-black uppercase text-sm tracking-widest">Urgencia detectada</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. La Solución */}
      <section id="solucion" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">Ecosistema Digital Ambiensa</h2>
            <p className="text-xl text-slate-500 font-medium max-w-3xl mx-auto italic">Una respuesta integral diseñada específicamente para el mercado de Guayaquil.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { i: Globe, t: "Real-Time Tracking", d: "Monitoreo GPS exacto de cada jornada laboral." },
              { i: Shield, t: "Auditoría Visual", d: "Fotos obligatorias de inicio y fin con marca de agua." },
              { i: BarChart3, t: "Reportes Auto", d: "Generación instantánea de planillas de avance." },
              { i: Lightbulb, t: "IA Operativa", d: "Detección de anomalías en el rendimiento de rubros." }
            ].map((f, i) => (
              <div key={i} className="group p-8 rounded-3xl bg-slate-50 hover:bg-blue-600 transition-all duration-500">
                <f.i className="text-blue-600 group-hover:text-white mb-6 transition-colors" size={40} />
                <h3 className="font-black text-slate-900 group-hover:text-white mb-4 uppercase tracking-wider">{f.t}</h3>
                <p className="text-slate-500 group-hover:text-blue-100 font-medium text-sm leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Ventajas Estratégicas */}
      <section id="ventajas" className="py-32 bg-blue-600 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="relative aspect-square rounded-[4rem] overflow-hidden border-8 border-white/10 shadow-2xl">
              <img src="/slide_2.png" className="w-full h-full object-cover" alt="Gestión" />
            </div>
            <div>
              <h2 className="text-5xl font-black mb-12 leading-tight">Más que un ERP, <br /><span className="text-blue-200 italic">una ventaja competitiva.</span></h2>
              <div className="space-y-6">
                {[
                  "Escalabilidad multi-proyecto simultánea.",
                  "Diseño Mobile-First para uso rudo en campo.",
                  "Arquitectura de Alta Disponibilidad.",
                  "Integración fluida con procesos de nómina."
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <CheckCircle2 className="text-blue-300" size={28} />
                    <span className="text-xl font-bold">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Oportunidades: On-Demand */}
      <section id="oportunidades" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-[4rem] p-16 lg:p-24 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-600/20 skew-x-12" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 text-blue-400 font-black uppercase tracking-widest text-sm mb-8">
                <Briefcase size={18} /> Oportunidad de Negocio
              </div>
              <h2 className="text-4xl lg:text-6xl font-black text-white mb-8 max-w-4xl leading-tight">
                Innovación <span className="text-blue-500">On-Demand:</span> <br />
                Escalando hacia un SaaS Corporativo
              </h2>
              <p className="text-xl text-slate-400 mb-12 max-w-2xl leading-relaxed font-medium">
                Esta tecnología no es exclusiva. Hemos diseñado un núcleo comercializable para otros desarrolladores inmobiliarios en la región, permitiendo monetizar la eficiencia operativa como un servicio (SaaS).
              </p>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { t: "SaaS Model", d: "Licenciamiento por proyecto o volumen." },
                  { t: "Data Service", d: "Insights de mercado sobre rendimiento de rubros." },
                  { t: "Customization", d: "Adaptabilidad total a marcas blancas." }
                ].map((item, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md">
                    <h4 className="text-white font-black uppercase tracking-wider mb-2">{item.t}</h4>
                    <p className="text-slate-500 text-sm">{item.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Resultados y ROI */}
      <section className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-black text-slate-900 mb-20 tracking-tight">Resultados de Impacto Directo</h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { v: "25%", t: "Aceleración de Obra", c: "blue" },
              { v: "15%", t: "Ahorro en Desperdicios", c: "emerald" },
              { v: "100%", t: "Trazabilidad Digital", c: "indigo" }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className={`text-7xl font-black text-${stat.c}-600 mb-4 tracking-tighter`}>{stat.v}</div>
                <div className="text-slate-400 font-black uppercase tracking-widest text-sm">{stat.t}</div>
                <div className="w-12 h-1 bg-slate-200 rounded-full mt-6" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-black text-slate-900 mb-8 uppercase tracking-widest">¿Listo para el futuro de Ambiensa?</h3>
          <Link
            href="/login"
            className="inline-flex items-center gap-4 bg-blue-600 text-white px-16 py-6 rounded-full text-2xl font-black hover:bg-slate-900 transition-all shadow-2xl shadow-blue-200 group"
          >
            SOLICITAR ACCESO DEMO
            <ArrowUpRight size={32} className="group-hover:rotate-45 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <span className="font-bold">A</span>
              </div>
              <span className="text-xl font-bold text-slate-900">Ambiensa ERP</span>
            </div>
            <div className="flex gap-12 text-xs font-black text-slate-400 uppercase tracking-widest">
              <a href="#" className="hover:text-blue-600">Soporte 24/7</a>
              <a href="#" className="hover:text-blue-600">Documentación</a>
              <a href="#" className="hover:text-blue-600">Legal</a>
            </div>
            <p className="text-xs font-bold text-slate-400 italic">
              © 2026 Ambiensa. Desarrollado por Alex Ramirez Abarca, Ecuador.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
