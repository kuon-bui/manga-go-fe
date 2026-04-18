'use client'

import { useState, useEffect } from 'react'
import { Search, Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiClient } from '@/lib/api-client'
import { useAllRoles, useAssignRolesToUser } from '@/hooks/use-rbac'

export function UserRoleManager() {
  const [searchId, setSearchId] = useState('')
  const [activeUserId, setActiveUserId] = useState<string | null>(null)

  // Fetch all roles for checklist
  const { data: allRoles, isLoading: rolesLoading } = useAllRoles()

  // Fetch current roles for searched user
  const { data: userRoles, isLoading: userRolesLoading, refetch } = useQuery({
    queryKey: ['rbac', 'userRoles', activeUserId],
    queryFn: () => apiClient.getUserRoles(activeUserId!),
    enabled: Boolean(activeUserId),
  })

  const assignMutation = useAssignRolesToUser()
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(new Set())

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!searchId.trim()) return
    setActiveUserId(searchId.trim())
    // When a new user is searched, we will let `useEffect` or `refetch` handle updating selected ids
  }

  // Sync checkboxes with userRoles result
  useEffect(() => {
    if (userRoles) {
      setSelectedRoleIds(new Set(userRoles.map((r) => r.id)))
    } else {
      setSelectedRoleIds(new Set())
    }
  }, [userRoles])

  function toggleRole(roleId: string) {
    const next = new Set(selectedRoleIds)
    if (next.has(roleId)) {
      next.delete(roleId)
    } else {
      next.add(roleId)
    }
    setSelectedRoleIds(next)
  }

  function handleSave() {
    if (!activeUserId) return
    assignMutation.mutate(
      { userId: activeUserId, payload: { roleIds: Array.from(selectedRoleIds) } },
      {
        onSuccess: () => {
          toast.success('Đã cập nhật System Roles cho User thành công.')
          refetch()
        },
        onError: (err: any) => {
          toast.error(err.message || 'Lỗi khi gán Role.')
        }
      }
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Cấp quyền Người dùng</h1>
        <p className="text-sm text-muted-foreground">Chỉ định System Roles trực tiếp bằng User ID.</p>
      </div>

      {/* Tra cứu */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-lg">
        <div className="flex-1 space-y-1">
          <Label htmlFor="userId" className="sr-only">User ID</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              id="userId"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Nhập User UUID (ví dụ: 123e4567-e89b...)"
              className="pl-9"
            />
          </div>
        </div>
        <Button type="submit">Tìm kiếm</Button>
      </form>

      {/* Kết quả */}
      {activeUserId && (
        <div className="bg-card border rounded-xl overflow-hidden max-w-2xl shadow-sm">
          <div className="p-4 border-b bg-muted/30">
            <h3 className="font-medium">Quản lý Roles: 
              <span className="text-primary font-mono ml-2">{activeUserId}</span>
            </h3>
          </div>
          
          <div className="p-6">
            {rolesLoading || userRolesLoading ? (
              <div className="py-8 text-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                Đang nạp dữ liệu...
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(allRoles || []).map((role) => (
                    <button
                      key={role.id}
                      onClick={() => toggleRole(role.id)}
                      className={`flex flex-col items-start gap-1 p-3 rounded-lg border text-left transition-colors ${
                        selectedRoleIds.has(role.id) 
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-semibold text-sm">{role.name}</span>
                        {selectedRoleIds.has(role.id) && <Check className="h-4 w-4 text-primary" />}
                      </div>
                      {role.description && (
                        <span className="text-[11px] text-muted-foreground line-clamp-1">
                          {role.description}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button 
                    onClick={handleSave} 
                    disabled={assignMutation.isPending}
                  >
                    {assignMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Lưu các thay đổi
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
