'use client'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
    const { user, userProfile, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/auth/login')
                return
            }

            // Intentar obtener el rol desde diferentes fuentes
            let userRole = 'patient' // default

            if (userProfile?.role) {
                userRole = userProfile.role
            } else if (user.user_metadata?.role) {
                userRole = user.user_metadata.role
            } else if (user.raw_user_meta_data?.role) {
                userRole = user.raw_user_meta_data.role
            }

            console.log('👤 Usuario:', user)
            console.log('📄 Perfil:', userProfile)
            console.log('🎭 Rol detectado:', userRole)

            const dashboardPath = userRole === 'doctor' ? '/dashboard/doctor' : '/dashboard/patient'
            console.log('🚀 Redirigiendo a:', dashboardPath)
            router.push(dashboardPath)
        }
    }, [user, userProfile, loading, router])

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <LoadingSpinner />
                <p className="mt-4 text-gray-600">Cargando dashboard...</p>
            </div>
        </div>
    )
}