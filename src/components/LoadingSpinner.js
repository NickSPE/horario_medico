'use client'

const LoadingSpinner = ({ size = 'md', className = '' }) => {
    const sizeClasses = {
        sm: 'h-6 w-6',
        md: 'h-12 w-12',
        lg: 'h-16 w-16',
        xl: 'h-20 w-20'
    }

    return (
        <div className={`flex items-center justify-center min-h-screen bg-gradient-to-br from-surface-50 to-surface-100 dark:from-surface-950 dark:to-surface-900 ${className}`}>
            <div className="relative">
                {/* Spinner principal */}
                <div className={`loading-spin rounded-full border-4 border-surface-200 dark:border-surface-800 border-t-primary-500 ${sizeClasses[size]}`}></div>

                {/* Resplandor de fondo */}
                <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 opacity-20 blur-md ${sizeClasses[size]}`}></div>

                {/* Pulsos adicionales */}
                <div className={`absolute inset-0 rounded-full border-2 border-primary-300 dark:border-primary-700 opacity-50 animate-ping ${sizeClasses[size]}`}></div>
            </div>

            {/* Texto de carga */}
            <div className="ml-4 text-surface-600 dark:text-surface-400">
                <div className="font-medium text-fluid-base">Cargando...</div>
                <div className="text-sm opacity-75 loading-pulse">Por favor espera un momento</div>
            </div>
        </div>
    )
}

export default LoadingSpinner