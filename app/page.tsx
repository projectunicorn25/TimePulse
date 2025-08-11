import Link from 'next/link'
import { supabaseServer } from '@/lib/supabaseServer'
import AuthenticatedHome from './AuthenticatedHome'
import { AuroraBackground } from '@/components/ui/aurora-background'
import { HeroSection } from '@/components/HeroSection'

export default async function Home() {
  const supabase = await supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    return <AuthenticatedHome email={user.email!} role={profile?.role || null} />
  }

  return (
    <AuroraBackground>
      <HeroSection />
    </AuroraBackground>
  )
}