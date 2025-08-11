import './globals.css'
import Providers from './providers'
import ConditionalNavbar from '@/components/ConditionalNavbar'

export const metadata = {
  title: 'TimePulse',
  description: 'Professional time tracking with real-time collaboration',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body>
        <Providers>
          <ConditionalNavbar />
          {children}
        </Providers>
      </body>
    </html>
  )
}