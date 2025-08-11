'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabaseBrowser } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = supabaseBrowser()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password')
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Please confirm your email before logging in')
        } else {
          toast.error(error.message || 'Failed to sign in')
        }
        return
      }

      if (data?.user) {
        toast.success('Logged in successfully!')

        // Get user role to redirect appropriately
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        // Redirect based on role, fallback to provided redirect
        let redirectPath = redirect
        if (profile?.role === 'manager') {
          redirectPath = '/admin'
        } else if (profile?.role === 'contractor') {
          redirectPath = '/dashboard'
        }

        router.push(redirectPath)
        router.refresh()
      } else {
        toast.error('Authentication failed. Please try again.')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] grid place-items-center p-4">
      <div className="w-full max-w-md card p-8 animate-slide-up">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center mx-auto mb-3">
            <div className="w-6 h-6 border-2 border-white rounded-full"></div>
          </div>
          <h1 className="text-2xl font-bold gradient-text mb-2">Welcome back</h1>
          <p className="text-zinc-400 text-sm">
            Sign in to your TimePulse account
          </p>
        </div>

        {searchParams.get('error') === 'unauthorized' && (
          <div className="mb-6 p-4 rounded-lg bg-red-900/20 border border-red-500/30">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-sm text-red-300">
                You don&apos;t have permission to access that page.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="input"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="input"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn w-full py-2 text-sm font-semibold"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-zinc-400">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="link font-medium">
              Create one here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] grid place-items-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}