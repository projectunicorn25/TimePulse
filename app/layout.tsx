import './globals.css'
import Providers from './providers'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'TimePulse',
  description: 'Professional time tracking with real-time collaboration',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body>
        <Providers>
          <Navbar />
          <main className="container py-6">{children}</main>
        </Providers>
      </body>
    </html>
  )
}