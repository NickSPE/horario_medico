import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validar que las variables de entorno estén presentes
if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined in environment variables')
}

if (!supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined in environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        // Configuración para app simple sin confirmación de email
        flowType: 'pkce'
    }
})

// Función de registro ULTRA SIMPLE - sin confirmación de email
export const ultraSimpleSignUp = async (email, password, userData = {}) => {
    try {
        console.log('🚀 Registro ultra simple iniciado...')

        // Paso 1: Intentar registrar al usuario
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: userData
            }
        })

        if (signUpError) {
            // Si el usuario ya existe, intentar hacer login
            if (signUpError.message?.includes('User already registered')) {
                console.log('🔄 Usuario ya existe, intentando login...')

                const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                    email,
                    password
                })

                if (loginError) {
                    throw new Error('El usuario ya existe pero la contraseña es incorrecta')
                }

                return { data: loginData, error: null }
            }
            throw signUpError
        }

        console.log('✅ SignUp exitoso:', signUpData)

        // Paso 2: Si el registro fue exitoso pero necesita confirmación, hacer login inmediato
        if (signUpData.user) {
            console.log('🔄 Intentando login inmediato...')

            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (loginError) {
                console.log('⚠️ Login inmediato falló, pero usuario registrado:', loginError.message)
                // Devolver los datos del signup aunque el login falle
                return { data: signUpData, error: null }
            }

            console.log('✅ Login inmediato exitoso:', loginData)
            return { data: loginData, error: null }
        }

        return { data: signUpData, error: null }
    } catch (error) {
        console.error('❌ Error en registro ultra simple:', error)
        return { data: null, error }
    }
}