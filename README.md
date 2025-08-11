# TimePulse - Professional Time Tracking

Modern time tracking application with real-time collaboration, built with Next.js 14, Supabase, and Tailwind CSS.

## Features

- **Time Tracking**: Log hours in quarter-hour increments
- **Realtime Updates**: Managers see submissions instantly via WebSocket
- **Approval Workflow**: Submit → Approve/Reject with audit trail
- **Secure RLS**: Role-based access with proper security policies
- **Professional Dark Theme**: Beautiful glassmorphism design
- **Analytics**: Weekly totals, project allocation, status tracking
- **Production Ready**: Middleware auth, validation, error handling

## Setup

1. **Clone and install dependencies**
```bash
npm install
```

2. **Configure environment variables**
```bash
cp .env.example .env.local
```

Add your Supabase credentials:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_ROLE`: Service role key (keep secure!)
- `NEXT_PUBLIC_SITE_URL`: Your site URL (http://localhost:3000 for dev)

3. **Run database migrations**

In your Supabase SQL editor, run the contents of `supabase.sql`

4. **Start development server**
```bash
npm run dev
```

5. **Create a manager account**

After creating your first account, promote it to manager:
```sql
UPDATE public.profiles 
SET role = 'manager' 
WHERE email = 'your-email@example.com';
```

## Key Improvements

### Security
- ✅ Fixed RLS policies - contractors can't approve their own entries
- ✅ Middleware protection for routes
- ✅ Service role key protection
- ✅ Complete audit trail

### Data Integrity
- ✅ Quarter-hour validation (0.25 increments)
- ✅ Performance indexes for fast queries
- ✅ Updated_at timestamps
- ✅ Event logging for all actions

### UX Enhancements
- ✅ Optimistic UI updates with toast notifications
- ✅ Bulk approve for managers
- ✅ Filter by status
- ✅ Group by user/date
- ✅ Weekly totals
- ✅ Rejection reasons
- ✅ Loading states

## Project Structure

```
app/
├── (auth)/         # Authentication pages
├── admin/          # Manager dashboard
├── dashboard/      # Contractor dashboard
├── actions.ts      # Server actions with Zod
├── layout.tsx      # Root layout with nav
└── providers.tsx   # Theme & toast providers

components/
├── ThemeToggle.tsx # Dark/light mode
└── SignOutButton.tsx

lib/
├── supabaseClient.ts  # Browser client
├── supabaseServer.ts  # Server client
└── validation.ts      # Zod schemas

middleware.ts       # Route protection
supabase.sql       # Database schema
```

## Deployment

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Update Supabase Auth redirect URLs
5. Run migrations in production

## Development Commands

```bash
npm run dev    # Start dev server
npm run build  # Build for production
npm run start  # Start production server
npm run lint   # Run ESLint
```

## License

MIT