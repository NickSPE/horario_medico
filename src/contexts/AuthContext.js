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

    useEffect(() => {
        let isMounted = true

        const fetchUserProfile = async (userId, userEmail = '') => {
            try {
                console.log('🔍 Buscando perfil para usuario:', userId)

                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single()

                if (error) {
                    console.log('ℹ️ Error o no se encontró perfil:', error.message)

                    // Si no existe el perfil, intentar crearlo
                    if (error.code === 'PGRST116') {
                        console.log('🔄 Creando perfil básico...')
                        const { data: newProfile, error: createError } = await supabase
                            .from('profiles')
                            .insert([
                                {
                                    id: userId,
                                    email: userEmail,
                                    full_name: '',
                                    role: 'patient'
                                }
                            ])
                            .select()
                            .single()

                        if (createError) {
                            console.error('❌ Error creando perfil:', createError)
                            if (isMounted) setUserProfile(null)
                            return
                        }

                        console.log('✅ Perfil creado:', newProfile)
                        if (isMounted) setUserProfile(newProfile)
                        return
                    }

                    if (isMounted) setUserProfile(null)
                    return
                }

                console.log('✅ Perfil obtenido:', data)
                if (isMounted) setUserProfile(data)
            } catch (error) {
                console.error('❌ Error general fetchUserProfile:', error)
                if (isMounted) setUserProfile(null)
            }
        }

        const getInitialSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()

                if (!isMounted) return

                setUser(session?.user || null)

                if (session?.user) {
                    await fetchUserProfile(session.user.id, session.user.email)
                }
            } catch (error) {
                console.error('Error obteniendo sesión inicial:', error)
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        getInitialSession()

        // Escuchar cambios de autenticación
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!isMounted) return

                console.log('🔄 Auth state change:', event)
                setUser(session?.user || null)

                if (session?.user) {
                    await fetchUserProfile(session.user.id, session.user.email)
                } else {
                    setUserProfile(null)
                }

                setLoading(false)
            }
        )

        return () => {
            isMounted = false
            subscription.unsubscribe()
        }
    }, []) // Sin dependencias para evitar loops

    const signUp = async (email, password, userData) => {
        try {
            console.log('🚀 Iniciando registro ultra simple con:', { email, userData })

            const { data, error } = await ultraSimpleSignUp(email, password, userData)

            if (error) {
                console.error('❌ Error en signUp:', error)
                throw error
            }

            console.log('✅ Usuario registrado/logueado exitosamente:', data)
            return { data, error: null }
        } catch (error) {
            console.error('❌ Error general en signUp:', error)
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