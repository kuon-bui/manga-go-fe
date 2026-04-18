'use client'

import { useState, useEffect } from 'react'

export function useNovelProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function handleScroll() {
      const scrollY = window.scrollY
      const docHeight = document.documentElement.scrollHeight
      const winHeight = window.innerHeight

      const maxScroll = docHeight - winHeight
      if (maxScroll <= 0) {
        setProgress(100)
        return
      }

      const percentage = Math.min(100, Math.max(0, (scrollY / maxScroll) * 100))
      setProgress(percentage)
    }

    // Initial check
    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  return progress
}
