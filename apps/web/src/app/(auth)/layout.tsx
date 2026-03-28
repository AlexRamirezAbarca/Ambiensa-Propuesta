import { ReactNode } from 'react'
import { AuthLayout } from '@/layouts/auth/AuthLayout'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Acceso - ERP Ambiensa',
  description: 'Portal de administración',
}

export default function AppAuthLayout({ children }: { children: ReactNode }) {
  return <AuthLayout>{children}</AuthLayout>
}
