import { supabaseServer } from '@/lib/supabaseServer'
import { addEntry, updateStatus, deleteEntry } from '../actions'
import EntryForm from './EntryForm'
import EntryList from './EntryList'
import { redirect } from 'next/navigation'
import { formatTimePeriod, getDaysUntilDeadline, TimePeriod } from '@/lib/utils'

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

function todayISO() {
  const d = new Date()
  const off = d.getTimezoneOffset()
  const local = new Date(d.getTime() - off * 60000)
  return local.toISOString().split('T')[0]
}

function weekStart() {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

export default async function Dashboard() {
  const supabase = await supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="card p-6">
        <p>Please log in to view your dashboard.</p>
      </div>
    )
  }

  // Check if user is a contractor (additional server-side protection)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'manager') {
    redirect('/admin')
  }

  if (!profile || profile.role !== 'contractor') {
    return (
      <div className="card p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-400 mb-2">Access Denied</h2>
          <p className="text-zinc-400">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    )
  }

  // Get current time period
  const currentPeriod = await getCurrentTimePeriod()

  const [entriesResult, projectsResult, periodTotalResult, weekTotalResult] = await Promise.all([
    supabase
      .from('time_entries')
      .select('*, projects(name), time_periods(period_name)')
      .eq('user_id', user.id)
      .order('work_date', { ascending: false })
      .limit(50),
    supabase
      .from('projects')
      .select('id, name')
      .eq('active', true)
      .order('name'),
    currentPeriod ? supabase
      .from('time_entries')
      .select('hours')
      .eq('user_id', user.id)
      .eq('time_period_id', currentPeriod.id) : Promise.resolve({ data: [] }),
    supabase
      .from('time_entries')
      .select('hours')
      .eq('user_id', user.id)
      .gte('work_date', weekStart())
  ])

  const entries = entriesResult.data ?? []
  const projects = projectsResult.data ?? []
  const periodTotal = periodTotalResult.data?.reduce((sum, e) => sum + Number(e.hours), 0) ?? 0
  const weekTotal = weekTotalResult.data?.reduce((sum, e) => sum + Number(e.hours), 0) ?? 0

  const draftCount = entries.filter(e => e.status === 'draft').length
  const submittedCount = entries.filter(e => e.status === 'submitted').length

  // Calculate days until deadline
  const daysUntilDeadline = currentPeriod ? getDaysUntilDeadline(currentPeriod) : null

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text">My Time Tracker</h1>
          <p className="text-zinc-400 mt-1 text-sm">Track your hours and manage your time entries</p>
        </div>

        {/* Stats Cards */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="card px-4 py-3 min-w-[120px]">
            <div className="text-center">
              <div className="text-xl font-bold text-zinc-100">{weekTotal.toFixed(1)}h</div>
              <div className="text-xs text-zinc-400 uppercase tracking-wide">
                Week Total
              </div>
              <div className="text-xs text-zinc-500 mt-1">
                This Week
              </div>
            </div>
          </div>

          <div className="card px-4 py-3 min-w-[140px]">
            <div className="text-center">
              <div className="text-xl font-bold text-brand-400">{periodTotal.toFixed(1)}h</div>
              <div className="text-xs text-zinc-400 uppercase tracking-wide">
                {currentPeriod ? 'Period Total' : 'Total Hours'}
              </div>
              {currentPeriod && (
                <div className="text-xs text-zinc-500 mt-1">
                  {formatTimePeriod(currentPeriod)}
                </div>
              )}
            </div>
          </div>

          {currentPeriod && daysUntilDeadline !== null && (
            <div className="card px-4 py-3 min-w-[120px]">
              <div className="text-center">
                <div className={`text-xl font-bold ${daysUntilDeadline <= 1 ? 'text-red-400' : daysUntilDeadline <= 3 ? 'text-yellow-400' : 'text-zinc-100'}`}>
                  {daysUntilDeadline}
                </div>
                <div className="text-xs text-zinc-400 uppercase tracking-wide">
                  Days Left
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  Until Deadline
                </div>
              </div>
            </div>
          )}

          {draftCount > 0 && (
            <div className="card px-4 py-3 min-w-[100px]">
              <div className="text-center">
                <div className="text-xl font-bold text-zinc-100">{draftCount}</div>
                <div className="text-xs text-zinc-400 uppercase tracking-wide">Drafts</div>
              </div>
            </div>
          )}

          {submittedCount > 0 && (
            <div className="card px-4 py-3 min-w-[100px]">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-400">{submittedCount}</div>
                <div className="text-xs text-zinc-400 uppercase tracking-wide">Pending</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Entry Form */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          Add Time Entry
        </h2>
        <EntryForm
          projects={projects}
          todayDate={todayISO()}
          addEntry={addEntry}
        />
      </div>

      {/* Recent Entries */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          Recent Entries
        </h2>
        <EntryList
          entries={entries}
          updateStatus={updateStatus}
          deleteEntry={deleteEntry}
        />
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'