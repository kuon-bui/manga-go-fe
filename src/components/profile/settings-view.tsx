'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  User, Lock, BookOpen, Bell, Palette,
  Camera, Check,
} from 'lucide-react'

import { Input }    from '@/components/ui/input'
import { Label }    from '@/components/ui/label'
import { Switch }   from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AvatarCropModal }   from '@/components/profile/avatar-crop-modal'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useAuthStore }       from '@/stores/auth-store'
import { useNovelReaderStore } from '@/stores/novel-reader-store'
import { useMangaViewerStore, type ViewerMode } from '@/stores/manga-viewer-store'
import { useThemeStore, THEME_OPTIONS } from '@/stores/theme-store'
import { apiClient } from '@/lib/api-client'
import { cn } from '@/lib/utils'

type UserConfig = {
  enableComicNewChapterNotifications?: boolean
  enableCommentReplyNotifications?: boolean
  enableEmailNotifications?: boolean
  enableSseNotifications?: boolean
  enableSystemAnnouncements?: boolean
}

function useUserConfig() {
  return useQuery<UserConfig>({
    queryKey: ['user-config'],
    queryFn: () => apiClient.getUserConfig() as Promise<UserConfig>,
    staleTime: 5 * 60 * 1000,
  })
}

function useUpdateUserConfig() {
  return useMutation({
    mutationFn: (config: Partial<UserConfig>) => apiClient.updateUserConfig(config),
  })
}

type NavTab = 'profile' | 'appearance' | 'reading' | 'notifications' | 'account'

const NAV_ITEMS: { id: NavTab; label: string; icon: React.ReactNode }[] = [
  { id: 'profile',       label: 'Hồ sơ',        icon: <User className="h-4 w-4" /> },
  { id: 'appearance',    label: 'Giao diện',     icon: <Palette className="h-4 w-4" /> },
  { id: 'reading',       label: 'Đọc truyện',    icon: <BookOpen className="h-4 w-4" /> },
  { id: 'notifications', label: 'Thông báo',     icon: <Bell className="h-4 w-4" /> },
  { id: 'account',       label: 'Tài khoản',     icon: <Lock className="h-4 w-4" /> },
]

export function SettingsView() {
  const { user, updateUser } = useAuthStore()
  const novelStore  = useNovelReaderStore()
  const viewerStore = useMangaViewerStore()
  const { theme, setTheme } = useThemeStore()

  const [activeTab,       setActiveTab]       = useState<NavTab>('profile')
  const [avatarModalOpen, setAvatarModalOpen] = useState(false)
  const [displayName,     setDisplayName]     = useState(user?.name ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword,     setNewPassword]     = useState('')
  const [saving,          setSaving]          = useState(false)

  if (!user) return null

  const initials = user.name.slice(0, 2).toUpperCase()

  async function handleSaveProfile() {
    if (!displayName.trim()) return
    setSaving(true)
    setTimeout(() => {
      updateUser({ name: displayName.trim() })
      toast.success('Hồ sơ đã được lưu!')
      setSaving(false)
    }, 500)
  }

  async function handleChangePassword() {
    if (!newPassword) return
    setSaving(true)
    setTimeout(() => {
      toast.success('Đã cập nhật mật khẩu!')
      setCurrentPassword('')
      setNewPassword('')
      setSaving(false)
    }, 600)
  }

  function handleAvatarCrop(blob: Blob) {
    const url = URL.createObjectURL(blob)
    updateUser({ avatarUrl: url })
    toast.success('Đã thay đổi ảnh đại diện!')
  }

  return (
    <div className="mx-auto max-w-4xl px-4 md:px-6 pt-2 pb-10 space-y-5">

      {/* ── Profile card at top ──────────────────────────────── */}
      <div className="cute-card p-5 flex items-center gap-4">
        <div className="relative shrink-0">
          <Avatar className="h-16 w-16 ring-2 ring-primary/30">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
            <AvatarFallback className="text-lg font-bold bg-primary/15 text-primary">{initials}</AvatarFallback>
          </Avatar>
          <button
            onClick={() => setAvatarModalOpen(true)}
            className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:opacity-90 transition-opacity"
            aria-label="Đổi ảnh"
          >
            <Camera className="h-3 w-3" />
          </button>
        </div>
        <div className="min-w-0">
          <p className="font-display text-lg font-bold truncate">{user.name}</p>
          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 rounded-full px-2 py-0.5 capitalize">
            {user.role}
          </p>
        </div>
      </div>

      {/* ── Body: sidebar nav + content ─────────────────────── */}
      <div className="grid md:grid-cols-[200px_1fr] gap-5 items-start">

        {/* Sidebar nav */}
        <nav className="cute-card p-2 flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left',
                activeTab === item.id
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Content panel */}
        <div className="space-y-4">

          {/* ── Profile ── */}
          {activeTab === 'profile' && (
            <div className="cute-card p-5 space-y-5">
              <h2 className="font-display text-lg font-bold">Hồ sơ</h2>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="displayName">Tên hiển thị</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Tên của bạn"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input value={user.email} disabled className="opacity-60" />
                  <p className="text-xs text-muted-foreground">Email không thể thay đổi tại đây.</p>
                </div>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving || !displayName.trim()}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm"
                >
                  {saving ? 'Đang lưu…' : (
                    <><Check className="h-4 w-4" /> Lưu hồ sơ</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── Appearance ── */}
          {activeTab === 'appearance' && (
            <div className="cute-card p-5 space-y-5">
              <h2 className="font-display text-lg font-bold">Giao diện</h2>
              <div className="space-y-3">
                <Label>Chủ đề màu sắc</Label>
                <div className="grid grid-cols-3 gap-3">
                  {THEME_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setTheme(opt.value)}
                      className={cn(
                        'relative flex flex-col items-center gap-2 rounded-2xl border-2 p-3 transition-all',
                        theme === opt.value
                          ? 'border-primary shadow-sm'
                          : 'border-border hover:border-primary/40'
                      )}
                    >
                      {/* Swatch */}
                      <div
                        className="h-10 w-full rounded-xl shadow-inner"
                        style={{ background: opt.previewBg }}
                      >
                        <div
                          className="h-3 w-3 rounded-full mt-1.5 ml-1.5"
                          style={{ background: opt.previewAccent }}
                        />
                      </div>
                      <span className="text-xs font-semibold">{opt.label}</span>
                      {theme === opt.value && (
                        <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-2.5 w-2.5 text-primary-foreground" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Reading ── */}
          {activeTab === 'reading' && (
            <div className="space-y-4">
              <div className="cute-card p-5 space-y-4">
                <h2 className="font-display text-lg font-bold">Trình đọc Manga</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Chế độ xem mặc định</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Cách hiển thị trang khi đọc manga</p>
                  </div>
                  <Select
                    value={viewerStore.mode}
                    onValueChange={(v) => viewerStore.setMode(v as ViewerMode)}
                  >
                    <SelectTrigger className="w-44 h-8 text-sm rounded-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vertical">Cuộn dọc</SelectItem>
                      <SelectItem value="single">Trang đơn</SelectItem>
                      <SelectItem value="double">Trang đôi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="cute-card p-5 space-y-4">
                <h2 className="font-display text-lg font-bold">Trình đọc Novel</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Chủ đề mặc định</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Nền màu khi đọc tiểu thuyết</p>
                  </div>
                  <Select value={novelStore.theme} onValueChange={(v) => novelStore.setTheme(v as 'day' | 'night' | 'sepia')}>
                    <SelectTrigger className="w-36 h-8 text-sm rounded-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Sáng (Day)</SelectItem>
                      <SelectItem value="night">Tối (Night)</SelectItem>
                      <SelectItem value="sepia">Sepia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between border-t border-border/60 pt-4">
                  <div>
                    <p className="text-sm font-semibold">Font chữ mặc định</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Kiểu chữ khi đọc tiểu thuyết</p>
                  </div>
                  <Select value={novelStore.fontFamily} onValueChange={(v) => novelStore.setFontFamily(v as 'serif' | 'sans' | 'mono')}>
                    <SelectTrigger className="w-36 h-8 text-sm rounded-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="serif">Serif</SelectItem>
                      <SelectItem value="sans">Sans-serif</SelectItem>
                      <SelectItem value="mono">Monospace</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* ── Notifications ── */}
          {activeTab === 'notifications' && (
            <NotificationsTab />
          )}

          {/* ── Account ── */}
          {activeTab === 'account' && (
            <div className="cute-card p-5 space-y-5">
              <h2 className="font-display text-lg font-bold">Đổi mật khẩu</h2>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="currentPw">Mật khẩu hiện tại</Label>
                  <Input id="currentPw" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="newPw">Mật khẩu mới</Label>
                  <Input id="newPw" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </div>
                <button
                  onClick={handleChangePassword}
                  disabled={saving || !currentPassword || !newPassword}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm"
                >
                  {saving ? 'Đang lưu…' : (
                    <><Lock className="h-4 w-4" /> Đổi mật khẩu</>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      <AvatarCropModal
        open={avatarModalOpen}
        onOpenChange={setAvatarModalOpen}
        onCrop={handleAvatarCrop}
      />
    </div>
  )
}

/* ── Notifications tab ─────────────────────────────────────────────────────── */

function NotificationsTab() {
  const { data: config, isLoading } = useUserConfig()
  const updateMutation = useUpdateUserConfig()

  function toggle(key: keyof UserConfig) {
    const current = config?.[key] ?? true
    updateMutation.mutate({ [key]: !current })
  }

  const rows: { label: string; key: keyof UserConfig }[] = [
    { label: 'Chương mới từ truyện đang theo dõi', key: 'enableComicNewChapterNotifications' },
    { label: 'Có người trả lời bình luận của bạn',  key: 'enableCommentReplyNotifications' },
    { label: 'Thông báo hệ thống',                   key: 'enableSystemAnnouncements' },
    { label: 'Thông báo real-time (SSE)',             key: 'enableSseNotifications' },
    { label: 'Gửi thông báo qua email',               key: 'enableEmailNotifications' },
  ]

  return (
    <div className="cute-card p-5 space-y-1">
      <h2 className="font-display text-lg font-bold mb-4">Thông báo</h2>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div className="h-4 w-48 rounded bg-muted animate-pulse" />
              <div className="h-5 w-9 rounded-full bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        rows.map(({ label, key }) => (
          <div key={key} className="flex items-center justify-between py-3 border-b border-border/60 last:border-0">
            <Label className="cursor-pointer text-sm font-medium text-foreground">{label}</Label>
            <Switch
              checked={config?.[key] ?? true}
              onCheckedChange={() => toggle(key)}
              disabled={updateMutation.isPending}
              aria-label={label}
            />
          </div>
        ))
      )}
    </div>
  )
}

/* ── Notification row (legacy) ─────────────────────────────────────────────── */

function NotifRow({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked ?? false)
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/60 last:border-0">
      <Label className="cursor-pointer text-sm font-medium text-foreground">{label}</Label>
      <Switch checked={checked} onCheckedChange={setChecked} aria-label={label} />
    </div>
  )
}
