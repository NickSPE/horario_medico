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
            } else if (userProfile) {
                const dashboardPath = userProfile.role === 'doctor' ? '/dashboard/doctor' : '/dashboard/patient'
                router.push(dashboardPath)
            }
        }
    }, [user, userProfile, loading, router])

    return <LoadingSpinner />
}