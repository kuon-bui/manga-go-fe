'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { MangaPageUploader } from '@/components/dashboard/manga-page-uploader'
import { NovelChapterEditor } from '@/components/dashboard/novel-chapter-editor'
import { useMangaDetail } from '@/hooks/use-title-detail'
import { useUploadChapter } from '@/hooks/use-dashboard'

interface UploadChapterViewProps {
  titleId: string
}

function chapterSlug(number: string): string {
  return `chapter-${number.replace('.', '-')}`
}

export function UploadChapterView({ titleId }: UploadChapterViewProps) {
  const router = useRouter()
  // titleId is actually the comic slug from the URL
  const { data: manga, isLoading } = useMangaDetail(titleId)
  const uploadMutation = useUploadChapter()

  const [chapterNumber, setChapterNumber] = useState('')
  const [chapterTitle, setChapterTitle] = useState('')
  const [pages, setPages] = useState<string[]>([])
  const [novelContent, setNovelContent] = useState('')

  if (isLoading || !manga) {
    return <Skeleton className="h-64 w-full" />
  }

  const isManga = manga.type === 'manga'
  const comicSlug = manga.slug

  function handleSubmit() {
    if (!chapterNumber.trim()) {
      toast.error('Số chương là bắt buộc')
      return
    }
    if (isManga && pages.length === 0) {
      toast.error('Vui lòng upload ít nhất 1 trang')
      return
    }
    if (!isManga && !novelContent.trim()) {
      toast.error('Nội dung chương không được để trống')
      return
    }

    uploadMutation.mutate(
      {
        comicSlug,
        payload: {
          slug: chapterSlug(chapterNumber),
          number: chapterNumber,
          title: chapterTitle.trim() || '',
          pages: isManga ? pages : [],
        },
      },
      {
        onSuccess: () => {
          toast.success('Đã đăng chương thành công!')
          router.push(`/titles/${comicSlug}`)
        },
        onError: (err) => {
          toast.error(`Lỗi: ${err instanceof Error ? err.message : 'Không thể đăng chương'}`)
        },
      }
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Thêm Chương</h1>
        <p className="mt-1 text-sm text-muted-foreground">{manga.title}</p>
      </div>

      {/* Chapter meta */}
      <div className="grid grid-cols-2 gap-4 rounded-xl border bg-card p-5 sm:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="ch-number">Số chương <span className="text-destructive">*</span></Label>
          <Input
            id="ch-number"
            value={chapterNumber}
            onChange={(e) => setChapterNumber(e.target.value)}
            placeholder="vd: 42 hoặc 42.5"
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="ch-title">Tên chương</Label>
          <Input
            id="ch-title"
            value={chapterTitle}
            onChange={(e) => setChapterTitle(e.target.value)}
            placeholder="Không bắt buộc"
          />
        </div>
      </div>

      {chapterNumber && (
        <p className="text-xs text-muted-foreground">
          Slug: <code>{chapterSlug(chapterNumber)}</code>
        </p>
      )}

      <Separator />

      {/* Content */}
      {isManga ? (
        <MangaPageUploader pages={pages} onChange={setPages} />
      ) : (
        <NovelChapterEditor content={novelContent} onChange={setNovelContent} />
      )}

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.back()}>Huỷ</Button>
        <Button onClick={handleSubmit} disabled={uploadMutation.isPending}>
          {uploadMutation.isPending ? 'Đang đăng…' : 'Đăng chương'}
        </Button>
      </div>
    </div>
  )
}
