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
  updateProfile: (input: {
    fullName: string
    phone: string
    address: string
  }) => Promise<void>
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

  const fetchProfile = async (user: User) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, phone, address')
      .eq('id', user.id)
      .maybeSingle()
    if (error) {
      setProfile(null)
      return
    }
    if (data) {
      setProfile(data)
      return
    }

    // No profiles row yet: backfill from auth user metadata or the locally
    // saved checkout info, then create the row so existing users immediately
    // get a profiles record.
    const metadataFullName =
      typeof user.user_metadata?.full_name === 'string'
        ? user.user_metadata.full_name
        : null

    let fullName = metadataFullName
    let phone = ''
    let address = ''

    if (!fullName) {
      let saved:
        | { name?: string; phone?: string; address?: string }
        | null = null
      try {
        saved = JSON.parse(
          localStorage.getItem('hyperlocal_customer_info') ?? 'null',
        )
      } catch {
        saved = null
      }
      if (saved?.name) {
        fullName = saved.name
        phone = saved.phone ?? ''
        address = saved.address ?? ''
      }
    }

    if (fullName) {
      const profileRow: Profile = {
        id: user.id,
        full_name: fullName,
        phone,
        address,
      }
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert(profileRow)
      if (upsertError) {
        setProfile(null)
      } else {
        setProfile(profileRow)
      }
    } else {
      setProfile(null)
    }
  }

  // Re-fetch the logged-in user's profile row (e.g. after an upsert).
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user)
    }
  }

  // Update the logged-in user's profile across the profiles table, auth user
  // metadata, and localStorage, then reflect it in context immediately so the
  // NavBar (and any other consumer) updates live without a page reload.
  const updateProfile = async ({
    fullName,
    phone,
    address,
  }: {
    fullName: string
    phone: string
    address: string
  }) => {
    if (!user) {
      throw new Error('Not logged in')
    }

    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert({ id: user.id, full_name: fullName, phone, address })
    if (upsertError) {
      throw new Error(upsertError.message)
    }

    const { error: authError } = await supabase.auth.updateUser({
      data: { full_name: fullName, phone, address },
    })
    if (authError) {
      throw new Error(authError.message)
    }

    localStorage.setItem(
      'hyperlocal_customer_info',
      JSON.stringify({ name: fullName, phone, address }),
    )

    setProfile({ id: user.id, full_name: fullName, phone, address })
  }

  // Resolve the initial session and load the matching profile row.
  useEffect(() => {
    let mounted = true

    const init = async () => {
      const { data } = await supabase.auth.getSession()
      const sessionUser = data.session?.user ?? null
      setUser(sessionUser)
      if (sessionUser) {
        await fetchProfile(sessionUser)
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
          await fetchProfile(sessionUser)
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
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone, address },
      },
    })
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
      value={{
        user,
        profile,
        loading,
        refreshProfile,
        updateProfile,
        signUp,
        signIn,
        signOut,
      }}
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
