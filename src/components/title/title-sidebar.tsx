'use client'

import Link from 'next/link'
import { Users, User, Link2, StickyNote } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Manga } from '@/types'

/* ── Uploader card ──────────────────────────────────────────────────────────── */

function UploaderCard({ manga }: { manga: Manga }) {
  // No real uploader API — mock display using uploaderId initials or anonymous
  const hasUploaderId = Boolean(manga.uploaderId)
  const displayName   = hasUploaderId ? `User #${manga.uploaderId!.slice(0, 6)}` : 'Ẩn danh'
  const initials      = displayName.slice(0, 2).toUpperCase()

  return (
    <div className="cute-card p-4 flex flex-col gap-3">
      <h3 className="text-sm font-bold flex items-center gap-2 text-muted-foreground uppercase tracking-wide">
        <User className="h-3.5 w-3.5" />
        Người đăng
      </h3>
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 shrink-0 ring-2 ring-border">
          <AvatarImage src={undefined} alt={displayName} />
          <AvatarFallback className="text-xs font-bold bg-secondary text-secondary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{displayName}</p>
          <p className="text-xs text-muted-foreground">
            {manga.createdAt
              ? new Date(manga.createdAt).toLocaleDateString('vi-VN', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })
              : 'Không rõ ngày đăng'}
          </p>
        </div>
      </div>
    </div>
  )
}

/* ── Translation group card ─────────────────────────────────────────────────── */

function GroupCard({ group }: { group: NonNullable<Manga['translationGroup']> }) {
  return (
    <div className="cute-card p-4 flex flex-col gap-3">
      <h3 className="text-sm font-bold flex items-center gap-2 text-muted-foreground uppercase tracking-wide">
        <Users className="h-3.5 w-3.5" />
        Nhóm dịch
      </h3>
      <Link
        href={`/groups/${group.slug}`}
        className="flex items-center gap-3 group"
      >
        <div className="h-10 w-10 shrink-0 rounded-xl overflow-hidden bg-muted ring-2 ring-border flex items-center justify-center">
          <Users className="h-5 w-5 text-muted-foreground/50" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold group-hover:text-primary transition-colors truncate">
            {group.name}
          </p>
          <p className="text-xs text-muted-foreground">Xem trang nhóm →</p>
        </div>
      </Link>
    </div>
  )
}

/* ── Notes / share card ─────────────────────────────────────────────────────── */

function NotesCard({ manga }: { manga: Manga }) {
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/titles/${manga.slug}`
    : `/titles/${manga.slug}`

  return (
    <div className="cute-card p-4 flex flex-col gap-3">
      <h3 className="text-sm font-bold flex items-center gap-2 text-muted-foreground uppercase tracking-wide">
        <StickyNote className="h-3.5 w-3.5" />
        Ghi chú
      </h3>

      {/* QR placeholder */}
      <div className="flex flex-col items-center gap-2 rounded-xl bg-muted/60 border border-border/60 p-4">
        <div className="grid grid-cols-7 grid-rows-7 gap-px w-20 h-20 opacity-60">
          {/* Decorative QR-like grid */}
          {Array.from({ length: 49 }).map((_, i) => (
            <div
              key={i}
              className={`rounded-[1px] ${
                // corner blocks
                (i < 7 && (i % 7 < 3 || i % 7 > 3)) ||
                (i >= 42 && (i % 7 < 3 || i % 7 > 3)) ||
                (i % 7 === 0 && Math.floor(i / 7) < 3) ||
                (i % 7 === 0 && Math.floor(i / 7) > 3) ||
                // random fill
                [8, 10, 12, 15, 17, 19, 22, 24, 26, 29, 31, 33, 36, 38, 40].includes(i)
                  ? 'bg-foreground'
                  : 'bg-transparent'
              }`}
            />
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground text-center leading-snug">
          Quét để đọc trên thiết bị khác
        </p>
      </div>

      {/* Share link */}
      <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background px-3 py-2">
        <Link2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="text-[11px] text-muted-foreground truncate flex-1">{shareUrl}</span>
        <button
          onClick={() => navigator.clipboard?.writeText(shareUrl)}
          className="shrink-0 text-[10px] font-semibold text-primary hover:underline"
        >
          Copy
        </button>
      </div>

      {/* Static note from uploader - only show if description is short so we have space */}
      {manga.tags && manga.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {manga.tags.slice(0, 6).map((tag) => (
            <span
              key={tag.id}
              className="rounded-full bg-accent/40 text-accent-foreground px-2 py-0.5 text-[10px] font-medium"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Sidebar container ──────────────────────────────────────────────────────── */

interface TitleSidebarProps {
  manga: Manga
}

export function TitleSidebar({ manga }: TitleSidebarProps) {
  return (
    <div className="flex flex-col gap-4">
      <UploaderCard manga={manga} />
      {manga.translationGroup && (
        <GroupCard group={manga.translationGroup} />
      )}
      <NotesCard manga={manga} />
    </div>
  )
}
