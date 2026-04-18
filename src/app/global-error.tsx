'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <html lang="vi">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground text-center">
          <h1 className="text-4xl font-black text-destructive mb-2">Lỗi Hệ Thống Nghiêm Trọng</h1>
          <p className="text-muted-foreground mb-6">Xin lỗi, ứng dụng đã gặp sự cố không thể phục hồi.</p>
          <button
            onClick={() => reset()}
            className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
          >
            Thử lại
          </button>
        </div>
      </body>
    </html>
  )
}
