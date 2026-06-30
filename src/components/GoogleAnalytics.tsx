'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

declare global {
  interface Window {
    gtag: (event: string, options: any) => void
  }
}

export default function GoogleAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (typeof window === 'undefined' || !window.gtag) return

    const url = pathname + searchParams.toString()
    window.gtag('event', 'page_view', {
      page_path: url,
    })
  }, [pathname, searchParams])

  return null
}
