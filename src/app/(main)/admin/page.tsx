import { FileText, Users, Tags, ShieldCheck } from 'lucide-react'

export default function AdminPage() {
  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Tổng quan Hệ thống</h1>
        <p className="text-muted-foreground text-sm">Chào mừng bạn đến với trang quản trị Manga-Go.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Placeholder Stats */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <FileText className="h-4 w-4" />
            <h3 className="text-sm font-medium">Tổng Truyện</h3>
          </div>
          <p className="text-3xl font-bold">1,248</p>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Tags className="h-4 w-4" />
            <h3 className="text-sm font-medium">Tổng Thể Loại</h3>
          </div>
          <p className="text-3xl font-bold">45</p>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Users className="h-4 w-4" />
            <h3 className="text-sm font-medium">Người dùng</h3>
          </div>
          <p className="text-3xl font-bold">2,501</p>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <h3 className="text-sm font-medium">System Role</h3>
          </div>
          <p className="text-3xl font-bold text-emerald-500">Active</p>
        </div>
      </div>

      <div className="rounded-xl border bg-muted/20 border-dashed p-8 text-center text-muted-foreground flex flex-col items-center justify-center min-h-[200px]">
        <p>Sử dụng menu bên trái để điều hướng đến các bộ phận quản lý hệ thống.</p>
      </div>
    </div>
  )
}
