'use client'
import LoadingSpinner from '@/components/LoadingSpinner'
import Navigation from '@/components/Navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function PatientPrescriptionsPage() {
    const { user, userProfile, loading } = useAuth()
    const router = useRouter()
    const [prescriptions, setPrescriptions] = useState([])
    const [loadingData, setLoadingData] = useState(true)
    const [selectedPrescription, setSelectedPrescription] = useState(null)

    const fetchPrescriptions = useCallback(async () => {
        if (!user) return

        try {
            const { data, error } = await supabase
                .from('prescriptions')
                .select(`
          *,
          doctor:profiles!prescriptions_doctor_id_fkey(full_name, email, specialty),
          medications(*)
        `)
                .eq('patient_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setPrescriptions(data || [])
        } catch (error) {
            console.error('Error fetching prescriptions:', error)
            toast.error('Error al cargar las recetas')
        } finally {
            setLoadingData(false)
        }
    }, [user])

    useEffect(() => {
        if (!loading) {
            if (!user || !userProfile || userProfile.role !== 'patient') {
                router.push('/auth/login')
                return
            }
            fetchPrescriptions()
        }
    }, [user, userProfile, loading, router, fetchPrescriptions])

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            case 'completed':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
            case 'cancelled':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
        }
    }

    const getStatusText = (status) => {
        switch (status) {
            case 'active':
                return 'Activa'
            case 'completed':
                return 'Completada'
            case 'cancelled':
                return 'Cancelada'
            default:
                return status
        }
    }

    if (loading || !userProfile) {
        return <LoadingSpinner />
    }

    if (userProfile.role !== 'patient') {
        router.push('/auth/login')
        return <LoadingSpinner />
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            <Navigation />

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Mis Recetas Médicas</h1>
                    <p className="text-muted-light dark:text-muted-dark">
                        Revisa tus recetas y medicamentos prescritos por tus doctores.
                    </p>
                </div>

                {loadingData ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : prescriptions.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="bg-card-light dark:bg-card-dark p-8 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
                            <svg className="w-16 h-16 text-muted-light dark:text-muted-dark mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="text-lg font-medium mb-2">No tienes recetas</h3>
                            <p className="text-muted-light dark:text-muted-dark mb-4">
                                Aún no tienes ninguna receta médica asignada.
                            </p>
                            <button
                                onClick={() => router.push('/dashboard/patient')}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
                            >
                                Volver al Dashboard
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {prescriptions.map((prescription) => (
                            <div
                                key={prescription.id}
                                className="bg-card-light dark:bg-card-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold mb-2">{prescription.diagnosis}</h3>
                                            <div className="flex items-center gap-4 text-sm text-muted-light dark:text-muted-dark">
                                                <span>
                                                    Dr. {prescription.doctor?.full_name || 'Doctor'}
                                                </span>
                                                {prescription.doctor?.specialty && (
                                                    <span>• {prescription.doctor.specialty}</span>
                                                )}
                                                <span>• {formatDate(prescription.created_at)}</span>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(prescription.status)}`}>
                                            {getStatusText(prescription.status)}
                                        </span>
                                    </div>

                                    {prescription.notes && (
                                        <div className="mb-4 p-3 bg-background-light dark:bg-background-dark rounded-lg">
                                            <p className="text-sm">
                                                <span className="font-medium">Notas del doctor:</span> {prescription.notes}
                                            </p>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <h4 className="font-medium text-foreground-light dark:text-foreground-dark">
                                            Medicamentos ({prescription.medications?.length || 0})
                                        </h4>

                                        {prescription.medications?.length === 0 ? (
                                            <p className="text-muted-light dark:text-muted-dark text-sm">
                                                No hay medicamentos registrados en esta receta.
                                            </p>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {prescription.medications?.map((medication) => (
                                                    <div
                                                        key={medication.id}
                                                        className="p-4 border border-border-light dark:border-border-dark rounded-lg"
                                                    >
                                                        <div className="flex items-start justify-between mb-2">
                                                            <h5 className="font-medium text-primary">{medication.name}</h5>
                                                            <span className="text-sm font-medium text-muted-light dark:text-muted-dark">
                                                                {medication.dosage}
                                                            </span>
                                                        </div>

                                                        <div className="space-y-1 text-sm text-muted-light dark:text-muted-dark">
                                                            <p><span className="font-medium">Frecuencia:</span> {medication.frequency}</p>
                                                            <p><span className="font-medium">Duración:</span> {medication.duration}</p>
                                                            {medication.instructions && (
                                                                <p><span className="font-medium">Instrucciones:</span> {medication.instructions}</p>
                                                            )}
                                                            {medication.start_date && (
                                                                <p><span className="font-medium">Inicio:</span> {formatDate(medication.start_date)}</p>
                                                            )}
                                                        </div>

                                                        <div className="mt-3 flex gap-2">
                                                            <button className="px-3 py-1 text-xs bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors">
                                                                Marcar como tomado
                                                            </button>
                                                            <button className="px-3 py-1 text-xs bg-muted-light/10 text-muted-light dark:text-muted-dark rounded-full hover:bg-muted-light/20 transition-colors">
                                                                Recordar más tarde
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-6 flex gap-3">
                                        <button
                                            onClick={() => setSelectedPrescription(prescription)}
                                            className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
                                        >
                                            Ver Detalles
                                        </button>

                                        <button className="px-4 py-2 text-sm border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark rounded-lg hover:bg-muted-light/10 transition-colors">
                                            Contactar Doctor
                                        </button>

                                        <button className="px-4 py-2 text-sm border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark rounded-lg hover:bg-muted-light/10 transition-colors">
                                            Descargar PDF
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal de Detalles */}
                {selectedPrescription && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-border-light dark:border-border-dark">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold">Detalles de la Receta</h2>
                                    <button
                                        onClick={() => setSelectedPrescription(null)}
                                        className="p-2 hover:bg-muted-light/10 rounded-lg transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-lg mb-2">{selectedPrescription.diagnosis}</h3>
                                        <p className="text-muted-light dark:text-muted-dark">
                                            Prescrito por Dr. {selectedPrescription.doctor?.full_name} el {formatDate(selectedPrescription.created_at)}
                                        </p>
                                    </div>

                                    {selectedPrescription.notes && (
                                        <div className="p-4 bg-background-light dark:bg-background-dark rounded-lg">
                                            <h4 className="font-medium mb-2">Notas del Doctor</h4>
                                            <p className="text-sm">{selectedPrescription.notes}</p>
                                        </div>
                                    )}

                                    <div>
                                        <h4 className="font-medium mb-3">Medicamentos Prescritos</h4>
                                        <div className="space-y-3">
                                            {selectedPrescription.medications?.map((medication) => (
                                                <div key={medication.id} className="p-4 border border-border-light dark:border-border-dark rounded-lg">
                                                    <h5 className="font-medium text-primary mb-2">{medication.name} - {medication.dosage}</h5>
                                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                                        <div>
                                                            <span className="font-medium">Frecuencia:</span> {medication.frequency}
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Duración:</span> {medication.duration}
                                                        </div>
                                                    </div>
                                                    {medication.instructions && (
                                                        <div className="mt-2 text-sm">
                                                            <span className="font-medium">Instrucciones:</span> {medication.instructions}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}