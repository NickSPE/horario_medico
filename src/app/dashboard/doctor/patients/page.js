'use client'
import LoadingSpinner from '@/components/LoadingSpinner'
import Navigation from '@/components/Navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function DoctorPatientsPage() {
    const { user, userProfile, loading } = useAuth()
    const router = useRouter()
    const [patients, setPatients] = useState([])
    const [loadingData, setLoadingData] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedPatient, setSelectedPatient] = useState(null)

    const fetchPatients = useCallback(async () => {
        if (!user) return

        try {
            // Obtener todos los pacientes que tienen recetas del doctor
            const { data: prescriptions, error: prescError } = await supabase
                .from('prescriptions')
                .select(`
          patient_id,
          patient:profiles!prescriptions_patient_id_fkey(*)
        `)
                .eq('doctor_id', user.id)

            if (prescError) throw prescError

            // Extraer pacientes únicos
            const uniquePatients = []
            const patientIds = new Set()

            prescriptions?.forEach(prescription => {
                if (prescription.patient && !patientIds.has(prescription.patient_id)) {
                    patientIds.add(prescription.patient_id)
                    uniquePatients.push(prescription.patient)
                }
            })

            // Obtener estadísticas adicionales para cada paciente
            const patientsWithStats = await Promise.all(
                uniquePatients.map(async (patient) => {
                    const { data: patientPrescriptions } = await supabase
                        .from('prescriptions')
                        .select('*, medications(*)')
                        .eq('doctor_id', user.id)
                        .eq('patient_id', patient.id)

                    const activePrescriptions = patientPrescriptions?.filter(p => p.status === 'active').length || 0
                    const totalPrescriptions = patientPrescriptions?.length || 0
                    const totalMedications = patientPrescriptions?.reduce((acc, p) => acc + (p.medications?.length || 0), 0) || 0

                    return {
                        ...patient,
                        stats: {
                            activePrescriptions,
                            totalPrescriptions,
                            totalMedications
                        },
                        lastPrescription: patientPrescriptions?.[0]?.created_at
                    }
                })
            )

            setPatients(patientsWithStats)
        } catch (error) {
            console.error('Error fetching patients:', error)
            toast.error('Error al cargar los pacientes')
        } finally {
            setLoadingData(false)
        }
    }, [user])

    useEffect(() => {
        if (!loading) {
            if (!user || !userProfile || userProfile.role !== 'doctor') {
                router.push('/auth/login')
                return
            }
            fetchPatients()
        }
    }, [user, userProfile, loading, router, fetchPatients])

    const filteredPatients = patients.filter(patient =>
        patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const formatDate = (dateString) => {
        if (!dateString) return 'Nunca'
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const calculateAge = (birthDate) => {
        if (!birthDate) return 'N/A'
        const today = new Date()
        const birth = new Date(birthDate)
        let age = today.getFullYear() - birth.getFullYear()
        const monthDiff = today.getMonth() - birth.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--
        }
        return age
    }

    if (loading || !userProfile) {
        return <LoadingSpinner />
    }

    if (userProfile.role !== 'doctor') {
        router.push('/auth/login')
        return <LoadingSpinner />
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            <Navigation />

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Mis Pacientes</h1>
                    <p className="text-muted-light dark:text-muted-dark">
                        Gestiona tus pacientes y revisa su historial médico.
                    </p>
                </div>

                {/* Barra de búsqueda y acciones */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative flex-1 max-w-md">
                        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-light dark:text-muted-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Buscar pacientes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-border-light dark:border-border-dark bg-input-light dark:bg-input-dark rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                        />
                    </div>

                    <Link
                        href="/dashboard/doctor/prescriptions/create"
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                        + Nueva Receta
                    </Link>
                </div>

                {loadingData ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : filteredPatients.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="bg-card-light dark:bg-card-dark p-8 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
                            <svg className="w-16 h-16 text-muted-light dark:text-muted-dark mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <h3 className="text-lg font-medium mb-2">
                                {searchTerm ? 'No se encontraron pacientes' : 'No tienes pacientes aún'}
                            </h3>
                            <p className="text-muted-light dark:text-muted-dark mb-4">
                                {searchTerm
                                    ? 'Intenta con otro término de búsqueda'
                                    : 'Cuando crees tu primera receta, el paciente aparecerá aquí'
                                }
                            </p>
                            {!searchTerm && (
                                <Link
                                    href="/dashboard/doctor/prescriptions/create"
                                    className="inline-block px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
                                >
                                    Crear Primera Receta
                                </Link>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPatients.map((patient) => (
                            <div
                                key={patient.id}
                                className="bg-card-light dark:bg-card-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6 hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => setSelectedPatient(patient)}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg mb-1">{patient.full_name}</h3>
                                        <p className="text-sm text-muted-light dark:text-muted-dark">{patient.email}</p>
                                        {patient.phone && (
                                            <p className="text-sm text-muted-light dark:text-muted-dark">{patient.phone}</p>
                                        )}
                                    </div>
                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    {patient.date_of_birth && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-light dark:text-muted-dark">Edad:</span>
                                            <span>{calculateAge(patient.date_of_birth)} años</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-light dark:text-muted-dark">Recetas activas:</span>
                                        <span className="font-medium text-primary">{patient.stats.activePrescriptions}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-light dark:text-muted-dark">Total recetas:</span>
                                        <span>{patient.stats.totalPrescriptions}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-light dark:text-muted-dark">Última consulta:</span>
                                        <span>{formatDate(patient.lastPrescription)}</span>
                                    </div>
                                </div>

                                {patient.medical_conditions && patient.medical_conditions.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-sm text-muted-light dark:text-muted-dark mb-1">Condiciones:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {patient.medical_conditions.slice(0, 2).map((condition, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 rounded-full"
                                                >
                                                    {condition}
                                                </span>
                                            ))}
                                            {patient.medical_conditions.length > 2 && (
                                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 rounded-full">
                                                    +{patient.medical_conditions.length - 2}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <Link
                                        href={`/dashboard/doctor/prescriptions/create?patient=${patient.id}`}
                                        className="flex-1 px-3 py-2 text-sm bg-primary text-white rounded-lg hover:opacity-90 transition-opacity text-center"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Nueva Receta
                                    </Link>
                                    <button className="px-3 py-2 text-sm border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark rounded-lg hover:bg-muted-light/10 transition-colors">
                                        Historial
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal de Detalles del Paciente */}
                {selectedPatient && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-border-light dark:border-border-dark">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold">Información del Paciente</h2>
                                    <button
                                        onClick={() => setSelectedPatient(null)}
                                        className="p-2 hover:bg-muted-light/10 rounded-lg transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h3 className="font-semibold text-lg">{selectedPatient.full_name}</h3>
                                            <p className="text-muted-light dark:text-muted-dark">{selectedPatient.email}</p>
                                            {selectedPatient.phone && (
                                                <p className="text-muted-light dark:text-muted-dark">{selectedPatient.phone}</p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            {selectedPatient.date_of_birth && (
                                                <p className="text-sm">
                                                    <span className="text-muted-light dark:text-muted-dark">Edad:</span> {calculateAge(selectedPatient.date_of_birth)} años
                                                </p>
                                            )}
                                            <p className="text-sm">
                                                <span className="text-muted-light dark:text-muted-dark">Paciente desde:</span> {formatDate(selectedPatient.created_at)}
                                            </p>
                                        </div>
                                    </div>

                                    {selectedPatient.medical_conditions && selectedPatient.medical_conditions.length > 0 && (
                                        <div>
                                            <h4 className="font-medium mb-2">Condiciones Médicas</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedPatient.medical_conditions.map((condition, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-1 text-sm bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 rounded-full"
                                                    >
                                                        {condition}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-3 gap-4 p-4 bg-background-light dark:bg-background-dark rounded-lg">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-primary">{selectedPatient.stats.activePrescriptions}</p>
                                            <p className="text-sm text-muted-light dark:text-muted-dark">Recetas Activas</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold">{selectedPatient.stats.totalPrescriptions}</p>
                                            <p className="text-sm text-muted-light dark:text-muted-dark">Total Recetas</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold">{selectedPatient.stats.totalMedications}</p>
                                            <p className="text-sm text-muted-light dark:text-muted-dark">Medicamentos</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <Link
                                            href={`/dashboard/doctor/prescriptions/create?patient=${selectedPatient.id}`}
                                            className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
                                        >
                                            Nueva Receta
                                        </Link>
                                        <button className="px-4 py-2 border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark rounded-lg hover:bg-muted-light/10 transition-colors">
                                            Ver Historial
                                        </button>
                                        <button className="px-4 py-2 border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark rounded-lg hover:bg-muted-light/10 transition-colors">
                                            Videollamada
                                        </button>
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