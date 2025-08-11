import { supabaseServer } from '@/lib/supabaseServer'
import AdminClient from './AdminClient'
import { redirect } from 'next/navigation'
import { formatTimePeriod, TimePeriod } from '@/lib/utils'

// Server-side function to get current time period
async function getCurrentTimePeriod(): Promise<TimePeriod | null> {
  try {
    const supabase = await supabaseServer()
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('time_periods')
      .select('*')
      .lte('start_date', today)
      .gte('end_date', today)
      .maybeSingle()

    if (error) {
      console.error('Error fetching current time period:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getCurrentTimePeriod:', error)
    return null
  }
}

export default async function AdminPage() {
  const supabase = await supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return (
      <div className="card p-6">
        <p>Please log in to view the admin panel.</p>
      </div>
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  // Redirect contractors to their dashboard
  if (profile?.role === 'contractor') {
    redirect('/dashboard')
  }

  if (profile?.role !== 'manager') {
    return (
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="text-zinc-400">You don&apos;t have manager permissions to view this page.</p>
      </div>
    )
  }

  // Get current time period for context
  const currentPeriod = await getCurrentTimePeriod()

  const { data: entries, error } = await supabase
    .from('time_entries')
    .select(`
      id,
      work_date,
      hours,
      note,
      status,
      manager_note,
      created_at,
      time_period_id,
      profiles!inner(email, first_name, last_name),
      projects(name),
      time_periods(period_name, start_date, end_date, deadline_date)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error loading time entries:', error)
  }

  const stats = {
    pending: entries?.filter(e => e.status === 'submitted').length ?? 0,
    approved: entries?.filter(e => e.status === 'approved').length ?? 0,
    rejected: entries?.filter(e => e.status === 'rejected').length ?? 0,
    total: entries?.length ?? 0,
    currentPeriod: currentPeriod ? entries?.filter(e => e.time_period_id === currentPeriod.id).length ?? 0 : 0
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Manager Dashboard</h1>
          <p className="text-zinc-400 mt-1 text-sm">Review and approve team time submissions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="card px-4 py-3 text-center">
            <div className="text-xl font-bold text-blue-400">{stats.pending}</div>
            <div className="text-xs text-zinc-400 uppercase tracking-wide">Pending</div>
          </div>
          <div className="card px-4 py-3 text-center">
            <div className="text-xl font-bold text-green-400">{stats.approved}</div>
            <div className="text-xs text-zinc-400 uppercase tracking-wide">Approved</div>
          </div>
          <div className="card px-4 py-3 text-center">
            <div className="text-xl font-bold text-zinc-100">{stats.total}</div>
            <div className="text-xs text-zinc-400 uppercase tracking-wide">Total</div>
          </div>
          {currentPeriod && (
            <div className="card px-4 py-3 text-center">
              <div className="text-xl font-bold text-brand-400">{stats.currentPeriod}</div>
              <div className="text-xs text-zinc-400 uppercase tracking-wide">Current Period</div>
              <div className="text-xs text-zinc-500 mt-1">
                {formatTimePeriod(currentPeriod)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin Client */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          Time Entries ({entries?.length || 0})
        </h2>
        <AdminClient initial={entries ?? []} />
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'