'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { NavBar } from '@/components/nav-bar'

type SavedInfo = {
  name?: string
  phone?: string
  address?: string
} | null

const readSavedInfo = (): SavedInfo => {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    return JSON.parse(
      localStorage.getItem('hyperlocal_customer_info') ?? 'null',
    )
  } catch {
    return null
  }
}

export default function ProfilePage() {
  const { user, profile, loading, updateProfile, signOut } = useAuth()
  const router = useRouter()

  const metadataFullName =
    typeof user?.user_metadata?.full_name === 'string'
      ? user.user_metadata.full_name
      : null

  const savedInfo = readSavedInfo()

  const [fullName, setFullName] = useState(
    () => profile?.full_name ?? metadataFullName ?? savedInfo?.name ?? '',
  )
  const [phone, setPhone] = useState(
    () => profile?.phone ?? savedInfo?.phone ?? '',
  )
  const [address, setAddress] = useState(
    () => profile?.address ?? savedInfo?.address ?? '',
  )

  const [status, setStatus] = useState<{
    kind: 'saved' | 'error'
    message: string
  } | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus(null)
    setSaving(true)
    try {
      await updateProfile({ fullName, phone, address })
      setStatus({ kind: 'saved', message: 'Profile saved!' })
    } catch (error) {
      setStatus({
        kind: 'error',
        message:
          error instanceof Error ? error.message : 'Failed to save profile.',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    await router.push('/')
  }

  // The auth provider SSR-renders with `loading === true`, so nothing is
  // emitted until the session has resolved on the client.
  if (loading) {
    return null
  }

  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-[#F4F6FB] pb-24">
      <NavBar />
      <main className="px-3.5 pt-4">
        <Link
          href="/"
          className="inline-block mb-4 text-xs font-semibold text-slate-600 hover:text-[#0C831F]"
        >
          ← Back to Stores
        </Link>

        {!user ? (
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <p className="text-sm text-slate-700">
              You're not logged in. Sign in to view and edit your profile.
            </p>
            <Link
              href="/login"
              className="mt-3 inline-block text-xs font-semibold text-[#0C831F] hover:underline"
            >
              Login / Register
            </Link>
          </section>
        ) : (
          <form onSubmit={handleSave} className="space-y-3">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
              <h2 className="font-bold text-lg text-slate-900">My Profile</h2>

              <div className="flex items-baseline gap-2 px-1">
                <span className="text-sm font-medium text-slate-700">
                  Email
                </span>
                <p className="text-sm text-slate-500">{user.email ?? ''}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">
                  Full Name
                </label>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0C831F]"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">
                  Contact Number
                </label>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0C831F]"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">
                  Default Delivery Address
                </label>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0C831F]"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                />
              </div>

              {status && (
                <p
                  className={
                    status.kind === 'saved'
                      ? 'text-xs font-medium text-[#0C831F]'
                      : 'text-xs font-medium text-red-600'
                  }
                >
                  {status.message}
                </p>
              )}

              <button
                type="submit"
                disabled={saving}
                className={`bg-[#0C831F] hover:bg-[#096b19] text-white font-semibold w-full py-2.5 rounded-xl ${
                  saving ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {saving ? 'Saving…' : 'Save Profile'}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50"
              >
                Logout
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}