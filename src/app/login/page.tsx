'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/auth-context'
import { NavBar } from '@/components/nav-bar'

type Mode = 'login' | 'register'

export default function LoginPage() {
  const router = useRouter()
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const clearError = () => setError('')

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError('')
      setSubmitting(true)
      try {
        const form = e.currentTarget as HTMLFormElement
        const email = (form.elements.namedItem('email') as HTMLInputElement).value
        const password = (form.elements.namedItem('password') as HTMLInputElement).value

        if (mode === 'login') {
          await signIn({ email, password })
        } else {
          const fullName = (form.elements.namedItem('fullName') as HTMLInputElement).value
          const phone = (form.elements.namedItem('phone') as HTMLInputElement).value
          const address = (form.elements.namedItem('address') as HTMLTextAreaElement).value
          await signUp({ email, password, fullName, phone, address })
        }
        router.push('/')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong. Try again.')
      } finally {
        setSubmitting(false)
      }
    },
    [mode, signIn, signUp, router]
  )

  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-[#F4F6FB]">
      <NavBar />
      <div className="px-4 py-6">
        <div className="rounded-2xl p-5 shadow-sm bg-white border border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 text-center mb-1">
            {mode === 'login' ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="text-xs text-slate-500 text-center mb-5">
            {mode === 'login'
              ? 'Sign in to your HyperLocal account'
              : 'Join us — delivery across Rajarajeshwari Nagar, Bengaluru'}
          </p>

          {/* Toggle tabs */}
          <div className="flex gap-1 mb-5">
            <button
              onClick={() => { setMode('login'); setError('') }}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${
                mode === 'login'
                  ? `bg-[#0C831F] text-white`
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => { setMode('register'); setError('') }}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${
                mode === 'register'
                  ? `bg-[#0C831F] text-white`
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Register
            </button>
          </div>

          {/* Inline error message */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-100 px-3 py-2">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {mode === 'login' ? (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    onFocus={clearError}
                    className="w-full box-border px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0C831F] focus:border-[#0C831F] transition"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">
                    Password
                  </label>
                  <input
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    onFocus={clearError}
                    className="w-full box-border px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0C831F] focus:border-[#0C831F] transition"
                    placeholder="••••••••"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">
                    Full Name
                  </label>
                  <input
                    name="fullName"
                    autoComplete="name"
                    required
                    onFocus={clearError}
                    className="w-full box-border px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0C831F] focus:border-[#0C831F] transition"
                    placeholder="Ramesh Kumar"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    pattern="[6-9]\\d{9}"
                    required
                    onFocus={clearError}
                    className="w-full box-border px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0C831F] focus:border-[#0C831F] transition"
                    placeholder="9876543210"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">
                    Delivery Address
                  </label>
                  <textarea
                    name="address"
                    autoComplete="address"
                    required
                    onFocus={clearError}
                    rows={2}
                    className="w-full box-border px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0C831F] focus:border-[#0C831F] transition min-h-[80px]"
                    placeholder="Flat/Apt, Street, Landmark, Rajarajeshwari Nagar, Bengaluru"
                  ></textarea>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    onFocus={clearError}
                    className="w-full box-border px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0C831F] focus:border-[#0C831F] transition"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">
                    Password
                  </label>
                  <input
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    onFocus={clearError}
                    className="w-full box-border px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0C831F] focus:border-[#0C831F] transition"
                    placeholder="••••••••"
                  />
                </div>
              </>)}
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3 rounded-xl text-sm font-semibold text-white transition disabled:opacity-70 ${
                submitting ? 'bg-slate-400' : `bg-[#0C831F] hover:bg-[#0a701a]`
              }`}
            >
              {submitting ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>

            <p className="mt-4 text-xs text-center text-slate-600">
              {mode === 'login'
                ? "Don't have an account? "
                : 'Already have an account? '}
              <button
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
                className={`font-semibold text-[#0C831F] hover:underline ml-1`}
              >
                {mode === 'login' ? 'Register' : 'Sign in'}
              </button>
            </p>
          </form>

          <p className="mt-6 text-xs text-center text-slate-500">
            Continue as a guest?{' '}
            <Link href="/" className="font-semibold text-[#0C831F] hover:underline">
              Browse stores
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}