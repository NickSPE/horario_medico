'use client'
import LoadingSpinner from '@/components/LoadingSpinner'
import Navigation from '@/components/Navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function CreatePrescriptionPage() {
    const { user, userProfile, loading } = useAuth()
    const router = useRouter()
    const [patients, setPatients] = useState([])
    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        patient_id: '',
        diagnosis: '',
        notes: '',
        medications: [
            {
                name: '',
                dosage: '',
                frequency: '',
                duration: '',
                instructions: ''
            }
        ]
    })

    useEffect(() => {
        if (!loading) {
            if (!user || !userProfile || userProfile.role !== 'doctor') {
                router.push('/auth/login')
                return
            }
            fetchPatients()
        }
    }, [user, userProfile, loading, router])

    const fetchPatients = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, email')
                .eq('role', 'patient')
                .order('full_name')

            if (error) throw error
            setPatients(data || [])
        } catch (error) {
            console.error('Error fetching patients:', error)
            toast.error('Error al cargar la lista de pacientes')
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleMedicationChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            medications: prev.medications.map((med, i) =>
                i === index ? { ...med, [field]: value } : med
            )
        }))
    }

    const addMedication = () => {
        setFormData(prev => ({
            ...prev,
            medications: [
                ...prev.medications,
                {
                    name: '',
                    dosage: '',
                    frequency: '',
                    duration: '',
                    instructions: ''
                }
            ]
        }))
    }

    const removeMedication = (index) => {
        if (formData.medications.length > 1) {
            setFormData(prev => ({
                ...prev,
                medications: prev.medications.filter((_, i) => i !== index)
            }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            // Validaciones
            if (!formData.patient_id || !formData.diagnosis) {
                toast.error('Por favor completa los campos obligatorios')
                return
            }

            const invalidMedications = formData.medications.some(med =>
                !med.name || !med.dosage || !med.frequency || !med.duration
            )

            if (invalidMedications) {
                toast.error('Por favor completa todos los campos de medicamentos')
                return
            }

            // Crear la receta
            const { data: prescription, error: prescError } = await supabase
                .from('prescriptions')
                .insert([
                    {
                        doctor_id: user.id,
                        patient_id: formData.patient_id,
                        diagnosis: formData.diagnosis,
                        notes: formData.notes
                    }
                ])
                .select()
                .single()

            if (prescError) throw prescError

            // Crear los medicamentos
            const medicationsToInsert = formData.medications.map(med => ({
                prescription_id: prescription.id,
                name: med.name,
                dosage: med.dosage,
                frequency: med.frequency,
                duration: med.duration,
                instructions: med.instructions
            }))

            const { error: medicationsError } = await supabase
                .from('medications')
                .insert(medicationsToInsert)

            if (medicationsError) throw medicationsError

            toast.success('Receta creada exitosamente')
            router.push('/dashboard/doctor')
        } catch (error) {
            console.error('Error creating prescription:', error)
            toast.error('Error al crear la receta')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading || !userProfile) {
        return <LoadingSpinner />
    }

    if (userProfile.role !== 'doctor') {
        router.push('/auth/login')
        return <LoadingSpinner />
    }

    return (
        <div className="min-h-1.5 bg-background-light dark:bg-background-dark">
            <Navigation />

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">Crear Nueva Receta</h1>
                        <p className="text-muted-light dark:text-muted-dark">
                            Prescribe medicamentos y tratamientos a tus pacientes.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Información del Paciente */}
                        <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
                            <h2 className="text-xl font-semibold mb-4">Información del Paciente</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="patient_id" className="block text-sm font-medium mb-2">
                                        Seleccionar Paciente *
                                    </label>
                                    <select
                                        id="patient_id"
                                        name="patient_id"
                                        value={formData.patient_id}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-border-light dark:border-border-dark bg-input-light dark:bg-input-dark rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                                    >
                                        <option value="">Selecciona un paciente</option>
                                        {patients.map((patient) => (
                                            <option key={patient.id} value={patient.id}>
                                                {patient.full_name} - {patient.email}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="diagnosis" className="block text-sm font-medium mb-2">
                                        Diagnóstico *
                                    </label>
                                    <input
                                        type="text"
                                        id="diagnosis"
                                        name="diagnosis"
                                        value={formData.diagnosis}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Ej: Hipertensión arterial"
                                        className="w-full px-3 py-2 border border-border-light dark:border-border-dark bg-input-light dark:bg-input-dark rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                                    />
                                </div>
                            </div>

                            <div className="mt-6">
                                <label htmlFor="notes" className="block text-sm font-medium mb-2">
                                    Notas Adicionales
                                </label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    rows={3}
                                    placeholder="Observaciones, recomendaciones generales..."
                                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark bg-input-light dark:bg-input-dark rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                                />
                            </div>
                        </div>

                        {/* Medicamentos */}
                        <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">Medicamentos</h2>
                                <button
                                    type="button"
                                    onClick={addMedication}
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
                                >
                                    + Agregar Medicamento
                                </button>
                            </div>

                            <div className="space-y-6">
                                {formData.medications.map((medication, index) => (
                                    <div
                                        key={index}
                                        className="p-4 border border-border-light dark:border-border-dark rounded-lg"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-medium">Medicamento {index + 1}</h3>
                                            {formData.medications.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeMedication(index)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">
                                                    Nombre del Medicamento *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={medication.name}
                                                    onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                                                    required
                                                    placeholder="Ej: Losartán"
                                                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark bg-input-light dark:bg-input-dark rounded-lg focus:outline-none focus:ring-primary focus:border-primary text-sm"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">
                                                    Dosis *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={medication.dosage}
                                                    onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                                                    required
                                                    placeholder="Ej: 50mg"
                                                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark bg-input-light dark:bg-input-dark rounded-lg focus:outline-none focus:ring-primary focus:border-primary text-sm"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">
                                                    Frecuencia *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={medication.frequency}
                                                    onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                                                    required
                                                    placeholder="Ej: 1 vez al día"
                                                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark bg-input-light dark:bg-input-dark rounded-lg focus:outline-none focus:ring-primary focus:border-primary text-sm"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">
                                                    Duración *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={medication.duration}
                                                    onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                                                    required
                                                    placeholder="Ej: 30 días"
                                                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark bg-input-light dark:bg-input-dark rounded-lg focus:outline-none focus:ring-primary focus:border-primary text-sm"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <label className="block text-sm font-medium mb-1">
                                                Instrucciones Especiales
                                            </label>
                                            <textarea
                                                value={medication.instructions}
                                                onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                                                rows={2}
                                                placeholder="Ej: Tomar con alimentos, evitar alcohol..."
                                                className="w-full px-3 py-2 border border-border-light dark:border-border-dark bg-input-light dark:bg-input-dark rounded-lg focus:outline-none focus:ring-primary focus:border-primary text-sm"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Botones de Acción */}
                        <div className="flex gap-4 justify-end">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-2 border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark rounded-lg hover:bg-muted-light/10 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Creando...
                                    </div>
                                ) : (
                                    'Crear Receta'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}