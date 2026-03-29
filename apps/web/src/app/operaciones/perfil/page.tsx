import { LogoutButton } from '@/shared/components/LogoutButton'

export default function OperacionesPerfilPage() {
  return (
    <div className="flex flex-col items-center justify-start pt-10 text-center space-y-8 fade-in h-full">
      <div>
        <h1 className="text-xl font-extrabold text-[#0f172a] mb-2">Mi Perfil</h1>
        <p className="text-slate-500 text-sm max-w-[250px]">
          Configuraciones y cierre de sesión de tu cuenta.
        </p>
      </div>

      <div className="w-full bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <LogoutButton />
      </div>
    </div>
  )
}
