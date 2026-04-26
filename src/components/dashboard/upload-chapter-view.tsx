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
import { useUploadChapter, useUploadChapterImage } from '@/hooks/use-dashboard'

interface UploadChapterViewProps {
  titleSlug: string
}

function chapterSlug(number: string): string {
  return `chapter-${number.replace('.', '-')}`
}

export function UploadChapterView({ titleSlug }: UploadChapterViewProps) {
  const router = useRouter()
  const { data: manga, isLoading } = useMangaDetail(titleSlug)
  const uploadMutation = useUploadChapter()
  const uploadImageMutation = useUploadChapterImage()

  const [chapterNumber, setChapterNumber] = useState('')
  const [chapterTitle, setChapterTitle] = useState('')
  const [pages, setPages] = useState<File[]>([])
  const [novelContent, setNovelContent] = useState('')

  if (isLoading || !manga) {
    return <Skeleton className="h-64 w-full" />
  }

  const isManga = manga.type === 'manga'
  const comicSlug = manga.slug
  const comicId = manga.id

  async function handleSubmit() {
    const normalizedChapterNumber = chapterNumber.trim()

    if (!normalizedChapterNumber) {
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

    const generatedChapterSlug = chapterSlug(normalizedChapterNumber)

    try {
      const chapterPages = isManga
        ? await Promise.all(
          pages.map(async (file, pageIdx) => {
            const uploaded = await uploadImageMutation.mutateAsync({
              file,
              comicId,
              chapterSlug: generatedChapterSlug,
              pageIdx: pageIdx + 1, // pageIdx is 0-based, but we want to start from 1
            })
            return {
              pageType: 'image' as const,
              imageUrl: uploaded.url,
            }
          })
        )
        : [
          {
            pageType: 'text' as const,
            content: novelContent.trim(),
          },
        ]

      uploadMutation.mutate(
        {
          comicSlug,
          payload: {
            slug: generatedChapterSlug,
            number: normalizedChapterNumber,
            title: chapterTitle.trim() || `Chapter ${normalizedChapterNumber}`,
            pages: chapterPages,
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
    } catch {
      toast.error('Không thể upload dữ liệu chương')
    }
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
        <Button onClick={handleSubmit} disabled={uploadMutation.isPending || uploadImageMutation.isPending}>
          {uploadMutation.isPending || uploadImageMutation.isPending ? 'Đang đăng…' : 'Đăng chương'}
        </Button>
      </div>
    </div>
  )
}
