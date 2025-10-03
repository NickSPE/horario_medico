'use client'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Footer from './components/footer'
import Header from './components/header'

export default function HomePage() {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user && userProfile) {
      // Redirigir al dashboard según el rol
      const dashboardPath = userProfile.role === 'doctor' ? '/dashboard/doctor' : '/dashboard/patient'
      router.push(dashboardPath)
    }
  }, [user, userProfile, loading, router])

  if (loading) {
    return <LoadingSpinner />
  }

  if (user) {
    return <LoadingSpinner />
  }

  return (
    <div className='flex flex-col min-h-screen'>

      {/* Header */}
      <Header />

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Control seguro de <span style={{ color: 'var(--color-primary)' }}>tratamientos médicos</span>
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
              Gestiona medicamentos, recetas y consultas médicas en una plataforma segura y fácil de usar.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-10" style={{ backgroundColor: 'var(--color-surface-secondary)' }}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Características principales</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                  <svg className="w-8 h-8" style={{ color: 'var(--color-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Recetas Digitales</h3>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                  Los doctores pueden crear y gestionar recetas médicas de forma digital y segura.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Recordatorios</h3>
                <p className="text-muted-light dark:text-muted-dark">
                  Notificaciones automáticas para que los pacientes no olviden tomar sus medicamentos.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Videollamadas</h3>
                <p className="text-muted-light dark:text-muted-dark">
                  Consultas médicas virtuales entre doctores y pacientes desde la plataforma.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-6">Acerca de MedControl</h2>
            <p className="text-lg max-w-3xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
              MedControl es una plataforma diseñada para facilitar la gestión de medicamentos y
              mejorar la comunicación entre doctores y pacientes. Nuestro objetivo es hacer que
              el seguimiento de tratamientos médicos sea más seguro, eficiente y accesible para todos.
            </p>
          </div>
        </section>
      </main>
      <Footer />

    </div>
  )
}


