'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'
import { bulkApprove } from '../actions'

type Entry = {
  id: string
  work_date: string
  hours: number
  note: string | null
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  manager_note?: string | null
  created_at: string
  time_period_id?: string | null
  profiles: { email: string; first_name?: string; last_name?: string }[]
  projects: { name: string }[]
  time_periods?: { period_name: string; start_date: string; end_date: string; deadline_date: string }[]
}

export default function AdminClient({ initial }: { initial: Entry[] }) {
  const [rows, setRows] = useState<Entry[]>(initial)
  const [filter, setFilter] = useState<'all' | 'submitted' | 'approved' | 'rejected'>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const supabase = useMemo(() => supabaseBrowser(), [])

  const reload = useCallback(async () => {
    try {
      const { data, error } = await supabase
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
        toast.error('Failed to load time entries')
        return
      }

      setRows(data ?? [])
    } catch (error) {
      console.error('Unexpected error loading time entries:', error)
      toast.error('Failed to load time entries')
    }
  }, [supabase])

  useEffect(() => {
    const channel = supabase
      .channel('admin_time_entries')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'time_entries' 
      }, () => {
        reload()
        toast('New time entry update received')
      })
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, reload])

  async function handleBulkApprove() {
    if (selectedIds.size === 0) {
      toast.error('No entries selected')
      return
    }

    setLoading(true)
    try {
      const result = await bulkApprove(Array.from(selectedIds))
      if (result.success) {
        toast.success(`Approved ${selectedIds.size} entries`)
        setSelectedIds(new Set())
        // Trigger reload to refresh the data
        reload()
      } else {
        toast.error('Failed to approve entries')
      }
    } finally {
      setLoading(false)
    }
  }

  const filteredRows = filter === 'all' 
    ? rows 
    : rows.filter(r => r.status === filter)

  const submittedRows = filteredRows.filter(r => r.status === 'submitted')

  const groupedByUser = filteredRows.reduce((acc, entry) => {
    // Handle both array and object formats for profiles
    const profile = Array.isArray(entry.profiles) ? entry.profiles[0] : entry.profiles
    const firstName = profile?.first_name || ''
    const lastName = profile?.last_name || ''
    const email = profile?.email || 'Unknown'
    const fullName = firstName && lastName ? `${firstName} ${lastName}` : email
    const userKey = `${fullName}|${email}`

    if (!acc[userKey]) {
      acc[userKey] = []
    }
    acc[userKey].push(entry)
    return acc
  }, {} as Record<string, Entry[]>)

  return (
    <div className="space-y-6">
      {/* Filter and Actions Bar */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {(['all', 'submitted', 'approved', 'rejected'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`${filter === f ? 'btn' : 'btn-secondary'} relative`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === 'submitted' && submittedRows.length > 0 && (
                  <span className="ml-2 text-xs bg-blue-600 px-2 py-0.5 rounded-full font-semibold">
                    {submittedRows.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {selectedIds.size > 0 && (
            <button
              onClick={handleBulkApprove}
              className="btn flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Approving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Approve {selectedIds.size} Selected
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Entries by User */}
      <div className="space-y-6">
        {Object.entries(groupedByUser).map(([userKey, entries]) => {
          const userTotal = entries.reduce((sum, e) => sum + Number(e.hours), 0)
          const [displayName, email] = userKey.split('|')
          const profile = Array.isArray(entries[0]?.profiles) ? entries[0]?.profiles[0] : entries[0]?.profiles
          const initials = profile?.first_name && profile?.last_name
            ? `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase()
            : displayName.charAt(0).toUpperCase()

          // Calculate weekly and period totals for this user
          const weekStart = new Date()
          weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Start of current week (Sunday)
          const weekStartStr = weekStart.toISOString().split('T')[0]

          const weeklyTotal = entries
            .filter(e => e.work_date >= weekStartStr)
            .reduce((sum, e) => sum + Number(e.hours), 0)

          // Get current period entries for this user
          const currentPeriodEntries = entries.filter(e =>
            e.time_periods?.[0] &&
            e.time_periods[0].start_date <= new Date().toISOString().split('T')[0] &&
            e.time_periods[0].end_date >= new Date().toISOString().split('T')[0]
          )
          const periodTotal = currentPeriodEntries.reduce((sum, e) => sum + Number(e.hours), 0)

          return (
            <div key={userKey} className="card overflow-hidden">
              <div className="px-5 py-3 bg-gradient-to-r from-[rgb(var(--card))]/60 to-[rgb(var(--card))]/40 border-b border-[rgb(var(--border))] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                    <span className="text-xs font-semibold text-white">
                      {initials}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-zinc-100 text-sm">{displayName}</div>
                    {email && email !== displayName && (
                      <div className="text-xs text-zinc-400">{email}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-zinc-100">{weeklyTotal.toFixed(1)}h</div>
                    <div className="text-xs text-zinc-400">Week</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-brand-400">{periodTotal.toFixed(1)}h</div>
                    <div className="text-xs text-zinc-400">Period</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-zinc-100">{userTotal.toFixed(1)}h</div>
                    <div className="text-xs text-zinc-400">Total</div>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-[rgb(var(--border))]">
                {entries.map((entry) => (
                  <EntryRow
                    key={entry.id}
                    entry={entry}
                    selected={selectedIds.has(entry.id)}
                    onToggle={(id) => {
                      setSelectedIds(prev => {
                        const next = new Set(prev)
                        if (next.has(id)) {
                          next.delete(id)
                        } else {
                          next.add(id)
                        }
                        return next
                      })
                    }}
                    onStatusUpdate={reload}
                  />
                ))}
              </div>
            </div>
          )
        })}

        {filteredRows.length === 0 && (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-zinc-400 text-lg">No entries to display</p>
            <p className="text-zinc-500 text-sm mt-1">Try adjusting your filter or check back later</p>
          </div>
        )}
      </div>
    </div>
  )
}

function EntryRow({
  entry,
  selected,
  onToggle,
  onStatusUpdate
}: {
  entry: Entry
  selected: boolean
  onToggle: (id: string) => void
  onStatusUpdate: () => void
}) {
  async function setStatus(status: 'approved' | 'rejected', note?: string) {
    try {
      const res = await fetch(`/admin/api/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: entry.id, status, manager_note: note })
      })

      if (res.ok) {
        toast.success(`Entry ${status}`)
        // Trigger reload to refresh the data
        onStatusUpdate()
      } else {
        const errorData = await res.json()
        toast.error(errorData.error || `Failed to update status`)
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Network error occurred')
    }
  }

  return (
    <div className="p-4 hover:bg-[rgb(var(--card-hover))]/30 transition-all duration-200">
      <div className="flex items-start gap-3">
        {entry.status === 'submitted' && (
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggle(entry.id)}
            className="mt-1 w-4 h-4 rounded border-[rgb(var(--border))] bg-[var(--glass-bg)] text-brand-600 focus:ring-brand-500 focus:ring-offset-0"
          />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <span className="font-medium text-zinc-100 text-sm">
              {new Date(entry.work_date + 'T12:00:00').toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}
            </span>
            <span className="font-bold text-base text-brand-400">{Number(entry.hours).toFixed(1)}h</span>
            {entry.projects?.[0] && (
              <span className="text-xs px-2 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                {entry.projects[0].name}
              </span>
            )}
            {entry.time_periods?.[0] && (
              <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {entry.time_periods[0].period_name}
              </span>
            )}
            <span className={`badge badge-${entry.status}`}>
              {entry.status}
            </span>
          </div>
          {entry.note && (
            <div className="text-sm text-zinc-300 mt-2 p-2 rounded-lg bg-zinc-800/30 border border-zinc-700/50">
              {entry.note}
            </div>
          )}
          {entry.manager_note && (
            <div className="text-sm text-red-300 mt-2 p-2 rounded-lg bg-red-900/20 border border-red-500/30">
              <span className="font-medium">Manager Note:</span> {entry.manager_note}
            </div>
          )}
        </div>

        {entry.status === 'submitted' && (
          <div className="flex gap-2">
            <button
              onClick={() => setStatus('approved')}
              className="btn-secondary text-green-400 hover:text-green-300 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Approve
            </button>
            <button
              onClick={() => {
                const note = prompt('Rejection reason (optional):')
                if (note !== null) {
                  setStatus('rejected', note || undefined)
                }
              }}
              className="btn-secondary text-red-400 hover:text-red-300 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  )
}