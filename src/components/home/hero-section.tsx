import Link from 'next/link'
import { Search, BookOpen, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-background border border-border/50">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-16 right-1/3 h-48 w-48 rounded-full bg-primary/5 blur-3xl" aria-hidden />

      <div className="relative flex flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:gap-12 md:px-10 md:py-14">
        {/* Text */}
        <div className="flex-1 space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Free to read · No ads
          </div>

          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Đọc manga &amp; tiểu thuyết
            <br />
            <span className="text-primary">ngàn bộ, miễn phí</span>
          </h1>

          <p className="max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
            Được cập nhật mỗi ngày bởi các nhóm dịch. Đọc online trên mọi thiết bị.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" asChild className="font-semibold">
              <Link href="/browse">
                <BookOpen className="mr-1.5 h-4 w-4" />
                Khám phá ngay
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/search">
                <Search className="mr-1.5 h-4 w-4" />
                Tìm kiếm
              </Link>
            </Button>
          </div>
        </div>

        {/* Decorative cover stack */}
        <div className="hidden select-none md:flex md:shrink-0 md:items-end md:gap-3">
          <CoverCard
            className="-rotate-6 opacity-60 hover:opacity-80"
            gradient="from-violet-500 to-purple-700"
            label="Fantasy"
          />
          <CoverCard
            className="z-10 scale-105 shadow-2xl"
            gradient="from-blue-500 to-primary"
            label="Action"
          />
          <CoverCard
            className="rotate-6 opacity-60 hover:opacity-80"
            gradient="from-rose-500 to-orange-500"
            label="Romance"
          />
        </div>
      </div>
    </section>
  )
}

function CoverCard({ className, gradient, label }: { className?: string; gradient: string; label: string }) {
  return (
    <div
      className={`relative h-52 w-36 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b ${gradient} transition-all duration-300 ${className ?? ''}`}
    >
      <div className="absolute bottom-0 left-0 right-0 bg-black/40 px-2 py-1.5 text-center text-xs font-semibold text-white">
        {label}
      </div>
      {/* Fake cover lines for visual texture */}
      <div className="absolute inset-4 opacity-10">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="mb-2 h-1.5 rounded-full bg-white" style={{ width: `${70 + (i % 3) * 10}%` }} />
        ))}
      </div>
    </div>
  )
}
