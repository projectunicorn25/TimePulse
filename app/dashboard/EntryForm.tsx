'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
// TimePeriodSelect component inline for now
import { TimePeriod, getRelevantTimePeriods, getCurrentTimePeriod, formatTimePeriodDetailed, getTimePeriodStatus, getDaysUntilDeadline } from '@/lib/utils'
import { useEffect } from 'react'

interface TimePeriodSelectProps {
  value?: string
  onChange: (timePeriodId: string) => void
  disabled?: boolean
  className?: string
  autoSelectCurrent?: boolean
}

function TimePeriodSelect({
  value,
  onChange,
  disabled = false,
  className = '',
  autoSelectCurrent = true
}: TimePeriodSelectProps) {
  const [timePeriods, setTimePeriods] = useState<TimePeriod[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPeriod, setCurrentPeriod] = useState<TimePeriod | null>(null)

  useEffect(() => {
    async function loadTimePeriods() {
      setLoading(true)
      try {
        const [periods, current] = await Promise.all([
          getRelevantTimePeriods(),
          getCurrentTimePeriod()
        ])

        setTimePeriods(periods)
        setCurrentPeriod(current)

        // Auto-select current period if no value is set and autoSelectCurrent is true
        if (autoSelectCurrent && !value && current) {
          onChange(current.id)
        }
      } catch (error) {
        console.error('Error loading time periods:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTimePeriods()
  }, [autoSelectCurrent, value, onChange])

  if (loading) {
    return (
      <div className="relative">
        <select
          disabled
          className={`input ${className}`}
        >
          <option>Loading time periods...</option>
        </select>
      </div>
    )
  }

  return (
    <div className="relative">
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`input ${className}`}
        required
      >
        <option value="">Select time period...</option>
        {timePeriods.map((period) => {
          const status = getTimePeriodStatus(period)
          const daysUntilDeadline = getDaysUntilDeadline(period)
          const isCurrentPeriod = currentPeriod?.id === period.id

          let displayText = formatTimePeriodDetailed(period)
          if (isCurrentPeriod) {
            displayText += ` • Current Period`
          } else if (status === 'future') {
            displayText += ` • Upcoming`
          } else if (status === 'past') {
            displayText += ` • Past`
          }

          if (status === 'current' && daysUntilDeadline <= 3) {
            displayText += ` • ${daysUntilDeadline} day${daysUntilDeadline !== 1 ? 's' : ''} until deadline`
          }

          return (
            <option
              key={period.id}
              value={period.id}
              className={
                isCurrentPeriod ? 'font-semibold' :
                status === 'past' ? 'text-zinc-500' : ''
              }
            >
              {displayText}
            </option>
          )
        })}
      </select>
    </div>
  )
}

type Project = {
  id: string
  name: string
}

type Props = {
  projects: Project[]
  todayDate: string
  addEntry: (formData: FormData) => Promise<{ success: boolean; error?: string }>
}

export default function EntryForm({ projects, todayDate, addEntry }: Props) {
  const [loading, setLoading] = useState(false)
  const [hours, setHours] = useState('8')
  const [timePeriodId, setTimePeriodId] = useState('')

  // Get the AI Startup project ID as default
  const aiStartupProject = projects.find(p => p.name === 'AI Startup')
  const defaultProjectId = aiStartupProject?.id || ''

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    try {
      const result = await addEntry(formData)
      if (result.success) {
        toast.success('Entry added successfully')
        const form = document.getElementById('entry-form') as HTMLFormElement
        form.reset()
        setHours('8')
      } else {
        toast.error(result.error || 'Failed to add entry')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const quickHours = [0.25, 0.5, 1, 2, 4, 8]

  return (
    <form
      id="entry-form"
      action={handleSubmit}
      className="card p-5 space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-2">
          <label htmlFor="work_date" className="block text-sm font-medium text-zinc-300">
            Date
          </label>
          <input
            name="work_date"
            id="work_date"
            type="date"
            defaultValue={todayDate}
            required
            className="input"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="time_period_id" className="block text-sm font-medium text-zinc-300">
            Pay Period
          </label>
          <TimePeriodSelect
            value={timePeriodId}
            onChange={setTimePeriodId}
            disabled={loading}
            className="w-full"
          />
          <input
            name="time_period_id"
            type="hidden"
            value={timePeriodId}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="hours" className="block text-sm font-medium text-zinc-300">
            Hours
          </label>
          <input
            name="hours"
            id="hours"
            type="number"
            step="0.25"
            min="0"
            max="24"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder="8.0"
            required
            className="input"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="project_id" className="block text-sm font-medium text-zinc-300">
            Project
          </label>
          <select
            name="project_id"
            id="project_id"
            className="input"
            disabled={loading}
            defaultValue={defaultProjectId}
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
            {projects.length === 0 && (
              <option value="">No projects available</option>
            )}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="note" className="block text-sm font-medium text-zinc-300">
            Description
          </label>
          <input
            name="note"
            id="note"
            placeholder="What did you work on?"
            className="input"
            disabled={loading}
          />
        </div>
      </div>

      {/* Quick Hours and Submit */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-300">Quick Hours</label>
          <div className="flex flex-wrap gap-2">
            {quickHours.map(h => (
              <button
                key={h}
                type="button"
                onClick={() => setHours(h.toString())}
                className={`btn-secondary text-sm px-3 py-2 ${hours === h.toString() ? 'ring-2 ring-brand-500' : ''}`}
                disabled={loading}
              >
                {h}h
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="btn px-4 py-2 text-sm font-semibold"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Adding...
            </div>
          ) : (
            'Add Entry'
          )}
        </button>
      </div>
    </form>
  )
}