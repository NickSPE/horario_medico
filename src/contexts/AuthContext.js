'use client'
import { supabase } from '@/lib/supabase'
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
        // Obtener sesión inicial
        const getInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setUser(session?.user || null)

            if (session?.user) {
                await fetchUserProfile(session.user.id)
            }
            setLoading(false)
        }

        getInitialSession()

        // Escuchar cambios de autenticación
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user || null)

                if (session?.user) {
                    await fetchUserProfile(session.user.id)
                } else {
                    setUserProfile(null)
                }
                setLoading(false)
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    const fetchUserProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching profile:', error)
                return
            }

            setUserProfile(data)
        } catch (error) {
            console.error('Error fetching profile:', error)
        }
    }

    const signUp = async (email, password, userData) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: userData
                }
            })

            if (error) throw error

            // Crear perfil del usuario
            if (data.user) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert([
                        {
                            id: data.user.id,
                            email: data.user.email,
                            full_name: userData.full_name,
                            role: userData.role,
                            created_at: new Date().toISOString()
                        }
                    ])

                if (profileError) {
                    console.error('Error creating profile:', profileError)
                }
            }

            return { data, error }
        } catch (error) {
            return { data: null, error }
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
        signOut,
        fetchUserProfile
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}