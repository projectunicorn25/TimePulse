import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    const loginUrl = new URL('/login', requestUrl.origin)
    loginUrl.searchParams.set('error', 'auth_failed')
    if (errorDescription) {
      loginUrl.searchParams.set('message', errorDescription)
    }
    return NextResponse.redirect(loginUrl)
  }

  if (code) {
    try {
      const cookieStore = await cookies()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) =>
                  cookieStore.set(name, value, options)
                )
              } catch (err) {
                console.error('Cookie setting error:', err)
              }
            },
          },
        }
      )
      
      const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!sessionError) {
        // Validate redirect URL to prevent open redirect vulnerability
        const validRedirects = ['/dashboard', '/admin', '/']
        const redirectPath = validRedirects.includes(next) ? next : '/dashboard'
        return NextResponse.redirect(new URL(redirectPath, requestUrl.origin))
      } else {
        console.error('Session exchange error:', sessionError)
        const loginUrl = new URL('/login', requestUrl.origin)
        loginUrl.searchParams.set('error', 'session_failed')
        return NextResponse.redirect(loginUrl)
      }
    } catch (err) {
      console.error('Callback processing error:', err)
      const loginUrl = new URL('/login', requestUrl.origin)
      loginUrl.searchParams.set('error', 'processing_failed')
      return NextResponse.redirect(loginUrl)
    }
  }

  // No code provided - redirect to login
  const loginUrl = new URL('/login', requestUrl.origin)
  loginUrl.searchParams.set('error', 'no_code')
  return NextResponse.redirect(loginUrl)
}