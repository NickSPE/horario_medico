'use client'
import LoadingSpinner from '@/components/LoadingSpinner'
import Navigation from '@/components/Navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function PatientDashboard() {
    const { user, userProfile, loading } = useAuth()
    const router = useRouter()
    const [prescriptions, setPrescriptions] = useState([])
    const [notifications, setNotifications] = useState([])
    const [loadingData, setLoadingData] = useState(true)
    const [stats, setStats] = useState({
        activePrescriptions: 0,
        totalMedications: 0,
        todayDoses: 0
    })

    const fetchPatientData = useCallback(async () => {
        if (!user) return

        try {
            // Obtener recetas del paciente
            const { data: prescriptionsData, error: prescError } = await supabase
                .from('prescriptions')
                .select(`
          *,
          doctor:profiles!prescriptions_doctor_id_fkey(full_name, email)
        `)
                .eq('patient_id', user.id)
                .order('created_at', { ascending: false })

            if (prescError) throw prescError

            setPrescriptions(prescriptionsData || [])

            // Calcular estadísticas
            const activePrescriptions = prescriptionsData?.filter(p => p.status === 'active').length || 0
            const totalMedications = prescriptionsData?.reduce((acc, p) =>
                acc + (p.medications?.length || 0), 0) || 0

            setStats({
                activePrescriptions,
                totalMedications,
                todayDoses: 0 // Por ahora, implementar lógica de dosis más adelante
            })

            // Generar notificaciones de ejemplo
            const sampleNotifications = [
                {
                    id: 1,
                    type: 'medication',
                    title: 'Recordatorio de medicamento',
                    message: 'Es hora de tomar tu medicamento matutino',
                    time: '09:00 AM',
                    read: false
                },
                {
                    id: 2,
                    type: 'appointment',
                    title: 'Consulta programada',
                    message: 'Tienes una cita con el Dr. García mañana a las 3:00 PM',
                    time: 'Mañana',
                    read: false
                }
            ]
            setNotifications(sampleNotifications)

        } catch (error) {
            console.error('Error fetching patient data:', error)
            toast.error('Error al cargar los datos')
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
            if (userProfile && userProfile.role !== 'patient') {
                router.push('/dashboard/doctor')
                return
            }
            if (userProfile && user) {
                fetchPatientData()
            }
        }
    }, [user, userProfile, loading, router, fetchPatientData])

    if (loading || !userProfile) {
        return <LoadingSpinner />
    }

    if (userProfile.role !== 'patient') {
        return <LoadingSpinner />
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            <Navigation />

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">
                        Bienvenido, {userProfile.full_name}
                    </h1>
                    <p className="text-muted-light dark:text-muted-dark">
                        Controla tu tratamiento médico y mantente al día con tus medicamentos.
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
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-muted-light dark:text-muted-dark">
                                            Recetas Activas
                                        </p>
                                        <p className="text-2xl font-bold">{stats.activePrescriptions}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
                                <div className="flex items-center">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-muted-light dark:text-muted-dark">
                                            Medicamentos
                                        </p>
                                        <p className="text-2xl font-bold">{stats.totalMedications}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
                                <div className="flex items-center">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-muted-light dark:text-muted-dark">
                                            Dosis Hoy
                                        </p>
                                        <p className="text-2xl font-bold">{stats.todayDoses}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notificaciones */}
                        <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark mb-8">
                            <div className="p-6 border-b border-border-light dark:border-border-dark">
                                <h2 className="text-xl font-semibold flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5z" />
                                    </svg>
                                    Notificaciones
                                </h2>
                            </div>
                            <div className="p-6">
                                {notifications.length === 0 ? (
                                    <p className="text-center text-muted-light dark:text-muted-dark py-8">
                                        No tienes notificaciones pendientes.
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className={`p-4 rounded-lg border ${notification.read
                                                        ? 'border-border-light dark:border-border-dark'
                                                        : 'border-primary bg-primary/5'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium">{notification.title}</h4>
                                                        <p className="text-sm text-muted-light dark:text-muted-dark mt-1">
                                                            {notification.message}
                                                        </p>
                                                    </div>
                                                    <span className="text-xs text-muted-light dark:text-muted-dark">
                                                        {notification.time}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recetas Recientes */}
                        <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark">
                            <div className="p-6 border-b border-border-light dark:border-border-dark">
                                <h2 className="text-xl font-semibold">Mis Recetas</h2>
                            </div>
                            <div className="p-6">
                                {prescriptions.length === 0 ? (
                                    <div className="text-center py-8">
                                        <svg className="w-12 h-12 text-muted-light dark:text-muted-dark mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="text-muted-light dark:text-muted-dark">
                                            No tienes recetas asignadas aún.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {prescriptions.slice(0, 3).map((prescription) => (
                                            <div key={prescription.id} className="flex items-center justify-between p-4 border border-border-light dark:border-border-dark rounded-lg">
                                                <div>
                                                    <h4 className="font-medium">{prescription.diagnosis}</h4>
                                                    <p className="text-sm text-muted-light dark:text-muted-dark">
                                                        Dr. {prescription.doctor?.full_name || 'Doctor'}
                                                    </p>
                                                    <p className="text-xs text-muted-light dark:text-muted-dark">
                                                        {new Date(prescription.created_at).toLocaleDateString('es-ES')}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${prescription.status === 'active'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {prescription.status === 'active' ? 'Activa' : 'Completada'}
                                                    </span>
                                                    <p className="text-xs text-muted-light dark:text-muted-dark mt-1">
                                                        {prescription.medications?.length || 0} medicamentos
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="text-center pt-4">
                                            <Link
                                                href="/dashboard/patient/prescriptions"
                                                className="text-primary hover:text-primary/80 text-sm font-medium"
                                            >
                                                Ver todas las recetas →
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Acciones Rápidas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            <button className="bg-primary text-white p-6 rounded-xl shadow-sm hover:opacity-90 transition-opacity">
                                <div className="flex items-center">
                                    <svg className="w-8 h-8 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    <div>
                                        <h3 className="text-lg font-semibold">Videollamada con Doctor</h3>
                                        <p className="text-primary-100">Consulta médica virtual</p>
                                    </div>
                                </div>
                            </button>

                            <Link
                                href="/dashboard/patient/prescriptions"
                                className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-6 rounded-xl shadow-sm hover:bg-primary/5 transition-colors"
                            >
                                <div className="flex items-center">
                                    <svg className="w-8 h-8 mr-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <div>
                                        <h3 className="text-lg font-semibold">Ver Recetas</h3>
                                        <p className="text-muted-light dark:text-muted-dark">Revisa tus medicamentos</p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </>
                )}
            </main>
        </div>
    )
}
