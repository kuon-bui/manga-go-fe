import { FileText, Users, Tags, ShieldCheck } from 'lucide-react'

export default function AdminPage() {
  return (
    <div className="p-5 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Tổng quan Hệ thống</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Chào mừng bạn đến với trang quản trị Manga Go.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<FileText className="h-5 w-5 text-primary" />}  iconBg="bg-primary/10"   label="Tổng Truyện"   value="1,248"   />
        <StatCard icon={<Tags className="h-5 w-5 text-accent-foreground" />} iconBg="bg-accent/50" label="Thể Loại"   value="45"      />
        <StatCard icon={<Users className="h-5 w-5 text-secondary-foreground" />} iconBg="bg-secondary" label="Người dùng" value="2,501"   />
        <StatCard icon={<ShieldCheck className="h-5 w-5 text-green-600" />} iconBg="bg-green-100 dark:bg-green-900/30" label="Hệ thống" value="Online" valueClass="text-green-600" />
      </div>

      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted/20 py-16 text-center">
        <p className="text-muted-foreground text-sm">Sử dụng menu để điều hướng đến các bộ phận quản lý.</p>
      </div>
    </div>
  )
}

function StatCard({ icon, iconBg, label, value, valueClass }: {
  icon: React.ReactNode
  iconBg: string
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${iconBg}`}>{icon}</div>
      </div>
      <p className={`font-display text-3xl font-bold leading-none ${valueClass ?? ''}`}>{value}</p>
    </div>
  )
}
