'use client'

import { useState } from 'react'
import { Plus, Shield, Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useAllRoles } from '@/hooks/use-rbac'
import { apiClient } from '@/lib/api-client'
import { RolePermissionsModal } from '@/components/admin/role-permissions-modal'

export function RoleManager() {
  const qc = useQueryClient()
  const { data: roles, isLoading } = useAllRoles()
  const [open, setOpen] = useState(false)
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const createMutation = useMutation({
    mutationFn: () => apiClient.createRole(name.trim(), description.trim() || undefined),
    onSuccess: () => {
      toast.success('Đã thêm chức danh mới!')
      setOpen(false)
      setName('')
      setDescription('')
      qc.invalidateQueries({ queryKey: ['rbac', 'roles'] })
    },
    onError: (err: any) => {
      toast.error(err.message || 'Lỗi khi tạo Role.')
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
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Role</h1>
          <p className="text-sm text-muted-foreground">Phân quyền chức năng và gán vai trò.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Thêm Role
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm System Role Mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên Role</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="admin, translator, moderator..." 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Mô tả (tùy chọn)</Label>
                <Textarea 
                  id="desc" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Người quản lý dịch thuật, có quyền đăng chương..." 
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={!name.trim() || createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Tạo Role
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-xl bg-background overflow-hidden shadow-sm">
        <div className="p-4 border-b bg-muted/40 flex items-center justify-between text-sm font-medium">
          <span>Hệ thống Roles ({roles?.length || 0})</span>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Đang tải dữ liệu...</div>
        ) : !roles || roles.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center text-muted-foreground">
            <Shield className="h-8 w-8 mb-2 opacity-20" />
            <p>Chưa có roles nào được định nghĩa.</p>
          </div>
        ) : (
          <ul className="divide-y">
            {roles.map(r => (
              <li key={r.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/10 transition-colors">
                <div>
                  <h3 className="font-bold text-foreground flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-500" />
                    {r.name}
                  </h3>
                  {r.description && <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{r.description}</p>}
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedRoleId(r.id)} 
                  className="font-medium shrink-0"
                >
                  <Check className="h-3 w-3 mr-1.5 text-primary" />
                  Cấp quyền
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedRoleId && (
        <RolePermissionsModal 
          roleId={selectedRoleId} 
          open={!!selectedRoleId} 
          onOpenChange={(v) => !v && setSelectedRoleId(null)} 
        />
      )}
    </div>
  )
}
