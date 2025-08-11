'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '@/components/AuthProvider'



export default function SignOutButton() {
  const [loading, setLoading] = useState(false)
  const { signOut } = useAuth()
  
  async function handleSignOut() {
    console.log('SignOut button clicked')
    setLoading(true)
    try {
      console.log('Calling signOut function...')
      await signOut()
      console.log('SignOut completed successfully')
      // Don't show success toast since we're redirecting
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Failed to sign out')
      setLoading(false) // Only set loading false on error since we redirect on success
    }
  }
  
  return (
    <button
      className="btn-secondary px-4 py-2 text-sm font-medium flex items-center gap-2 cursor-pointer"
      onClick={handleSignOut}
      disabled={loading}
      type="button"
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin"></div>
          Signing out...
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </>
      )}
    </button>
  )
}