'use client'
import { supabase, ultraSimpleSignUp } from '@/lib/supabase'
import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext({})

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [userProfile, setUserProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    // Función helper para cargar perfil (sin loops)
    const loadProfile = async (userId, userEmail = '') => {
        try {
            console.log('🔍 Cargando perfil para:', userId)

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle() // Usar maybeSingle en lugar de single para evitar errores

            if (error) {
                console.error('❌ Error obteniendo perfil:', error)
                setUserProfile(null)
                return
            }

            if (!data) {
                // No existe perfil, crear uno
                console.log('🔄 Creando perfil...')
                const { data: newProfile, error: createError } = await supabase
                    .from('profiles')
                    .insert([{
                        id: userId,
                        email: userEmail,
                        full_name: '',
                        role: 'patient'
                    }])
                    .select()
                    .single()

                if (createError) {
                    console.error('❌ Error creando perfil:', createError)
                    setUserProfile(null)
                } else {
                    console.log('✅ Perfil creado:', newProfile)
                    setUserProfile(newProfile)
                }
            } else {
                console.log('✅ Perfil encontrado:', data)
                setUserProfile(data)
            }
        } catch (err) {
            console.error('❌ Error general cargando perfil:', err)
            setUserProfile(null)
        }
    }

    useEffect(() => {
        let mounted = true

        const initAuth = async () => {
            try {
                // Obtener sesión actual
                const { data: { session }, error } = await supabase.auth.getSession()
                
                if (error) {
                    console.error('Error obteniendo sesión:', error)
                    return
                }

                if (!mounted) return

                if (session?.user) {
                    setUser(session.user)
                    await loadProfile(session.user.id, session.user.email)
                } else {
                    setUser(null)
                    setUserProfile(null)
                }
            } catch (err) {
                console.error('Error inicializando auth:', err)
            } finally {
                if (mounted) setLoading(false)
            }
        }

        initAuth()

        // Escuchar cambios de autenticación
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!mounted) return

                console.log('🔄 Auth event:', event)
                
                if (session?.user) {
                    setUser(session.user)
                    // Solo cargar perfil en eventos importantes
                    if (event === 'SIGNED_IN' || event === 'SIGNED_UP') {
                        await loadProfile(session.user.id, session.user.email)
                    }
                } else {
                    setUser(null)
                    setUserProfile(null)
                }
                
                if (mounted) setLoading(false)
            }
        )

        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, [])

    const signUp = async (email, password, userData) => {
        try {
            const { data, error } = await ultraSimpleSignUp(email, password, userData)
            if (error) throw error
            return { data, error: null }
        } catch (error) {
            console.error('❌ Error en signUp:', error)
            throw error
        }
    }

    const signIn = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            })
            return { data, error }
        } catch (error) {
            return { data: null, error }
        }
    }

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut()
            return { error }
        } catch (error) {
            return { error }
        }
    }

    const value = {
        user,
        userProfile,
        loading,
        signUp,
        signIn,
        signOut
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}