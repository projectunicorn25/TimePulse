import { z } from 'zod';

export const timeEntrySchema = z.object({
  work_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  hours: z.number()
    .min(0, 'Hours must be positive')
    .max(24, 'Hours cannot exceed 24')
    .refine(val => (val * 4) % 1 === 0, 'Hours must be in quarter-hour increments (0.25)'),
  note: z.string().max(500, 'Note too long').optional().nullable(),
  project_id: z.string().uuid().optional().nullable(),
  time_period_id: z.string().uuid().optional().nullable(),
});

export const updateStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['submitted', 'approved', 'rejected']),
  manager_note: z.string().max(500).optional(),
});

export const periodSchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
}).refine(data => new Date(data.end_date) >= new Date(data.start_date), {
  message: 'End date must be after start date',
});

export type TimeEntry = z.infer<typeof timeEntrySchema>;
export type UpdateStatus = z.infer<typeof updateStatusSchema>;
export type Period = z.infer<typeof periodSchema>;