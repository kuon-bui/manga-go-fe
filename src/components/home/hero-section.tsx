import Link from 'next/link'
import { Search, BookOpen, Sparkles, TrendingUp, BookMarked } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-primary/20 via-primary/8 to-background">
      {/* Animated background blobs */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-primary/15 blur-3xl animate-pulse"
        aria-hidden
        style={{ animationDuration: '4s' }}
      />
      <div
        className="pointer-events-none absolute -bottom-20 left-1/4 h-60 w-60 rounded-full bg-secondary/10 blur-3xl animate-pulse"
        aria-hidden
        style={{ animationDuration: '6s', animationDelay: '1s' }}
      />

      <div className="relative flex flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:gap-12 md:px-12 md:py-16">
        {/* Text content */}
        <div className="flex-1 space-y-5">
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/12 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Miễn phí · Không quảng cáo
            </span>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '80ms' }}>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground md:text-4xl lg:text-5xl">
              Đọc manga &amp; tiểu thuyết
              <br />
              <span className="bg-gradient-to-r from-primary to-secondary/80 bg-clip-text text-transparent">
                ngàn bộ, miễn phí
              </span>
            </h1>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '160ms' }}>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
              Cập nhật mỗi ngày bởi các nhóm dịch. Đọc trực tuyến trên mọi thiết bị, không cần đăng nhập.
            </p>
          </div>

          <div
            className="flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: '240ms' }}
          >
            <Button size="lg" asChild className="font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
              <Link href="/browse">
                <BookOpen className="mr-1.5 h-4 w-4" />
                Khám phá ngay
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-border/60 hover:border-primary/40">
              <Link href="/search">
                <Search className="mr-1.5 h-4 w-4" />
                Tìm kiếm
              </Link>
            </Button>
          </div>

          {/* Stats row */}
          <div
            className="flex items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: '320ms' }}
          >
            <Stat icon={<TrendingUp className="h-4 w-4 text-primary" />} label="1.000+ bộ" />
            <Stat icon={<BookMarked className="h-4 w-4 text-primary" />} label="Cập nhật hàng ngày" />
          </div>
        </div>

        {/* Decorative cover stack */}
        <div
          className="hidden select-none md:flex md:shrink-0 md:items-end md:gap-4 animate-in fade-in slide-in-from-right-6 duration-700"
          style={{ animationDelay: '200ms' }}
        >
          <CoverCard
            className="-rotate-6 opacity-60 hover:opacity-90 hover:-translate-y-1"
            gradient="from-violet-500 to-purple-700"
            label="Fantasy"
            delay="0ms"
          />
          <CoverCard
            className="z-10 scale-105 shadow-2xl shadow-primary/30"
            gradient="from-primary/80 to-blue-600"
            label="Action"
            delay="100ms"
          />
          <CoverCard
            className="rotate-6 opacity-60 hover:opacity-90 hover:-translate-y-1"
            gradient="from-rose-500 to-orange-500"
            label="Romance"
            delay="200ms"
          />
        </div>
      </div>
    </section>
  )
}

function Stat({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
      {icon}
      <span className="font-medium">{label}</span>
    </div>
  )
}

function CoverCard({
  className,
  gradient,
  label,
  delay,
}: {
  className?: string
  gradient: string
  label: string
  delay: string
}) {
  return (
    <div
      className={`relative h-56 w-36 overflow-hidden rounded-xl border border-white/15 bg-gradient-to-b ${gradient} transition-all duration-300 ${className ?? ''}`}
      style={{ animationDelay: delay }}
    >
      {/* Shine overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />

      {/* Label */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2.5 pt-6 text-center text-xs font-bold text-white">
        {label}
      </div>

      {/* Fake cover lines texture */}
      <div className="absolute inset-4 space-y-2 opacity-10">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-1.5 rounded-full bg-white" style={{ width: `${60 + (i % 4) * 10}%` }} />
        ))}
      </div>
    </div>
  )
}
