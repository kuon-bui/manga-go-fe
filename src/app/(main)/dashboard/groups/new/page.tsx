'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateGroup, titleToSlug } from '@/hooks/use-dashboard'

export default function NewGroupPage() {
  const router = useRouter()
  const createMutation = useCreateGroup()
  const [name, setName] = useState('')

  const slug = titleToSlug(name)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    createMutation.mutate({ name: name.trim(), slug }, {
      onSuccess: (group) => {
        toast.success(`Đã tạo nhóm "${group.name}"`)
        router.push(`/dashboard/groups/${group.slug}`)
      },
      onError: (err) => {
        toast.error(`Lỗi: ${err instanceof Error ? err.message : 'Không thể tạo nhóm'}`)
      },
    })
  }

  return (
    <div className="max-w-md space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold">Tạo Nhóm Dịch</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Thêm nhóm mới để bắt đầu đăng truyện.</p>
      </div>

      <form onSubmit={handleSubmit} className="cute-card p-5 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="group-name">Tên nhóm <span className="text-destructive">*</span></Label>
          <Input
            id="group-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="vd: Nhóm Dịch XYZ"
            required
          />
        </div>

        {name.trim() && (
          <p className="text-xs text-muted-foreground">
            Slug: <code className="rounded-md bg-muted px-1.5 py-0.5">{slug}</code>
          </p>
        )}

        <div className="flex gap-2 pt-1">
          <Button type="button" variant="outline" className="flex-1 rounded-full" onClick={() => router.back()}>
            Huỷ
          </Button>
          <Button type="submit" className="flex-1 rounded-full" disabled={!name.trim() || createMutation.isPending}>
            {createMutation.isPending
              ? <><Loader2 className="h-4 w-4 animate-spin" />Đang tạo…</>
              : 'Tạo nhóm'}
          </Button>
        </div>
      </form>

      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm">
        <p className="font-semibold text-foreground">Lưu ý</p>
        <p className="mt-1 text-muted-foreground">Bạn cần có nhóm dịch mới có thể đăng truyện. Sau khi tạo, bạn sẽ là quản trị viên của nhóm.</p>
      </div>
    </div>
  )
}
