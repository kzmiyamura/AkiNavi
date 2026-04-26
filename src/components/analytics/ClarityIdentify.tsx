'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    clarity: (command: string, ...args: string[]) => void
  }
}

export function ClarityIdentify({ email }: { email: string }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
      window.clarity('identify', email)
    }
  }, [email])

  return null
}
