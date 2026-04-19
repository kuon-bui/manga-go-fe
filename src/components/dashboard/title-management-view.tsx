'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Edit2, Trash2, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { format, isValid } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { SafeImage as Image } from '@/components/ui/safe-image'
import { TitleEditModal } from '@/components/dashboard/title-edit-modal'
import { useMangaDetail, useChapterList } from '@/hooks/use-title-detail'
import { usePublishComic, useDeleteComic, useDeleteChapter } from '@/hooks/use-dashboard'

interface TitleManagementViewProps {
  titleSlug: string
}

export function TitleManagementView({ titleSlug }: TitleManagementViewProps) {
  const router = useRouter()
  
  const { data: title, isLoading: titleLoading } = useMangaDetail(titleSlug)
  const { data: chaptersRes, isLoading: chaptersLoading } = useChapterList(titleSlug)
  
  const publishMutation = usePublishComic()
  const deleteComicMutation = useDeleteComic()
  const deleteChapterMutation = useDeleteChapter(titleSlug)

  const [deletingChapter, setDeletingChapter] = useState<string | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)

  function handleTogglePublish() {
    if (!title) return
    const isCurrentlyPublished = title.isPublished
    const newStatus = !isCurrentlyPublished
    
    publishMutation.mutate(
      { slug: titleSlug, isPublished: newStatus },
      {
        onSuccess: () => {
          toast.success(newStatus ? 'Đã xuất bản truyện' : 'Đã ẩn truyện')
        },
        onError: () => toast.error('Lỗi khi thay đổi trạng thái')
      }
    )
  }

  function handleDeleteTitle() {
    if (!confirm('Bạn có chắc xoá toàn bộ truyện này không? Hành động này không thể hoàn tác.')) return
    
    deleteComicMutation.mutate(titleSlug, {
      onSuccess: () => {
        toast.success('Đã xoá truyện')
        router.push('/dashboard')
      },
      onError: () => toast.error('Không thể xoá truyện')
    })
  }

  function handleDeleteChapter(chapterSlug: string) {
    if (!confirm('Xoá chương này? Không thể khôi phục.')) return
    setDeletingChapter(chapterSlug)
    deleteChapterMutation.mutate(chapterSlug, {
      onSuccess: () => {
        toast.success('Đã xoá chương')
      },
      onError: (err) => {
        toast.error(`Không thể xoá: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`)
      },
      onSettled: () => setDeletingChapter(null)
    })
  }

  if (titleLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!title) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Không tìm thấy truyện</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/dashboard">Quay lại Dashboard</Link>
        </Button>
      </div>
    )
  }

  const chapters = chaptersRes?.data ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Quản lý nội dung</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setEditModalOpen(true)}
          >
            <Edit2 className="mr-1.5 h-4 w-4" />
            Chỉnh sửa
          </Button>
          <Button 
            variant="outline" 
            onClick={handleTogglePublish}
            disabled={publishMutation.isPending}
          >
            {publishMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : title.isPublished ? (
              <><EyeOff className="mr-2 h-4 w-4" /> Ẩn Truyện</>
            ) : (
              <><Eye className="mr-2 h-4 w-4" /> Xuất bản</>
            )}
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDeleteTitle}
            disabled={deleteComicMutation.isPending}
          >
            {deleteComicMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Trash2 className="mr-1.5 h-4 w-4" /> Xoá</>}
          </Button>
        </div>
      </div>

      {/* Meta Card */}
      <section className="flex items-start gap-5 rounded-xl border bg-card p-5 dark:border-border">
        <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-md border text-muted-foreground dark:border-border">
          {title.thumbnail ? (
            <Image src={title.thumbnail} alt={title.title} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs">No Cover</div>
          )}
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-foreground">{title.title}</h2>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <Badge variant={title.type as any}>{title.type}</Badge>
            <Badge variant="outline">{title.status}</Badge>
            {title.isPublished ? (
              <Badge variant="secondary" className="bg-green-500/10 text-green-600">Đang xuất bản</Badge>
            ) : (
              <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600">Lưu nháp</Badge>
            )}
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">{title.description || 'Chưa phân loại'}</p>
        </div>
      </section>

      {/* Chapters */}
      <section className="space-y-4 rounded-xl border bg-card p-5 dark:border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">
            Danh sách chương ({chapters.length})
          </h3>
          <Button asChild size="sm">
            <Link href={`/dashboard/upload/chapter/${titleSlug}`}>
              <Plus className="mr-1.5 h-4 w-4" /> Đăng chương mới
            </Link>
          </Button>
        </div>

        {chaptersLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : chapters.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground border border-dashed rounded-lg">
            Chưa có đoạn chương nào. Bắt đầu đăng ngay!
          </p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Chương</TableHead>
                  <TableHead>Tên Chương</TableHead>
                  <TableHead>Thêm lúc</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chapters.map((ch) => (
                  <TableRow key={ch.id}>
                    <TableCell className="font-semibold text-foreground">
                      Chương {ch.number}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {ch.title || <span className="italic opacity-50">Không tiêu đề</span>}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {ch.uploadedAt && isValid(new Date(ch.uploadedAt)) ? format(new Date(ch.uploadedAt), 'dd/MM/yyyy HH:mm') : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {/* Currently edit navigates back to upload view? We'd ideally have an edit view. */}
                        <Button variant="ghost" size="icon" disabled title="Chức năng Sửa đang nâng cấp">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteChapter(ch.slug)}
                          disabled={deletingChapter === ch.slug}
                        >
                          {deletingChapter === ch.slug ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      {/* Edit modal */}
      {title && (
        <TitleEditModal 
          title={title} 
          open={editModalOpen} 
          onOpenChange={setEditModalOpen}
        />
      )}
    </div>
  )
}
