'use client'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Footer from './components/footer'

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
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="w-full bg-card-light dark:bg-card-dark shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <svg
                className="h-8 w-8 text-primary"
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_6_535)">
                  <path
                    clipRule="evenodd"
                    d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z"
                    fill="currentColor"
                    fillRule="evenodd"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_6_535">
                    <rect fill="white" height="48" width="48" />
                  </clipPath>
                </defs>
              </svg>
              <h1 className="text-xl font-bold">Horario Medico</h1>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a className="text-sm font-medium text-muted-light dark:text-muted-dark hover:text-primary dark:hover:text-primary transition-colors" href="#features">
                Servicios
              </a>
              <a className="text-sm font-medium text-muted-light dark:text-muted-dark hover:text-primary dark:hover:text-primary transition-colors" href="#about">
                Acerca de
              </a>
            </nav>
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="px-4 py-2 text-sm font-medium rounded-lg text-primary bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:opacity-90 transition-opacity"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Control seguro de <span className="text-primary">tratamientos médicos</span>
            </h1>
            <p className="text-xl text-muted-light dark:text-muted-dark mb-8 max-w-2xl mx-auto">
              Gestiona medicamentos, recetas y consultas médicas en una plataforma segura y fácil de usar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className="px-8 py-3 text-lg font-medium rounded-lg bg-primary text-white hover:opacity-90 transition-opacity"
              >
                Comenzar Ahora
              </Link>
              <Link
                href="/auth/login"
                className="px-8 py-3 text-lg font-medium rounded-lg text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-card-light dark:bg-card-dark">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Características principales</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Recetas Digitales</h3>
                <p className="text-muted-light dark:text-muted-dark">
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
            <p className="text-lg text-muted-light dark:text-muted-dark max-w-3xl mx-auto">
              MedControl es una plataforma diseñada para facilitar la gestión de medicamentos y
              mejorar la comunicación entre doctores y pacientes. Nuestro objetivo es hacer que
              el seguimiento de tratamientos médicos sea más seguro, eficiente y accesible para todos.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />


    </div>
  )
}


