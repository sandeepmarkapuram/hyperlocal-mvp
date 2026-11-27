'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { User, type Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export interface Profile {
  id: string
  full_name: string
  phone: string
  address: string
}

interface AuthContextValue {
  user: User | null
  profile: Profile | null
  loading: boolean
  refreshProfile: () => Promise<void>
  signUp: (input: {
    email: string
    password: string
    fullName: string
    phone: string
    address: string
  }) => Promise<void>
  signIn: (input: { email: string; password: string }) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (id: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
    if (!error && data) {
      setProfile(data)
    } else {
      setProfile(null)
    }
  }

  // Re-fetch the logged-in user's profile row (e.g. after an upsert).
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  // Resolve the initial session and load the matching profile row.
  useEffect(() => {
    let mounted = true

    const init = async () => {
      const { data } = await supabase.auth.getSession()
      const sessionUser = data.session?.user ?? null
      setUser(sessionUser)
      if (sessionUser) {
        await fetchProfile(sessionUser.id)
      } else {
        setProfile(null)
      }
      if (mounted) setLoading(false)
    }

    init()

    return () => {
      mounted = false
    }
  }, [])

  // Subscribe to auth state changes (sign in, sign out, token refresh, etc.).
  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (_event, session: Session | null) => {
        const sessionUser = session?.user ?? null
        setUser(sessionUser)
        if (sessionUser) {
          await fetchProfile(sessionUser.id)
        } else {
          setProfile(null)
        }
      }
    )

    return () => {
      subscription.subscription.unsubscribe()
    }
  }, [])

  const signUp = async ({
    email,
    password,
    fullName,
    phone,
    address,
  }: {
    email: string
    password: string
    fullName: string
    phone: string
    address: string
  }) => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      throw new Error(error.message)
    }

    const { data } = await supabase.auth.getSession()
    const signedUpUser = data.session?.user ?? null
    setUser(signedUpUser)

    if (signedUpUser) {
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: signedUpUser.id,
          full_name: fullName,
          phone,
          address,
        })
      if (upsertError) {
        throw new Error(upsertError.message)
      }
      setProfile({
        id: signedUpUser.id,
        full_name: fullName,
        phone,
        address,
      })
    }
  }

  const signIn = async ({ email, password }: { email: string; password: string }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      throw new Error(error.message)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, refreshProfile, signUp, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
