'use client'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const Navigation = () => {
    const { user, userProfile, signOut } = useAuth()
    const router = useRouter()

    const handleSignOut = async () => {
        const { error } = await signOut()
        if (error) {
            toast.error('Error al cerrar sesión')
        } else {
            toast.success('Sesión cerrada exitosamente')
            router.push('/auth/login')
        }
    }

    if (!user) return null

    return (
        <header className="w-full glass border-b border-surface-200 dark:border-surface-800 sticky top-0 z-50 backdrop-blur-md">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-3 fade-in">
                        <div className="relative">
                            <svg
                                className="h-8 w-8 text-primary-500 hover-glow"
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
                        </div>
                        <h1 className="text-xl font-bold text-gradient">Horario Médico</h1>
                    </div>

                    <nav className="hidden md:flex items-center gap-8 fade-in stagger-1">
                        <Link
                            href={userProfile?.role === 'doctor' ? '/dashboard/doctor' : '/dashboard/patient'}
                            className="text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-primary-500 dark:hover:text-primary-400 transition-all duration-200 hover:scale-105 interactive"
                        >
                            Dashboard
                        </Link>
                        {userProfile?.role === 'doctor' && (
                            <Link
                                href="/dashboard/doctor/patients"
                                className="text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-primary-500 dark:hover:text-primary-400 transition-all duration-200 hover:scale-105 interactive"
                            >
                                Pacientes
                            </Link>
                        )}
                        {userProfile?.role === 'patient' && (
                            <Link
                                href="/dashboard/patient/prescriptions"
                                className="text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-primary-500 dark:hover:text-primary-400 transition-all duration-200 hover:scale-105 interactive"
                            >
                                Recetas
                            </Link>
                        )}
                    </nav>

                    <div className="flex items-center gap-4 fade-in stagger-2">
                        <div className="hidden sm:block text-sm">
                            <span className="text-surface-600 dark:text-surface-400">
                                Hola,
                            </span>
                            <span className="font-medium text-surface-900 dark:text-surface-100">
                                {userProfile?.full_name || user?.email}
                            </span>
                            <span className="ml-2 px-3 py-1 text-xs font-medium bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full shadow-md">
                                {userProfile?.role === 'doctor' ? 'Doctor' : 'Paciente'}
                            </span>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="px-4 py-2 text-sm font-medium rounded-lg text-surface-600 dark:text-surface-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950 transition-all duration-200 interactive hover-lift"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Navigation