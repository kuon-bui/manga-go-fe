'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { AvatarCropModal } from '@/components/profile/avatar-crop-modal'
import { useAuthStore } from '@/stores/auth-store'
import { useNovelReaderStore } from '@/stores/novel-reader-store'
import { useMangaViewerStore, type ViewerMode } from '@/stores/manga-viewer-store'

export function SettingsView() {
  const { user, updateUser } = useAuthStore()
  const novelStore = useNovelReaderStore()
  const viewerStore = useMangaViewerStore()

  const [avatarModalOpen, setAvatarModalOpen] = useState(false)
  const [displayName, setDisplayName] = useState(user?.name ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)

  if (!user) return null

  async function handleSaveProfile() {
    if (!displayName.trim()) return
    updateUser({ name: displayName.trim() })
    toast.info('Đã lưu tạm trên client. Backend chưa hỗ trợ endpoint cập nhật profile.')
    setSaving(false)
  }

  async function handleChangePassword() {
    if (!newPassword) return
    toast.info('Backend chưa có endpoint đổi mật khẩu trực tiếp. Vui lòng dùng quên mật khẩu.')
    setCurrentPassword('')
    setNewPassword('')
  }

  async function handleAvatarCrop(_blob: Blob) {
    toast.info('Backend chưa hỗ trợ endpoint cập nhật avatar tài khoản.')
  }

  function handleOpenAvatarModal() {
    if (avatarModalOpen) {
      setAvatarModalOpen(false)
      return
    }

    toast.info('Backend chưa hỗ trợ endpoint avatar, bạn vẫn có thể preview crop.')
    setAvatarModalOpen(true)
  }

  const initials = user.name.slice(0, 2).toUpperCase()

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">Settings</h1>

      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="reading">Reading</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* ── Profile ── */}
        <TabsContent value="profile" className="space-y-6">
          {/* Avatar */}
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">Avatar</h2>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                <AvatarFallback className="text-xl">{initials}</AvatarFallback>
              </Avatar>
              <Button variant="outline" onClick={handleOpenAvatarModal}>
                Change Avatar
              </Button>
            </div>
          </section>

          <Separator />

          <section className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input value={user.email} disabled className="opacity-60" />
              <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
            </div>
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? 'Saving…' : 'Save Profile'}
            </Button>
          </section>
        </TabsContent>

        {/* ── Account ── */}
        <TabsContent value="account" className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">Email</h2>
            <Input value={user.email} disabled className="opacity-60" />
            <p className="text-xs text-muted-foreground">Contact support to change your email.</p>
          </section>

          <Separator />

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">Change Password</h2>
            <div className="space-y-1">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <Button
              onClick={handleChangePassword}
              disabled={saving || !currentPassword || !newPassword}
            >
              {saving ? 'Saving…' : 'Change Password'}
            </Button>
          </section>
        </TabsContent>

        {/* ── Reading preferences ── */}
        <TabsContent value="reading" className="space-y-6">
          <section className="space-y-4">
            <h2 className="text-base font-semibold text-foreground">Manga Viewer</h2>
            <div className="space-y-1">
              <Label>Default Viewing Mode</Label>
              <Select
                value={viewerStore.mode}
                onValueChange={(v) => viewerStore.setMode(v as ViewerMode)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vertical">Vertical Scroll</SelectItem>
                  <SelectItem value="single">Single Page</SelectItem>
                  <SelectItem value="double">Double Page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-base font-semibold text-foreground">Novel Reader</h2>
            <div className="space-y-1">
              <Label>Default Theme</Label>
              <Select
                value={novelStore.theme}
                onValueChange={(v) =>
                  novelStore.setTheme(v as 'day' | 'night' | 'sepia')
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="night">Night</SelectItem>
                  <SelectItem value="sepia">Sepia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Default Font</Label>
              <Select
                value={novelStore.fontFamily}
                onValueChange={(v) =>
                  novelStore.setFontFamily(v as 'serif' | 'sans' | 'mono')
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="serif">Serif</SelectItem>
                  <SelectItem value="sans">Sans-serif</SelectItem>
                  <SelectItem value="mono">Monospace</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </section>
        </TabsContent>

        {/* ── Notifications ── */}
        <TabsContent value="notifications" className="space-y-4">
          <h2 className="text-base font-semibold text-foreground">Notification Preferences</h2>
          <NotificationToggle label="New chapter from followed titles" defaultChecked />
          <Separator />
          <NotificationToggle label="Comment replies" defaultChecked />
          <Separator />
          <NotificationToggle label="System announcements" defaultChecked />
        </TabsContent>
      </Tabs>

      <AvatarCropModal
        open={avatarModalOpen}
        onOpenChange={setAvatarModalOpen}
        onCrop={handleAvatarCrop}
      />
    </div>
  )
}

function NotificationToggle({
  label,
  defaultChecked,
}: {
  label: string
  defaultChecked?: boolean
}) {
  const [checked, setChecked] = useState(defaultChecked ?? false)
  return (
    <div className="flex items-center justify-between">
      <Label className="cursor-pointer text-sm text-foreground">{label}</Label>
      <Switch
        checked={checked}
        onCheckedChange={setChecked}
        aria-label={label}
      />
    </div>
  )
}
