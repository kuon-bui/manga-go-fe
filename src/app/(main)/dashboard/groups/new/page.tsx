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
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Tạo Nhóm Dịch</h1>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-card p-6">
        <div className="space-y-1">
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
            Slug: <code className="rounded bg-muted px-1">{slug}</code>
          </p>
        )}

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Huỷ
          </Button>
          <Button type="submit" disabled={!name.trim() || createMutation.isPending}>
            {createMutation.isPending
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang tạo…</>
              : 'Tạo nhóm'}
          </Button>
        </div>
      </form>

      <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Lưu ý</p>
        <p className="mt-1">Bạn cần có nhóm dịch mới có thể đăng truyện. Sau khi tạo nhóm, bạn sẽ là quản trị viên và có thể đăng truyện ngay.</p>
      </div>
    </div>
  )
}
