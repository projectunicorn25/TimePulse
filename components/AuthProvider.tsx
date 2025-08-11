'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseClient'
import type { User } from '@supabase/supabase-js'

type Profile = {
  id: string
  email: string
  role: 'contractor' | 'manager'
  first_name?: string
  last_name?: string
}

type AuthContextType = {
  user: User | null
  profile: Profile | null
  role: 'contractor' | 'manager' | null
  loading: boolean
  signOut: () => Promise<void>
  refreshRole: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  role: null,
  loading: true,
  signOut: async () => {},
  refreshRole: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [role, setRole] = useState<'contractor' | 'manager' | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = supabaseBrowser()

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role, first_name, last_name')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        // If profile doesn't exist, create it with default role
        if (error.code === 'PGRST116') {
          console.log('Profile not found, will be created by trigger')
          return null
        }
        return null
      }

      return data as Profile
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  }

  const refreshRole = async () => {
    if (user) {
      const userProfile = await fetchProfile(user.id)
      setProfile(userProfile)
      setRole(userProfile?.role || null)
    }
  }

  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      try {
        // Check active session
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Session error:', error)
          if (mounted) {
            setLoading(false)
          }
          return
        }

        if (mounted) {
          setUser(session?.user ?? null)

          // Fetch profile if user exists
          if (session?.user) {
            const userProfile = await fetchProfile(session.user.id)
            if (mounted) {
              setProfile(userProfile)
              setRole(userProfile?.role || null)
            }
          } else {
            setProfile(null)
            setRole(null)
          }

          setLoading(false)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth initialization timeout, setting loading to false')
        setLoading(false)
      }
    }, 5000) // 5 second timeout

    initAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      // Handle various auth events
      switch (event) {
        case 'INITIAL_SESSION':
        case 'SIGNED_IN':
        case 'TOKEN_REFRESHED':
          setUser(session?.user ?? null)
          if (session?.user) {
            const userProfile = await fetchProfile(session.user.id)
            setProfile(userProfile)
            setRole(userProfile?.role || null)
          }
          break

        case 'SIGNED_OUT':
          setUser(null)
          setProfile(null)
          setRole(null)
          break

        case 'USER_UPDATED':
          setUser(session?.user ?? null)
          if (session?.user) {
            // Refresh profile in case it changed
            const userProfile = await fetchProfile(session.user.id)
            setProfile(userProfile)
            setRole(userProfile?.role || null)
          }
          break
          
        default:
          break
      }
      
      setLoading(false)
    })
    
    // Set up automatic token refresh
    const refreshInterval = setInterval(async () => {
      if (user) {
        const { data: { session }, error } = await supabase.auth.refreshSession()
        if (error) {
          console.error('Failed to refresh session:', error)
          // Session expired, sign out
          if (error.message?.includes('refresh_token_not_found')) {
            await signOut()
          }
        }
      }
    }, 30 * 60 * 1000) // Refresh every 30 minutes

    return () => {
      mounted = false
      subscription.unsubscribe()
      clearInterval(refreshInterval)
      clearTimeout(timeoutId)
    }
  }, [supabase, fetchProfile]) // eslint-disable-line react-hooks/exhaustive-deps

  const signOut = async () => {
    try {
      console.log('Starting sign out process...')

      // Sign out from Supabase first
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Supabase sign out error:', error)
        throw error
      }

      console.log('Supabase sign out successful')

      // Clear local state
      setUser(null)
      setProfile(null)
      setRole(null)

      // Force a hard redirect to clear all state
      window.location.replace('/')
    } catch (error) {
      console.error('Sign out failed:', error)
      // Even if there's an error, clear local state and redirect
      setUser(null)
      setProfile(null)
      setRole(null)
      window.location.replace('/')
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, role, loading, signOut, refreshRole }}>
      {children}
    </AuthContext.Provider>
  )
}