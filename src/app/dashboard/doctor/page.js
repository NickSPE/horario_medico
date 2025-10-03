'use client'
import LoadingSpinner from '@/components/LoadingSpinner'
import Navigation from '@/components/Navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function DoctorDashboard() {
    const { user, userProfile, loading } = useAuth()
    const router = useRouter()
    const [stats, setStats] = useState({
        totalPatients: 0,
        totalPrescriptions: 0,
        todayPrescriptions: 0
    })
    const [recentPrescriptions, setRecentPrescriptions] = useState([])
    const [loadingData, setLoadingData] = useState(true)

    const fetchDashboardData = useCallback(async () => {
        if (!user) return

        try {
            // Obtener estadísticas del doctor
            const { data: prescriptions, error: prescError } = await supabase
                .from('prescriptions')
                .select(`
          *,
          patient:profiles!prescriptions_patient_id_fkey(full_name, email)
        `)
                .eq('doctor_id', user.id)
                .order('created_at', { ascending: false })

            if (prescError) throw prescError

            const today = new Date().toISOString().split('T')[0]
            const todayPrescriptions = prescriptions.filter(p =>
                p.created_at.split('T')[0] === today
            ).length

            const uniquePatients = new Set(prescriptions.map(p => p.patient_id)).size

            setStats({
                totalPatients: uniquePatients,
                totalPrescriptions: prescriptions.length,
                todayPrescriptions
            })

            setRecentPrescriptions(prescriptions.slice(0, 5))
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
            toast.error('Error al cargar los datos del dashboard')
        } finally {
            setLoadingData(false)
        }
    }, [user])

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/auth/login')
                return
            }
            if (userProfile && userProfile.role !== 'doctor') {
                router.push('/dashboard/patient')
                return
            }
            if (userProfile && user) {
                fetchDashboardData()
            }
        }
    }, [user, userProfile, loading, router, fetchDashboardData])

    if (loading || !userProfile) {
        return <LoadingSpinner />
    }

    if (userProfile.role !== 'doctor') {
        return <LoadingSpinner />
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            <Navigation />

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">
                        Bienvenido, Dr. {userProfile.full_name}
                    </h1>
                    <p className="text-muted-light dark:text-muted-dark">
                        Gestiona tus pacientes y recetas desde tu panel de control.
                    </p>
                </div>

                {loadingData ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <>
                        {/* Estadísticas */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
                                <div className="flex items-center">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-muted-light dark:text-muted-dark">
                                            Total Pacientes
                                        </p>
                                        <p className="text-2xl font-bold">{stats.totalPatients}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
                                <div className="flex items-center">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-muted-light dark:text-muted-dark">
                                            Total Recetas
                                        </p>
                                        <p className="text-2xl font-bold">{stats.totalPrescriptions}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
                                <div className="flex items-center">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-muted-light dark:text-muted-dark">
                                            Recetas Hoy
                                        </p>
                                        <p className="text-2xl font-bold">{stats.todayPrescriptions}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Acciones Rápidas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <Link
                                href="/dashboard/doctor/prescriptions/create"
                                className="bg-primary text-white p-6 rounded-xl shadow-sm hover:opacity-90 transition-opacity"
                            >
                                <div className="flex items-center">
                                    <svg className="w-8 h-8 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    <div>
                                        <h3 className="text-lg font-semibold">Crear Nueva Receta</h3>
                                        <p className="text-primary-100">Prescribe medicamentos a tus pacientes</p>
                                    </div>
                                </div>
                            </Link>

                            <Link
                                href="/dashboard/doctor/patients"
                                className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-6 rounded-xl shadow-sm hover:bg-primary/5 transition-colors"
                            >
                                <div className="flex items-center">
                                    <svg className="w-8 h-8 mr-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                    </svg>
                                    <div>
                                        <h3 className="text-lg font-semibold">Ver Pacientes</h3>
                                        <p className="text-muted-light dark:text-muted-dark">Gestiona tu lista de pacientes</p>
                                    </div>
                                </div>
                            </Link>
                        </div>

                        {/* Recetas Recientes */}
                        <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark">
                            <div className="p-6 border-b border-border-light dark:border-border-dark">
                                <h2 className="text-xl font-semibold">Recetas Recientes</h2>
                            </div>
                            <div className="p-6">
                                {recentPrescriptions.length === 0 ? (
                                    <div className="text-center py-8">
                                        <svg className="w-12 h-12 text-muted-light dark:text-muted-dark mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="text-muted-light dark:text-muted-dark">
                                            No has creado ninguna receta aún.
                                        </p>
                                        <Link
                                            href="/dashboard/doctor/prescriptions/create"
                                            className="inline-block mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
                                        >
                                            Crear Primera Receta
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {recentPrescriptions.map((prescription) => (
                                            <div key={prescription.id} className="flex items-center justify-between p-4 border border-border-light dark:border-border-dark rounded-lg">
                                                <div>
                                                    <h4 className="font-medium">
                                                        {prescription.patient?.full_name || 'Paciente'}
                                                    </h4>
                                                    <p className="text-sm text-muted-light dark:text-muted-dark">
                                                        {prescription.diagnosis}
                                                    </p>
                                                    <p className="text-xs text-muted-light dark:text-muted-dark">
                                                        {new Date(prescription.created_at).toLocaleDateString('es-ES')}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                                                        {prescription.medications?.length || 0} medicamentos
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="text-center pt-4">
                                            <Link
                                                href="/dashboard/doctor/prescriptions"
                                                className="text-primary hover:text-primary/80 text-sm font-medium"
                                            >
                                                Ver todas las recetas →
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    )
}