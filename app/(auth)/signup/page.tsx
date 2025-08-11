'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabaseBrowser } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

function SignupForm() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<'contractor' | 'manager'>('contractor')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  const roleParam = searchParams.get('role') as 'contractor' | 'manager' | null

  // Set role from URL parameter if provided
  useEffect(() => {
    if (roleParam && (roleParam === 'contractor' || roleParam === 'manager')) {
      setRole(roleParam)
    }
  }, [roleParam])

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()

    if (!firstName.trim() || !lastName.trim()) {
      toast.error('Please enter your first and last name')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const supabase = supabaseBrowser()
      
      // Sign up the user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role,
            first_name: firstName.trim(),
            last_name: lastName.trim()
          }
        }
      })

      if (signUpError) {
        if (signUpError.message.includes('User already registered')) {
          toast.error('An account with this email already exists')
        } else if (signUpError.message.includes('Password')) {
          toast.error('Password does not meet requirements')
        } else {
          toast.error(signUpError.message || 'Failed to create account')
        }
        return
      }

      if (signUpData?.user) {
        toast.success('Account created successfully! Logging you in...')
        
        // Small delay to ensure profile trigger completes
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Auto-login after signup
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (!signInError) {
          // Redirect based on role
          const redirectPath = role === 'manager' ? '/admin' : '/dashboard'
          router.push(redirectPath)
          router.refresh()
        } else {
          toast.error('Account created but failed to sign in. Please try logging in.')
          router.push('/login')
        }
      } else {
        toast.error('Account creation failed. Please try again.')
      }
    } catch (error) {
      console.error('Signup error:', error)
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-6">
      <div className="min-h-[80vh] grid place-items-center">
      <div className="w-full max-w-md card p-8 animate-slide-up">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold gradient-text mb-2">
            Join TimePulse{roleParam ? ` as ${roleParam}` : ''}
          </h1>
          <p className="text-zinc-400 text-sm">
            {roleParam === 'contractor' && 'Create your account to start logging hours and tracking time'}
            {roleParam === 'manager' && 'Create your account to manage team timesheets and approvals'}
            {!roleParam && 'Create your account to start tracking time'}
          </p>
          {roleParam && (
            <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {roleParam === 'contractor' && '⏱️ Contractor Account'}
              {roleParam === 'manager' && '👨‍💼 Manager Account'}
            </div>
          )}
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="firstName" className="block text-sm font-medium text-zinc-300">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
                className="input"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="lastName" className="block text-sm font-medium text-zinc-300">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name"
                className="input"
                required
                disabled={loading}
              />
            </div>
          </div>

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
              placeholder="Create a password"
              className="input"
              required
              disabled={loading}
              minLength={6}
            />
            <p className="text-xs text-zinc-500">
              Must be at least 6 characters long
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-300">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="input"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="role" className="block text-sm font-medium text-zinc-300">
              Account Type
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'contractor' | 'manager')}
              className="input"
              disabled={loading}
            >
              <option value="contractor">Contractor (Time Tracker)</option>
              <option value="manager">Manager (Approver)</option>
            </select>
            <p className="text-xs text-zinc-500">
              {role === 'contractor'
                ? 'Track and submit your time entries for approval'
                : 'Review and approve team time submissions'}
            </p>
          </div>

          <button
            type="submit"
            className="btn w-full py-2 text-sm font-semibold"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-zinc-400">
            Already have an account?{' '}
            <Link href="/login" className="link font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
      </div>
    </main>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] grid place-items-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    }>
      <SignupForm />
    </Suspense>
  )
}