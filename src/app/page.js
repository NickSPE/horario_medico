"use client"
import LoadingSpinner from '@/components/LoadingSpinner'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Footer from './components/footer'
import Header from './components/header'
import Link from 'next/link'

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
    <div className='flex flex-col min-h-screen'>
      {/* Header */}
      <Header />

      {/* Full-bleed hero with background image and CTA buttons */}
      <div
        className="hero"
        style={{ backgroundImage: "url('https://cdn.lecturio.com/assets/Featured-image-Student-Blog-Hospital-Team.jpg')" }}
        aria-label="Hero"
      >
        <div className="hero-inner">
          <h1 className="hero-title">
            Control seguro de tratamientos médicos
          </h1>
          <p className="hero-sub">
            Gestiona medicamentos, recetas y consultas médicas en una plataforma segura y fácil de usar.
          </p>
          <div className="hero-buttons">
            <Link href="/auth/register" className="btn btn-primary">Crear cuenta</Link>
            <Link href="/auth/login" className="btn btn-secondary">Iniciar sesión</Link>
          </div>
        </div>
      </div>

      {/* Optional minimal main (empty) */}
      <main className="flex-grow"></main>

      <Footer />
    </div>
  )
}
 
