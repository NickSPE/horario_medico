'use client'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'

const AuthForm = ({ type = 'login' }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        role: 'patient'
    })
    const [loading, setLoading] = useState(false)
    const { signIn, signUp } = useAuth()
    const router = useRouter()

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (type === 'login') {
                const { data, error } = await signIn(formData.email, formData.password)
                if (error) {
                    toast.error(error.message || 'Error al iniciar sesión')
                } else {
                    toast.success('¡Bienvenido de vuelta!')
                    router.push(data.user ? '/dashboard' : '/auth/login')
                }
            } else {
                const { data, error } = await signUp(formData.email, formData.password, {
                    full_name: formData.fullName,
                    role: formData.role
                })
                if (error) {
                    toast.error(error.message || 'Error al crear la cuenta')
                } else {
                    toast.success('¡Cuenta creada exitosamente! Revisa tu email para confirmar tu cuenta.')
                    router.push('/auth/login')
                }
            }
        } catch (error) {
            toast.error('Error inesperado')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br">
            {/* Header */}
            <header className="w-full glass border-b dark:border-surface-800">
                <div className="px-4 sm:px-6 lg:px-8">
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
                            <h1 className="text-xl font-bold text-gradient">MedControl</h1>
                        </div>
                        <nav className="hidden md:flex items-center gap-8 fade-in stagger-1">
                            <a className="text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-primary-500 dark:hover:text-primary-400 transition-all duration-200 interactive" href="#">
                                Inicio
                            </a>
                            <a className="text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-primary-500 dark:hover:text-primary-400 transition-all duration-200 interactive" href="#">
                                Servicios
                            </a>
                            <a className="text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-primary-500 dark:hover:text-primary-400 transition-all duration-200 interactive" href="#">
                                Acerca de
                            </a>
                        </nav>
                        <div className="flex items-center gap-2 fade-in stagger-2">
                            <Link
                                href="/auth/login"
                                className="px-4 py-2 text-sm font-medium rounded-lg text-primary-600 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900 dark:hover:bg-primary-800 dark:text-primary-300 transition-all duration-200 interactive"
                            >
                                Iniciar Sesión
                            </Link>
                            <Link
                                href="/auth/register"
                                className="btn-primary"
                            >
                                Registrarse
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8 fade-in-up">
                    <div className="card p-8 hover-lift">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-fluid-2xl text-surface-900 dark:text-surface-100">
                                {type === 'login' ? 'Bienvenido de vuelta' : 'Únete a MedControl'}
                            </h2>
                            <p className="mt-3 text-surface-600 dark:text-surface-400 text-fluid-sm">
                                {type === 'login' ? (
                                    <>
                                        ¿No tienes una cuenta?{' '}
                                        <Link className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors" href="/auth/register">
                                            Regístrate aquí
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        ¿Ya tienes una cuenta?{' '}
                                        <Link className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors" href="/auth/login">
                                            Inicia Sesión
                                        </Link>
                                    </>
                                )}
                            </p>
                        </div>

                        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                {type === 'register' && (
                                    <div className="fade-in stagger-1">
                                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2" htmlFor="fullName">
                                            Nombre completo
                                        </label>
                                        <input
                                            className="input-modern focus-ring"
                                            id="fullName"
                                            name="fullName"
                                            placeholder="Ingresa tu nombre completo"
                                            required
                                            type="text"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                )}

                                <div className="fade-in stagger-2">
                                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2" htmlFor="email">
                                        Correo electrónico
                                    </label>
                                    <input
                                        autoComplete="email"
                                        className="input-modern focus-ring"
                                        id="email"
                                        name="email"
                                        placeholder="tu@email.com"
                                        required
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="fade-in stagger-3">
                                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2" htmlFor="password">
                                        Contraseña
                                    </label>
                                    <input
                                        autoComplete={type === 'login' ? 'current-password' : 'new-password'}
                                        className="input-modern focus-ring"
                                        id="password"
                                        name="password"
                                        placeholder="••••••••"
                                        required
                                        type="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {type === 'register' && (
                                <div className="fade-in stagger-4">
                                    <span className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
                                        Selecciona tu rol:
                                    </span>
                                    <div className="grid grid-cols-2 gap-3">
                                        <label className="relative flex items-center justify-center p-4 border border-surface-300 dark:border-surface-700 rounded-lg cursor-pointer hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50 dark:has-[:checked]:bg-primary-950 has-[:checked]:text-primary-700 dark:has-[:checked]:text-primary-300 interactive">
                                            <input
                                                className="sr-only"
                                                name="role"
                                                type="radio"
                                                value="doctor"
                                                checked={formData.role === 'doctor'}
                                                onChange={handleChange}
                                            />
                                            <div className="text-center">
                                                <div className="text-lg mb-1">👨‍⚕️</div>
                                                <span className="text-sm font-medium">Doctor</span>
                                            </div>
                                        </label>
                                        <label className="relative flex items-center justify-center p-4 border border-surface-300 dark:border-surface-700 rounded-lg cursor-pointer hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50 dark:has-[:checked]:bg-primary-950 has-[:checked]:text-primary-700 dark:has-[:checked]:text-primary-300 interactive">
                                            <input
                                                className="sr-only"
                                                name="role"
                                                type="radio"
                                                value="patient"
                                                checked={formData.role === 'patient'}
                                                onChange={handleChange}
                                            />
                                            <div className="text-center">
                                                <div className="text-lg mb-1">🧑‍🦽</div>
                                                <span className="text-sm font-medium">Paciente</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            )}

                            <div className="fade-in stagger-5">
                                <button
                                    className="btn-primary w-full py-3 focus-ring disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="loading-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                            {type === 'login' ? 'Iniciando sesión...' : 'Creando cuenta...'}
                                        </div>
                                    ) : (
                                        <span className="font-medium">
                                            {type === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </form>

                        {type === 'login' && (
                            <div className="mt-6 text-center fade-in stagger-6">
                                <Link
                                    href="#"
                                    className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                                >
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}

export default AuthForm