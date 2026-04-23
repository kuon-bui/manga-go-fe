import Link from 'next/link'
import { Search, BookOpen, Sparkles, TrendingUp, BookMarked, Heart, Star } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-primary/20 via-secondary/15 to-accent/20">
      {/* Animated background blobs */}
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-gradient-to-br from-primary/25 to-secondary/20 blur-3xl animate-pulse"
        aria-hidden
        style={{ animationDuration: '5s' }}
      />
      <div
        className="pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-gradient-to-br from-accent/25 to-secondary/15 blur-3xl animate-pulse"
        aria-hidden
        style={{ animationDuration: '7s', animationDelay: '1.5s' }}
      />

      {/* Decorative floating icons */}
      <Sparkles className="pointer-events-none absolute left-[55%] top-6 h-5 w-5 rotate-12 text-primary/30" aria-hidden />
      <Star className="pointer-events-none absolute right-[20%] top-12 h-4 w-4 -rotate-6 text-secondary/40" aria-hidden />
      <Heart className="pointer-events-none absolute left-[48%] bottom-8 h-4 w-4 rotate-6 text-primary/25" aria-hidden />
      <Sparkles className="pointer-events-none absolute right-[35%] bottom-4 h-3 w-3 text-accent-foreground/20" aria-hidden />

      <div className="relative flex flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:gap-12 md:px-12 md:py-16">
        {/* Text content */}
        <div className="flex-1 space-y-5">
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Miễn phí · Không quảng cáo
            </span>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '80ms' }}>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground md:text-4xl lg:text-5xl">
              Đọc manga &amp; tiểu thuyết
              <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
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
            <Button size="lg" asChild className="shadow-sakura hover:shadow-sakura transition-shadow">
              <Link href="/browse">
                <BookOpen className="mr-1.5 h-4 w-4" />
                Khám phá ngay
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-border/60 hover:border-primary/40 hover:bg-primary/10 hover:text-primary">
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
            className="-rotate-6 opacity-65 hover:opacity-90 hover:-translate-y-1"
            gradient="from-[hsl(280_65%_75%)] to-[hsl(280_60%_60%)]"
            label="Fantasy"
          />
          <CoverCard
            className="z-10 scale-105 shadow-sakura"
            gradient="from-primary to-[hsl(340_70%_55%)]"
            label="Action"
          />
          <CoverCard
            className="rotate-6 opacity-65 hover:opacity-90 hover:-translate-y-1"
            gradient="from-[hsl(160_55%_60%)] to-[hsl(160_50%_45%)]"
            label="Romance"
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
}: {
  className?: string
  gradient: string
  label: string
}) {
  return (
    <div
      className={`relative h-56 w-36 overflow-hidden rounded-2xl border border-white/25 bg-gradient-to-b ${gradient} transition-all duration-300 ${className ?? ''}`}
    >
      {/* Shine overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
      {/* Heart/sparkle decoration */}
      <Heart className="absolute right-2 top-3 h-4 w-4 text-white/40 fill-white/20" />
      {/* Label */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-3 pb-2.5 pt-6 text-center text-xs font-bold text-white">
        {label}
      </div>
      {/* Fake cover lines texture */}
      <div className="absolute inset-4 space-y-2 opacity-15">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-1.5 rounded-full bg-white" style={{ width: `${60 + (i % 4) * 10}%` }} />
        ))}
      </div>
    </div>
  )
}
