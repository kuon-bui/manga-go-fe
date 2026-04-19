'use client'

import { useState } from 'react'
import { Plus, Tags, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useGenres } from '@/hooks/use-manga'
import { apiClient } from '@/lib/api-client'
import { titleToSlug } from '@/hooks/use-dashboard'

export function GenreManager() {
  const qc = useQueryClient()
  const { data: genres, isLoading } = useGenres()
  const [open, setOpen] = useState(false)
  
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const computedSlug = titleToSlug(name)

  const createMutation = useMutation({
    mutationFn: () => apiClient.createGenre(name.trim(), computedSlug, description.trim() || undefined),
    onSuccess: () => {
      toast.success('Đã thêm thể loại mới!')
      setOpen(false)
      setName('')
      setDescription('')
      qc.invalidateQueries({ queryKey: ['genres', 'all'] })
    },
    onError: (err: any) => {
      toast.error(err.message || 'Lỗi khi tạo thể loại.')
    }
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    createMutation.mutate()
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Thể loại</h1>
          <p className="text-sm text-muted-foreground">Thêm và cài đặt danh mục cho các bộ truyện.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Thêm Thể loại
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm Thể loại Mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên thể loại</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Hành động, Tình cảm..." 
                />
                {name && (
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Slug: {computedSlug}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Mô tả (tùy chọn)</Label>
                <Textarea 
                  id="desc" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Giới thiệu về thể loại..." 
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={!name.trim() || createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Tạo Thể loại
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-xl bg-background overflow-hidden shadow-sm">
        <div className="p-4 border-b bg-muted/40 flex items-center justify-between text-sm font-medium">
          <span>Danh sách ({genres?.length || 0})</span>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Đang tải dữ liệu...</div>
        ) : !genres || genres.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center text-muted-foreground">
            <Tags className="h-8 w-8 mb-2 opacity-20" />
            <p>Chưa có thể loại nào trên hệ thống.</p>
          </div>
        ) : (
          <ul className="divide-y">
            {genres.map(g => (
              <li key={g.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/10 transition-colors">
                <div>
                  <h3 className="font-semibold text-foreground">{g.name}</h3>
                  {g.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{g.description}</p>}
                </div>
                <Badge variant="outline" className="font-mono bg-background shrink-0 w-fit">
                  {g.slug}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
