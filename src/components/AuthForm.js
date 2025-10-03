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
                await signIn(formData.email, formData.password)
                toast.success('¡Bienvenido!')
            } else {
                if (!formData.fullName.trim()) {
                    toast.error('El nombre completo es requerido')
                    return
                }
                await signUp(formData.email, formData.password, formData.fullName, formData.role)
                toast.success('¡Cuenta creada exitosamente!')
            }
        } catch (error) {
            console.error('Error de autenticación:', error)
            toast.error(error.message || 'Error en la autenticación')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col min-h-screen">
            {/* Header */}
            <header className="header-app">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <svg
                                className="h-8 w-8"
                                style={{ color: 'var(--color-primary)' }}
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
                            <div className='text-xl font-bold'>

                                Horario Médico
                            </div>
                        </div>
                        <nav className="hidden md:flex items-center gap-8">
                            <a className="nav-link" href="#servicios">
                                Servicios
                            </a>
                            <a className="nav-link" href="#about">
                                Acerca de
                            </a>
                            <a className="nav-link" href="#contact">
                                Contacto
                            </a>
                        </nav>
                        <div className="flex items-center gap-2">
                            <Link
                                href="/auth/login"
                                className="btn btn-secondary"
                            >
                                Iniciar Sesión
                            </Link>
                            <Link
                                href="/auth/register"
                                className="btn btn-primary"
                            >
                                Registrarse
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold">
                            {type === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
                        </h2>
                        <p className="mt-3" style={{ color: 'var(--color-text-secondary)' }}>
                            {type === 'login'
                                ? 'Accede a tu cuenta para gestionar tus medicamentos'
                                : 'Crea tu cuenta para comenzar a gestionar tus medicamentos'
                            }
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            {type === 'register' && (
                                <div className="form-group">
                                    <label className="label" htmlFor="fullName">
                                        Nombre completo
                                    </label>
                                    <input
                                        className="input"
                                        id="fullName"
                                        name="fullName"
                                        placeholder="Juan Pérez"
                                        required
                                        type="text"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label className="label" htmlFor="email">
                                    Correo electrónico
                                </label>
                                <input
                                    autoComplete="email"
                                    className="input"
                                    id="email"
                                    name="email"
                                    placeholder="tu@email.com"
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label className="label" htmlFor="password">
                                    Contraseña
                                </label>
                                <input
                                    autoComplete={type === 'login' ? 'current-password' : 'new-password'}
                                    className="input"
                                    id="password"
                                    name="password"
                                    placeholder="••••••••"
                                    required
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>

                            {type === 'register' && (
                                <div className="form-group">
                                    <span className="label">
                                        Tipo de cuenta
                                    </span>
                                    <div className="grid grid-cols-2 gap-4">
                                        <label className="card cursor-pointer p-4 text-center">
                                            <input
                                                className="sr-only"
                                                name="role"
                                                type="radio"
                                                value="patient"
                                                checked={formData.role === 'patient'}
                                                onChange={handleChange}
                                            />
                                            <div className="text-2xl mb-2">👤</div>
                                            <div className="font-medium">Paciente</div>
                                        </label>
                                        <label className="card cursor-pointer p-4 text-center">
                                            <input
                                                className="sr-only"
                                                name="role"
                                                type="radio"
                                                value="doctor"
                                                checked={formData.role === 'doctor'}
                                                onChange={handleChange}
                                            />
                                            <div className="text-2xl mb-2">👨‍⚕️</div>
                                            <div className="font-medium">Doctor</div>
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <button
                                className="btn btn-primary w-full"
                                disabled={loading}
                                type="submit"
                            >
                                {loading ? (
                                    <div className="spinner"></div>
                                ) : (
                                    type === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'
                                )}
                            </button>
                        </div>

                        <div className="text-center">
                            <p style={{ color: 'var(--color-text-secondary)' }}>
                                {type === 'login' ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
                                {' '}
                                <Link
                                    href={type === 'login' ? '/auth/register' : '/auth/login'}
                                    style={{ color: 'var(--color-primary)' }}
                                    className="font-medium hover:underline"
                                >
                                    {type === 'login' ? 'Regístrate' : 'Inicia sesión'}
                                </Link>
                            </p>
                        </div>

                        {type === 'login' && (
                            <div className="text-center">
                                <Link
                                    href="/auth/forgot-password"
                                    style={{ color: 'var(--color-primary)' }}
                                    className="text-sm hover:underline"
                                >
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>
                        )}
                    </form>
                </div>
            </main>
        </div>
    )
}

export default AuthForm