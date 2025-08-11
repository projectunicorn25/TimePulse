'use client'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/components/AuthProvider'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          className: '',
          style: {
            background: 'rgb(15 15 17)',
            color: '#fff',
            border: '1px solid rgb(39 39 42)',
            borderRadius: '12px',
            backdropFilter: 'blur(16px)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </AuthProvider>
  )
}