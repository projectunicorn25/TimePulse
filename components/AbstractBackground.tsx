'use client'
import { useEffect, useState } from 'react'

export default function AbstractBackground() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Pre-defined positions to avoid hydration mismatch
  const particles = [
    { left: 15, top: 25, delay: 2, duration: 25 },
    { left: 85, top: 15, delay: 5, duration: 30 },
    { left: 45, top: 75, delay: 1, duration: 35 },
    { left: 75, top: 45, delay: 8, duration: 28 },
    { left: 25, top: 85, delay: 3, duration: 32 },
    { left: 95, top: 35, delay: 6, duration: 26 },
    { left: 35, top: 55, delay: 4, duration: 38 },
    { left: 65, top: 25, delay: 7, duration: 24 },
    { left: 5, top: 65, delay: 9, duration: 33 },
    { left: 55, top: 5, delay: 2.5, duration: 29 },
    { left: 80, top: 80, delay: 1.5, duration: 31 },
    { left: 20, top: 40, delay: 6.5, duration: 27 },
    { left: 90, top: 60, delay: 4.5, duration: 36 },
    { left: 40, top: 20, delay: 8.5, duration: 23 },
    { left: 60, top: 90, delay: 3.5, duration: 34 },
    { left: 10, top: 50, delay: 7.5, duration: 22 },
    { left: 70, top: 10, delay: 5.5, duration: 37 },
    { left: 30, top: 70, delay: 9.5, duration: 21 },
    { left: 50, top: 30, delay: 1.8, duration: 39 },
    { left: 85, top: 75, delay: 6.8, duration: 25 }
  ]

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Main gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900"></div>

      {/* Animated gradient orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Geometric patterns */}
      <div className="absolute inset-0">
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
            </pattern>
            <linearGradient id="fadeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: 'rgba(124, 58, 237, 0.1)', stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: 'rgba(124, 58, 237, 0)', stopOpacity: 0}} />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <rect width="100%" height="100%" fill="url(#fadeGradient)" />
        </svg>
      </div>

      {/* Floating particles - only render on client */}
      {mounted && (
        <div className="absolute inset-0">
          {particles.map((particle, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-30 animate-pulse"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
              }}
            ></div>
          ))}
        </div>
      )}

      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-slate-900/50 to-slate-900"></div>
    </div>
  )
}
