'use server'
import { revalidatePath } from 'next/cache'
import { supabaseServer } from '@/lib/supabaseServer'
import { timeEntrySchema, updateStatusSchema } from '@/lib/validation'
import { z } from 'zod'

export async function addEntry(formData: FormData) {
  const supabase = await supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  try {
    const validatedData = timeEntrySchema.parse({
      work_date: formData.get('work_date'),
      hours: Number(formData.get('hours')),
      note: formData.get('note') || null,
      project_id: formData.get('project_id') || null,
      time_period_id: formData.get('time_period_id') || null,
    })

    // Validate that work_date is within the selected time period
    if (validatedData.time_period_id) {
      const { data: timePeriod } = await supabase
        .from('time_periods')
        .select('start_date, end_date, period_name')
        .eq('id', validatedData.time_period_id)
        .single()

      if (timePeriod) {
        const workDate = validatedData.work_date
        if (workDate < timePeriod.start_date || workDate > timePeriod.end_date) {
          return {
            success: false,
            error: `Work date must be within the selected pay period (${timePeriod.period_name})`
          }
        }
      }
    }

    const payload = {
      user_id: user.id,
      ...validatedData,
      status: 'draft' as const,
    }

    const { error } = await supabase.from('time_entries').insert(payload)
    if (error) throw error

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: 'Failed to add entry' }
  }
}

export async function updateStatus(id: string, status: 'submitted'|'approved'|'rejected', manager_note?: string) {
  const supabase = await supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  try {
    const validatedData = updateStatusSchema.parse({ id, status, manager_note })

    const updateData: any = { status: validatedData.status }
    if (validatedData.manager_note) {
      updateData.manager_note = validatedData.manager_note
    }

    const { error } = await supabase
      .from('time_entries')
      .update(updateData)
      .eq('id', validatedData.id)
    
    if (error) throw error
    
    revalidatePath('/dashboard')
    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: 'Failed to update status' }
  }
}

export async function deleteEntry(id: string) {
  const supabase = await supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('time_entries')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  
  revalidatePath('/dashboard')
  revalidatePath('/admin')
  return { success: true }
}

export async function bulkApprove(ids: string[]) {
  const supabase = await supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'manager') {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('time_entries')
    .update({ status: 'approved' })
    .in('id', ids)
    .eq('status', 'submitted')
  
  if (error) throw error
  
  revalidatePath('/admin')
  return { success: true }
}