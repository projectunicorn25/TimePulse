import Link from 'next/link'
import { supabaseServer } from '@/lib/supabaseServer'
import AuthenticatedHome from './AuthenticatedHome'
import AbstractBackground from '@/components/AbstractBackground'

export default async function Home() {
  const supabase = await supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    return <AuthenticatedHome email={user.email!} role={profile?.role || null} />
  }

  return (
    <>
      <AbstractBackground />
      <div className="relative z-10 min-h-[90vh] flex flex-col">
        {/* Hero Section */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center space-y-8 animate-slide-up max-w-4xl mx-auto">
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-bold gradient-text leading-tight">
                TimePulse
              </h1>
              <p className="text-lg md:text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed">
                Professional time tracking with real-time collaboration.
                <span className="block mt-1 text-base text-zinc-400">
                  Built for modern teams who value transparency and efficiency.
                </span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Link href="/signup" className="btn px-6 py-3 text-sm font-semibold">
                Start Tracking Time
              </Link>
              <Link href="/login" className="btn-secondary px-6 py-3 text-sm font-semibold">
                Sign In
              </Link>
            </div>

            <div className="text-sm text-zinc-400 pt-4">
              Already have an account?{' '}
              <Link href="/login" className="link font-medium">
                Sign In →
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="pb-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-zinc-100 mb-3">
                Everything you need for time tracking
              </h2>
              <p className="text-base text-zinc-400 max-w-2xl mx-auto">
                Powerful features designed for teams that value precision and transparency
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card p-6 space-y-3 glass-hover text-center">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg text-zinc-100">Precise Time Tracking</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Log hours in quarter-hour increments with project allocation and detailed notes
                </p>
              </div>

              <div className="card p-6 space-y-3 glass-hover text-center">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg text-zinc-100">Real-time Collaboration</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Managers see submissions instantly via WebSocket for immediate feedback
                </p>
              </div>

              <div className="card p-6 space-y-3 glass-hover text-center">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg text-zinc-100">Smart Approval Flow</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Streamlined approval process with audit trail and bulk operations
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}