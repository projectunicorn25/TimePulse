import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Time periods utilities (client-side only)
import { supabaseBrowser } from './supabaseClient'

export interface TimePeriod {
  id: string
  period_name: string
  start_date: string
  end_date: string
  deadline_date: string
  payday_date: string
  year: number
  period_number: number
}

/**
 * Get all time periods, optionally filtered by year
 */
export async function getTimePeriods(year?: number): Promise<TimePeriod[]> {
  const supabase = supabaseBrowser()

  let query = supabase
    .from('time_periods')
    .select('*')
    .order('start_date', { ascending: true })

  if (year) {
    query = query.eq('year', year)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching time periods:', error)
    return []
  }

  return data || []
}

/**
 * Get the current time period based on today's date
 */
export async function getCurrentTimePeriod(): Promise<TimePeriod | null> {
  const supabase = supabaseBrowser()
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format

  const { data, error } = await supabase
    .from('time_periods')
    .select('*')
    .lte('start_date', today)
    .gte('end_date', today)
    .single()

  if (error) {
    console.error('Error fetching current time period:', error)
    return null
  }

  return data
}

/**
 * Get time period by ID
 */
export async function getTimePeriodById(id: string): Promise<TimePeriod | null> {
  const supabase = supabaseBrowser()

  const { data, error } = await supabase
    .from('time_periods')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching time period:', error)
    return null
  }

  return data
}

/**
 * Get time period that contains a specific date
 */
export async function getTimePeriodForDate(date: string): Promise<TimePeriod | null> {
  const supabase = supabaseBrowser()

  const { data, error } = await supabase
    .from('time_periods')
    .select('*')
    .lte('start_date', date)
    .gte('end_date', date)
    .single()

  if (error) {
    console.error('Error fetching time period for date:', error)
    return null
  }

  return data
}

/**
 * Format a time period for display
 */
export function formatTimePeriod(period: TimePeriod): string {
  return period.period_name
}

/**
 * Format a time period with additional details
 */
export function formatTimePeriodDetailed(period: TimePeriod): string {
  const startDate = new Date(period.start_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
  const endDate = new Date(period.end_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
  const deadline = new Date(period.deadline_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })

  return `${startDate} - ${endDate} (Due: ${deadline})`
}

/**
 * Check if a date is within a time period
 */
export function isDateInPeriod(date: string, period: TimePeriod): boolean {
  return date >= period.start_date && date <= period.end_date
}

/**
 * Get the status of a time period relative to today
 */
export function getTimePeriodStatus(period: TimePeriod): 'past' | 'current' | 'future' {
  const today = new Date().toISOString().split('T')[0]

  if (today < period.start_date) {
    return 'future'
  } else if (today > period.end_date) {
    return 'past'
  } else {
    return 'current'
  }
}

/**
 * Check if deadline has passed for a time period
 */
export function isDeadlinePassed(period: TimePeriod): boolean {
  const today = new Date().toISOString().split('T')[0]
  return today > period.deadline_date
}

/**
 * Get days remaining until deadline
 */
export function getDaysUntilDeadline(period: TimePeriod): number {
  const today = new Date()
  const deadline = new Date(period.deadline_date)
  const diffTime = deadline.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

/**
 * Get recent and upcoming time periods for dropdown
 */
export async function getRelevantTimePeriods(): Promise<TimePeriod[]> {
  const supabase = supabaseBrowser()
  const today = new Date()
  const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate())
  const threeMonthsFromNow = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate())

  const { data, error } = await supabase
    .from('time_periods')
    .select('*')
    .gte('end_date', threeMonthsAgo.toISOString().split('T')[0])
    .lte('start_date', threeMonthsFromNow.toISOString().split('T')[0])
    .order('start_date', { ascending: true })

  if (error) {
    console.error('Error fetching relevant time periods:', error)
    return []
  }

  return data || []
}


