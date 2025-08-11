import Link from 'next/link'

type Props = {
  email: string
  role: string | null
}

export default function AuthenticatedHome({ email, role }: Props) {
  return (
    <div className="grid place-items-center min-h-[60vh]">
      <div className="text-center space-y-6 animate-slide-up">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-brand-400 to-blue-400 bg-clip-text text-transparent">
            Welcome back!
          </h1>
          <p className="text-xl text-zinc-400">
            {email}
          </p>
          {role && (
            <p className="text-sm text-zinc-400">
              Role: <span className="text-brand-400 font-medium">{role}</span>
            </p>
          )}
        </div>
        
        <div className="flex gap-3 justify-center pt-4">
          <Link href="/dashboard" className="btn px-6 py-3">
            Open Dashboard
          </Link>
          {role === 'manager' && (
            <Link href="/admin" className="btn-secondary px-6 py-3">
              Manager View
            </Link>
          )}
        </div>

        <div className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <div className="card p-5 space-y-3 glass-hover">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-base">Your Stats</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">View your weekly hours and project allocation</p>
          </div>
          <div className="card p-5 space-y-3 glass-hover">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="font-semibold text-base">Quick Entry</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">Log today&apos;s hours in just a few clicks</p>
          </div>
          <div className="card p-5 space-y-3 glass-hover">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <h3 className="font-semibold text-base">Reports</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">Export time tracking data for any period</p>
          </div>
        </div>
      </div>
    </div>
  )
}