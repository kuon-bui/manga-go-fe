'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit2, Trash2, Users, BookOpen, ArrowRightLeft, Loader2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import { useUpdateGroup, useDeleteGroup, useGroupMembers, useUploadGroupLogo } from '@/hooks/use-groups'
import { useBrowse } from '@/hooks/use-manga'
import type { Group } from '@/types'

interface GroupManagementViewProps {
  groupSlug: string
}

export function GroupManagementView({ groupSlug }: GroupManagementViewProps) {
  const router = useRouter()
  const { data: group, isLoading } = useQuery<Group>({
    queryKey: queryKeys.dashboard.group(groupSlug),
    queryFn: () => apiClient.getTranslationGroup(groupSlug),
    enabled: Boolean(groupSlug),
  })

  const updateMutation = useUpdateGroup(groupSlug)
  const deleteMutation = useDeleteGroup()

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')

  function startEdit() {
    setName(group?.name ?? '')
    setEditing(true)
  }

  function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    updateMutation.mutate({ name: name.trim() }, {
      onSuccess: () => {
        toast.success('Đã cập nhật nhóm')
        setEditing(false)
      },
      onError: () => toast.error('Không thể cập nhật'),
    })
  }

  function handleDelete() {
    if (!confirm('Xoá nhóm này? Hành động không thể hoàn tác.')) return
    deleteMutation.mutate(groupSlug, {
      onSuccess: () => {
        toast.success('Đã xoá nhóm')
        router.push('/dashboard')
      },
      onError: () => toast.error('Không thể xoá nhóm'),
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    )
  }

  if (!group) {
    return <p className="text-muted-foreground">Không tìm thấy nhóm.</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="font-display text-2xl font-bold">{group.name}</h1>
        <div className="flex gap-2">
          <LogoUploadButton groupSlug={groupSlug} />
          <Button size="sm" variant="outline" onClick={startEdit}>
            <Edit2 className="mr-1.5 h-3.5 w-3.5" /> Sửa
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <><Trash2 className="mr-1.5 h-3.5 w-3.5" />Xoá</>}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard icon={<Users className="h-5 w-5" />} label="Thành viên" value={group.memberCount} />
        <StatCard icon={<BookOpen className="h-5 w-5" />} label="Truyện" value={group.titleCount} />
      </div>

      {/* Edit form */}
      {editing && (
        <section className="rounded-xl border bg-card p-5">
          <h2 className="mb-4 text-base font-semibold">Cập nhật nhóm</h2>
          <form onSubmit={handleUpdate} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="group-name">Tên nhóm</Label>
              <Input
                id="group-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Lưu'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                Huỷ
              </Button>
            </div>
          </form>
        </section>
      )}

      {/* Group Comics */}
      <GroupComicsSection groupSlug={groupSlug} />

      {/* Transfer ownership */}
      <TransferOwnershipSection groupSlug={groupSlug} />

      {/* Group Members & Invites */}
      <GroupMembersSection groupSlug={groupSlug} />
    </div>
  )
}

// ─── Logo upload button ───────────────────────────────────────────────────────

function LogoUploadButton({ groupSlug }: { groupSlug: string }) {
  const uploadMutation = useUploadGroupLogo(groupSlug)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    uploadMutation.mutate(file, {
      onSuccess: () => toast.success('Đã cập nhật logo nhóm'),
      onError: () => toast.error('Không thể upload logo'),
    })
    e.target.value = ''
  }

  return (
    <label className="cursor-pointer">
      <Button size="sm" variant="outline" asChild>
        <span>
          {uploadMutation.isPending
            ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            : <Upload className="mr-1.5 h-3.5 w-3.5" />}
          Logo
        </span>
      </Button>
      <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </label>
  )
}

// ─── Stats card ───────────────────────────────────────────────────────────────

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

// ─── Transfer ownership ───────────────────────────────────────────────────────

function TransferOwnershipSection({ groupSlug }: { groupSlug: string }) {
  const [newOwnerId, setNewOwnerId] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault()
    if (!newOwnerId.trim()) return
    setLoading(true)
    try {
      await apiClient.transferGroupOwnership(groupSlug, newOwnerId.trim())
      toast.success('Đã chuyển quyền sở hữu')
    } catch {
      toast.error('Không thể chuyển quyền')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-xl border bg-card p-5">
      <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
        <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
        Chuyển quyền sở hữu
      </h2>
      <form onSubmit={handleTransfer} className="flex gap-2">
        <Input
          value={newOwnerId}
          onChange={(e) => setNewOwnerId(e.target.value)}
          placeholder="User ID của chủ sở hữu mới"
          className="flex-1"
        />
        <Button type="submit" variant="outline" disabled={loading || !newOwnerId.trim()}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Chuyển'}
        </Button>
      </form>
    </section>
  )
}

// ─── Group Members ────────────────────────────────────────────────────────────

function GroupMembersSection({ groupSlug }: { groupSlug: string }) {
  const { data: members, isLoading } = useGroupMembers(groupSlug)

  const memberList = (members ?? []) as Array<{
    id: string
    name?: string
    role?: string
    user?: { id: string; name: string }
  }>

  return (
    <section className="rounded-xl border bg-card p-5">
      <h2 className="mb-4 flex items-center gap-2 text-base font-semibold">
        <Users className="h-4 w-4 text-muted-foreground" />
        Thành viên nhóm
        {!isLoading && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {memberList.length}
          </span>
        )}
      </h2>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      ) : memberList.length === 0 ? (
        <p className="text-center py-6 text-sm text-muted-foreground">Chưa có thành viên nào.</p>
      ) : (
        <div className="rounded-xl border border-border/60 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border/60">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">Thành viên</th>
                <th className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">Vai trò</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {memberList.map((m) => {
                const name = m.name ?? m.user?.name ?? `User #${m.id.slice(0, 6)}`
                const role = m.role ?? 'member'
                return (
                  <tr key={m.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="px-4 py-3 font-medium">{name}</td>
                    <td className="px-4 py-3">
                      <span className="cute-pill bg-secondary text-secondary-foreground text-xs capitalize">
                        {role}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

// ─── Group Comics ─────────────────────────────────────────────────────────────

function GroupComicsSection({ groupSlug }: { groupSlug: string }) {
  const { data: comicsData, isLoading } = useBrowse({
    translationGroupSlug: groupSlug,
    page: 1,
    limit: 24,
  })

  const comics = comicsData?.data ?? []

  return (
    <section className="rounded-xl border bg-card p-5">
      <h2 className="mb-4 flex items-center gap-2 text-base font-semibold">
        <BookOpen className="h-4 w-4 text-muted-foreground" />
        Truyện của nhóm ({comicsData?.total ?? 0})
      </h2>

      {isLoading ? (
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border">
              <tr>
                <th className="font-semibold px-4 py-3 text-left">Tiêu đề</th>
                <th className="font-semibold px-4 py-3 text-left">Trạng thái</th>
                <th className="font-semibold px-4 py-3 text-left">Chương</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-12" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : comics.length === 0 ? (
        <p className="text-center py-6 text-muted-foreground text-sm">Nhóm chưa có truyện nào.</p>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border sticky top-0">
              <tr>
                <th className="font-semibold px-4 py-3 text-left">Tiêu đề</th>
                <th className="font-semibold px-4 py-3 text-left">Trạng thái</th>
                <th className="font-semibold px-4 py-3 text-left">Chương</th>
              </tr>
            </thead>
            <tbody>
              {comics.map((comic) => (
                <tr key={comic.id} className="border-b last:border-0 border-border hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium max-w-xs truncate">{comic.title}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                      comic.status === 'completed' ? 'bg-[hsl(220_70%_92%)] text-[hsl(220_60%_35%)] dark:bg-[hsl(220_50%_22%)] dark:text-[hsl(220_70%_75%)]' :
                      comic.status === 'ongoing' ? 'bg-[hsl(160_55%_88%)] text-[hsl(160_50%_25%)] dark:bg-[hsl(160_40%_22%)] dark:text-[hsl(160_55%_80%)]' :
                      'bg-[hsl(40_90%_88%)] text-[hsl(30_70%_35%)] dark:bg-[hsl(40_50%_22%)] dark:text-[hsl(40_80%_75%)]'
                    }`}>
                      {comic.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{comic.chapters?.length ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

