'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useRoleDetail, useAllPermissions, useAssignPermissionsToRole } from '@/hooks/use-rbac'

interface RolePermissionsModalProps {
  roleId: string
  open: boolean
  onOpenChange: (_open: boolean) => void
}

export function RolePermissionsModal({ roleId, open, onOpenChange }: RolePermissionsModalProps) {
  const { data: roleDetail, isLoading: roleLoading } = useRoleDetail(roleId)
  const { data: allPermissions, isLoading: permsLoading } = useAllPermissions()
  const assignMutation = useAssignPermissionsToRole()

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Sync state when data loads
  useEffect(() => {
    if (roleDetail?.permissions) {
      setSelectedIds(new Set(roleDetail.permissions.map(p => p.id)))
    }
  }, [roleDetail])

  function handleToggle(permId: string) {
    const next = new Set(selectedIds)
    if (next.has(permId)) {
      next.delete(permId)
    } else {
      next.add(permId)
    }
    setSelectedIds(next)
  }

  function handleSave() {
    assignMutation.mutate(
      { roleId, payload: { permissionIds: Array.from(selectedIds) } },
      {
        onSuccess: () => {
          toast.success('Đã cập nhật quyền thành công!')
          onOpenChange(false)
        },
        onError: (err: any) => {
          toast.error(err.message || 'Lỗi khi cập nhật quyền.')
        }
      }
    )
  }

  const isLoading = roleLoading || permsLoading

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Cập nhật Quyền hạn</DialogTitle>
          <DialogDescription>
            Tùy chỉnh danh sách quyền (permissions) cho chức danh 
            <strong className="text-primary ml-1">{roleDetail?.name || '...'}</strong>
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex-1 min-h-[200px] flex items-center justify-center text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-2 pb-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(allPermissions || []).map((perm) => (
                <div 
                  key={perm.id} 
                  className="flex items-start space-x-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <Checkbox 
                    id={`perm-${perm.id}`} 
                    checked={selectedIds.has(perm.id)}
                    onCheckedChange={() => handleToggle(perm.id)}
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor={`perm-${perm.id}`} className="font-semibold cursor-pointer">
                      {perm.name}
                    </Label>
                    {perm.description && (
                      <p className="text-[11px] text-muted-foreground leading-snug">
                        {perm.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {allPermissions?.length === 0 && (
              <div className="text-center text-muted-foreground p-8 border border-dashed rounded-lg">
                Hệ thống chưa có quyền hạn nào được khai báo.
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end pt-4 border-t mt-auto">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="mr-2">
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={isLoading || assignMutation.isPending}>
            {assignMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Lưu thay đổi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
