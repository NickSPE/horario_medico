"use client"
import LoadingSpinner from '@/components/LoadingSpinner'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Footer from './components/footer'
import Header from './components/header'

export default function HomePage() {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user && userProfile) {
      const dashboardPath = userProfile.role === 'doctor' ? '/dashboard/doctor' : '/dashboard/patient'
      router.push(dashboardPath)
    }
  }, [user, userProfile, loading, router])

  if (loading) return <LoadingSpinner />
  if (user) return <LoadingSpinner />

  return (
    <>
      <Header />

      {/* Hero (full-bleed, outside main to avoid main padding) */}
      <div
        className="hero relative flex flex-col items-center justify-center gap-8 p-6 text-center"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.18) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuBrk8pjj_0qoHMB-8CkF2NVNaYDYCe_UQlboQy_Lj9BVNP5RbCYZEgxLCmD_1HEQd3w9HsyIsMZNBPnvuoUUP_JFE0uGERnxOw4Pm4uo2HfL9vBWMxfPU_aLg1b0jlcUfiFYUNskdLV2INcDfoSdUllNCwHr1oIjR9nva5soto-Xd7TM1CGBEfwnCpiqHjYfZWTRzw_0itCrTZD9_ymj_Pw04jdP43vjc1tPJaDh7v_q3cNltiJCMlpogPDUDGLJPrddcPCgV1Iyedq")',
        }}
      >
        <div className="hero-inner">
          <h1 className="hero-title">Optimice la agenda de su consultorio</h1>
          <p className="hero-sub">
            HealthConnect ofrece una plataforma perfecta para gestionar citas médicas, conectando a pacientes con proveedores de atención médica de manera eficiente y efectiva.
          </p>

          <div className="hero-buttons">
            <Link href="/auth/register" className="btn btn-primary">
              Registrarse
            </Link>
            <Link href="/auth/login" className="btn btn-secondary">
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>

      <main className="px-10 py-12">
        <div className="@container">
          <div className="@[480px]:p-4">
            {/* Main content goes here (kept empty for now) */}
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
 
