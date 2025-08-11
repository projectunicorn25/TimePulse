'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'

type Entry = {
  id: string
  work_date: string
  hours: number
  note: string | null
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  manager_note?: string | null
  projects?: { name: string } | null
}

type Props = {
  entries: Entry[]
  updateStatus: (id: string, status: 'submitted' | 'approved' | 'rejected') => Promise<{ success: boolean }>
  deleteEntry: (id: string) => Promise<{ success: boolean }>
}

export default function EntryList({ entries, updateStatus, deleteEntry }: Props) {
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set())

  async function handleSubmit(id: string) {
    setLoadingIds(prev => new Set(prev).add(id))
    try {
      const result = await updateStatus(id, 'submitted')
      if (result.success) {
        toast.success('Entry submitted for approval')
      } else {
        toast.error('Failed to submit entry')
      }
    } finally {
      setLoadingIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this entry?')) return
    
    setLoadingIds(prev => new Set(prev).add(id))
    try {
      const result = await deleteEntry(id)
      if (result.success) {
        toast.success('Entry deleted')
      } else {
        toast.error('Failed to delete entry')
      }
    } finally {
      setLoadingIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const groupedEntries = entries.reduce((acc, entry) => {
    if (!acc[entry.work_date]) {
      acc[entry.work_date] = []
    }
    acc[entry.work_date].push(entry)
    return acc
  }, {} as Record<string, Entry[]>)

  const sortedDates = Object.keys(groupedEntries).sort((a, b) => b.localeCompare(a))

  if (entries.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-zinc-400">No time entries yet. Add your first entry above!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sortedDates.map(date => {
        const dayEntries = groupedEntries[date]
        const dayTotal = dayEntries.reduce((sum, e) => sum + Number(e.hours), 0)
        
        return (
          <div key={date} className="card overflow-hidden">
            <div className="px-4 py-3 bg-zinc-900/40 border-b border-zinc-800 flex items-center justify-between">
              <div className="font-medium">
                {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
              <div className="text-sm text-zinc-400">
                Total: <span className="font-semibold text-zinc-100">{dayTotal.toFixed(2)}h</span>
              </div>
            </div>
            
            <ul className="divide-y divide-zinc-800">
              {dayEntries.map((entry) => {
                const isLoading = loadingIds.has(entry.id)
                
                return (
                  <li key={entry.id} className="p-4 hover:bg-zinc-900/20 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{Number(entry.hours).toFixed(2)}h</span>
                          {entry.projects && (
                            <span className="text-sm text-brand-400">{entry.projects.name}</span>
                          )}
                          <span className={`badge badge-${entry.status}`}>
                            {entry.status}
                          </span>
                        </div>
                        {entry.note && (
                          <div className="text-sm text-zinc-400 mt-1">{entry.note}</div>
                        )}
                        {entry.manager_note && (
                          <div className="text-sm text-red-400 mt-1">
                            Manager note: {entry.manager_note}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {entry.status === 'draft' && (
                          <>
                            <button 
                              onClick={() => handleSubmit(entry.id)}
                              className="btn-secondary text-sm"
                              disabled={isLoading}
                            >
                              {isLoading ? '...' : 'Submit'}
                            </button>
                            <button 
                              onClick={() => handleDelete(entry.id)}
                              className="btn-secondary text-sm text-red-400 hover:text-red-300"
                              disabled={isLoading}
                            >
                              Delete
                            </button>
                          </>
                        )}
                        {entry.status === 'submitted' && (
                          <button 
                            onClick={() => handleDelete(entry.id)}
                            className="btn-secondary text-sm text-red-400 hover:text-red-300"
                            disabled={isLoading}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </div>
  )
}