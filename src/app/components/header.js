import Link from "next/link";

export default function Header() {
    return (

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
                        <h1 className="text-xl font-bold">Horario Medico</h1>
                    </div>
                    <nav className="hidden md:flex items-center gap-8">
                        <a className="nav-link" href="#features">
                            Servicios
                        </a>
                        <a className="nav-link" href="#about">
                            Acerca de
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
        </header >
    )
}