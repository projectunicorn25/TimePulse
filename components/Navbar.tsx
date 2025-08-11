'use client'
import Link from 'next/link'
import SignOutButton from '@/components/SignOutButton'
import { useAuth } from '@/components/AuthProvider'

export default function Navbar() {
  const { user, profile, role, loading } = useAuth()

  return (
    <header className="navbar">
      <nav className="container h-16 flex items-center gap-6">
        {/* Logo */}
        <Link href="/" className="font-bold text-zinc-100 flex items-center gap-2 hover:scale-105 transition-transform">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg">
            <div className="w-3 h-3 border-2 border-white rounded-full"></div>
          </div>
          <span className="text-base gradient-text">TimePulse</span>
        </Link>

        {/* Navigation Links */}
        {!loading && user && (
          <div className="flex items-center gap-1">
            {role === 'contractor' && (
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-zinc-100 hover:bg-[var(--glass-bg)] rounded-lg transition-all"
              >
                Dashboard
              </Link>
            )}
            {role === 'manager' && (
              <Link
                href="/admin"
                className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-zinc-100 hover:bg-[var(--glass-bg)] rounded-lg transition-all"
              >
                Manager Dashboard
              </Link>
            )}
          </div>
        )}

        {/* Right Side Actions */}
        <div className="ml-auto flex items-center gap-4">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin"></div>
              Loading...
            </div>
          ) : !user ? (
            <div className="flex items-center gap-3">
              <Link href="/login" className="btn-secondary px-4 py-2 text-sm font-medium">
                Sign In
              </Link>
              <Link href="/signup" className="btn px-4 py-2 text-sm font-medium">
                Get Started
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--glass-bg)] border border-[rgb(var(--border))]">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                  <span className="text-xs font-semibold text-white">
                    {profile?.first_name && profile?.last_name
                      ? `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase()
                      : user.email?.charAt(0).toUpperCase()
                    }
                  </span>
                </div>
                <span className="text-sm text-zinc-300">
                  {profile?.first_name && profile?.last_name
                    ? `${profile.first_name} ${profile.last_name}`
                    : user.email
                  }
                </span>
              </div>
              <SignOutButton />
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}