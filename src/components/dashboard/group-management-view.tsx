'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit2, Trash2, Users, BookOpen, ArrowRightLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import { useUpdateGroup, useDeleteGroup } from '@/hooks/use-groups'
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{group.name}</h1>
        <div className="flex gap-2">
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

      {/* Transfer ownership */}
      <TransferOwnershipSection groupSlug={groupSlug} />

      {/* Group Members & Invites */}
      <GroupMembersSection groupSlug={groupSlug} />
    </div>
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

function GroupMembersSection({ groupSlug: _groupSlug }: { groupSlug: string }) {
  const [inviteLink, setInviteLink] = useState('')
  const [generating, setGenerating] = useState(false)

  // Mock members since the API doesn't exist yet
  const [members, setMembers] = useState([
    { id: '1', name: 'Admin User', role: 'admin' },
    { id: '2', name: 'Translator 1', role: 'translator' }
  ])

  function handleGenerateInvite() {
    setGenerating(true)
    setTimeout(() => {
      setInviteLink(`https://manga-go.me/invite/${Math.random().toString(36).substring(7)}`)
      setGenerating(false)
      toast.success('Đã tạo link mời mới')
    }, 800)
  }

  function handleCopy() {
    navigator.clipboard.writeText(inviteLink)
    toast.success('Đã copy link mời!')
  }

  function handleRoleChange(id: string, newRole: string) {
    setMembers((prev) => prev.map(m => m.id === id ? { ...m, role: newRole } : m))
    toast.success('Đã cập nhật chức vụ thành viên!')
  }

  function handleKick(id: string) {
    if (!confirm('Xoá thành viên này khỏi nhóm?')) return
    setMembers((prev) => prev.filter(m => m.id !== id))
    toast.success('Đã xoá thành viên')
  }

  return (
    <section className="rounded-xl border bg-card p-5 dark:border-border mt-6">
      <h2 className="mb-4 flex items-center gap-2 text-base font-semibold">
        <Users className="h-4 w-4 text-muted-foreground" />
        Thành viên nhóm
      </h2>

      <div className="mb-6 space-y-2">
        <Label>Link mời tham gia</Label>
        <div className="flex gap-2">
          <Input 
            readOnly 
            value={inviteLink} 
            placeholder="Chưa có link mời nào được tạo..." 
            className="flex-1 font-mono text-sm"
          />
          {inviteLink ? (
            <Button variant="outline" onClick={handleCopy}>Copy</Button>
          ) : (
            <Button variant="outline" onClick={handleGenerateInvite} disabled={generating}>
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Tạo Link'}
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground border-b border-border">
            <tr>
              <th className="font-semibold px-4 py-3 text-left">Tên thành viên</th>
              <th className="font-semibold px-4 py-3 text-left">Vai trò</th>
              <th className="font-semibold px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-4 text-muted-foreground">Không có thành viên nào.</td>
              </tr>
            ) : (
              members.map(member => (
                <tr key={member.id} className="border-b last:border-0 border-border">
                  <td className="px-4 py-3 font-medium">{member.name}</td>
                  <td className="px-4 py-3">
                    <select 
                      className="bg-transparent text-sm cursor-pointer outline-none ring-0 p-1"
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value)}
                      disabled={member.role === 'admin'}
                    >
                      <option value="admin">Admin</option>
                      <option value="translator">Translator</option>
                      <option value="editor">Editor</option>
                      <option value="uploader">Uploader</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => handleKick(member.id)}
                      disabled={member.role === 'admin'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

