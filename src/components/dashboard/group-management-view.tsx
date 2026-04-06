'use client'

import { useState } from 'react'
import { UserMinus, Crown, User } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useGroupMembers, useInviteMember, useRemoveMember } from '@/hooks/use-dashboard'
import { useAuthStore } from '@/stores/auth-store'
import type { GroupMember } from '@/types'

interface GroupManagementViewProps {
  groupId: string
}

export function GroupManagementView({ groupId }: GroupManagementViewProps) {
  const currentUser = useAuthStore((s) => s.user)
  const { data: members, isLoading } = useGroupMembers(groupId)
  const inviteMutation = useInviteMember(groupId)
  const removeMutation = useRemoveMember(groupId)

  const [inviteEmail, setInviteEmail] = useState('')

  const currentMember = members?.find((m) => m.userId === currentUser?.id)
  const isAdmin = currentMember?.role === 'admin'

  function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    inviteMutation.mutate(inviteEmail.trim(), {
      onSuccess: () => {
        toast.success(`Invite sent to ${inviteEmail}`)
        setInviteEmail('')
      },
      onError: () => toast.error('Failed to send invite'),
    })
  }

  function handleRemove(member: GroupMember) {
    removeMutation.mutate(member.userId, {
      onSuccess: () => toast.success(`${member.name} removed`),
      onError: () => toast.error('Failed to remove member'),
    })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Group Management</h1>

      {/* Invite form — admin only */}
      {isAdmin && (
        <section className="space-y-3 rounded-xl border bg-card p-5 dark:border-border">
          <h2 className="text-base font-semibold text-foreground">Invite Member</h2>
          <form onSubmit={handleInvite} className="flex gap-2">
            <div className="flex-1 space-y-1">
              <Label htmlFor="invite-email" className="sr-only">Email address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="member@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={inviteMutation.isPending}>
              {inviteMutation.isPending ? 'Sending…' : 'Send Invite'}
            </Button>
          </form>
        </section>
      )}

      {/* Member list */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          Members
          {members && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({members.length})
            </span>
          )}
        </h2>

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        )}

        {members && members.length > 0 && (
          <ul className="divide-y divide-border dark:divide-border rounded-xl border dark:border-border overflow-hidden">
            {members.map((member, i) => (
              <li key={member.id}>
                {i > 0 && <Separator />}
                <div className="flex items-center gap-3 p-4">
                  <Avatar className="h-10 w-10">
                    {member.avatarUrl && (
                      <AvatarImage src={member.avatarUrl} alt={member.name} />
                    )}
                    <AvatarFallback>
                      {member.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>

                  <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                    {member.role === 'admin' ? (
                      <><Crown className="mr-1 h-3 w-3" /> Admin</>
                    ) : (
                      <><User className="mr-1 h-3 w-3" /> Member</>
                    )}
                  </Badge>

                  {isAdmin && member.userId !== currentUser?.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemove(member)}
                      disabled={removeMutation.isPending}
                      aria-label={`Remove ${member.name}`}
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
