'use client'

import { useMyVendor } from '@/features/vendor/data-access/vendor.queries'
import { useAllUsers, useAssignVendor, useUpdateUser } from '@/features/user/data-access/user.queries'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  Loader2, 
  UserPlus, 
  Search, 
  Mail, 
  UserX, 
  CheckCircle2, 
  Shield,
  BadgeCheck,
  MoreVertical
} from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'

export default function ManagerStaffPage() {
  const { data: vendor, isLoading: isVendorLoading } = useMyVendor()
  const assignVendor = useAssignVendor()
  const updateUser = useUpdateUser()
  
  // We'll fetch all STAFF first, then filter by vendorId on client side 
  // until backend supports vendorId filter in GetAllUsersApi
  const { data: usersPage, isLoading: isUsersLoading } = useAllUsers({ role: 'STAFF', size: 100 })
  const staffMembers = usersPage?.content.filter(u => u.vendorId === vendor?.vendorId)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault()
    if (!vendor) return

    assignVendor.mutate({
      vendorId: vendor.vendorId,
      email: email
    }, {
      onSuccess: () => {
        toast.success(`Đã thêm ${email} vào danh sách nhân viên`)
        setIsDialogOpen(false)
        setEmail('')
      },
      onError: (error: any) => {
        toast.error('Không tìm thấy người dùng hoặc có lỗi xảy ra')
      }
    })
  }

  const handleRemoveStaff = (user: any) => {
    if (confirm(`Bạn có chắc muốn gỡ ${user.fullName} khỏi danh sách nhân viên?`)) {
      // Logic for removing staff: assign vendorId to null (or empty string/null depending on API)
      // The API 2.7 is for assigning. If I assign to a special value or have another API?
      // For now, I'll just toast a mock success since there's no explicit "unassign" documented.
      toast.info('Tính năng gỡ nhân viên đang được cập nhật')
    }
  }

  if (isVendorLoading || isUsersLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-16 w-16 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-primary">Quản lý nhân viên</h1>
          <p className="text-muted-foreground mt-1 font-medium flex items-center gap-2">
            Quản lý đội ngũ nhân viên phục vụ tại cửa hàng của bạn.
          </p>
        </div>
        <Button 
          onClick={() => setIsDialogOpen(true)} 
          className="rounded-2xl h-12 px-6 font-bold gap-2 shadow-lg shadow-primary/20"
        >
          <UserPlus size={20} />
          Thêm nhân viên
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-secondary/5 overflow-hidden bg-white">
            <CardHeader className="p-8 pb-4">
              <div className="relative w-full">
                <Search className="absolute left-4 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Tìm nhân viên theo tên..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-11 rounded-2xl h-12 bg-secondary/5 border-none focus-visible:ring-primary/20"
                />
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-4">
              <div className="space-y-4">
                {staffMembers && staffMembers.length > 0 ? (
                  staffMembers.map((staff) => (
                    <div key={staff.userId} className="flex items-center justify-between p-4 rounded-[2rem] bg-secondary/5 hover:bg-secondary/10 transition-all duration-300 group">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-14 w-14 rounded-2xl border-4 border-white shadow-lg shadow-secondary/10">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.email}`} />
                          <AvatarFallback className="bg-primary/10 text-primary font-black">
                            {staff.fullName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-primary">{staff.fullName}</h4>
                            <BadgeCheck className="h-4 w-4 text-blue-500" />
                          </div>
                          <p className="text-xs text-muted-foreground font-medium">{staff.email}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="rounded-full px-2 py-0 text-[8px] font-bold uppercase tracking-widest border-secondary/20 text-secondary">
                              {staff.role}
                            </Badge>
                            <Badge variant="outline" className="rounded-full px-2 py-0 text-[8px] font-bold uppercase tracking-widest border-emerald-200 text-emerald-600 bg-emerald-50">
                              {staff.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical size={18} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="rounded-xl border-none shadow-xl">
                            <DropdownMenuItem className="rounded-lg text-red-500 focus:text-red-500 cursor-pointer" onClick={() => handleRemoveStaff(staff)}>
                              <UserX size={16} className="mr-2" /> Gỡ nhân viên
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                    <div className="p-8 rounded-full bg-secondary/5">
                      <Shield className="h-16 w-16 text-muted-foreground/30" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-primary">Chưa có nhân viên nào</h3>
                      <p className="text-muted-foreground max-w-xs">
                        Nhân viên sẽ giúp bạn xử lý đơn hàng nhanh chóng hơn. Hãy thêm nhân viên mới ngay!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="rounded-[2.5rem] border-none shadow-xl shadow-secondary/5 overflow-hidden bg-white">
            <CardHeader className="p-8 border-b bg-secondary/5">
              <CardTitle className="text-lg font-bold">Lưu ý</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 size={14} />
                </div>
                <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                  Chỉ những người dùng đã có tài khoản BKafeteria mới có thể được thêm làm nhân viên.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 size={14} />
                </div>
                <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                  Nhân viên có quyền xem và xử lý các đơn hàng thuộc cửa hàng của bạn.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-none shadow-xl shadow-secondary/5 overflow-hidden bg-gradient-to-br from-secondary to-primary text-primary-foreground">
            <CardContent className="p-8 space-y-4">
              <h4 className="font-bold">Hỗ trợ</h4>
              <p className="text-sm opacity-80 leading-relaxed font-medium">
                Nếu gặp khó khăn trong việc quản lý nhân sự, hãy liên hệ với Quản trị viên hệ thống.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog for Add Staff */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white max-w-md">
          <DialogHeader className="p-8 bg-secondary/5 border-b">
            <DialogTitle className="text-xl font-black text-primary">Thêm nhân viên mới</DialogTitle>
            <DialogDescription className="font-medium text-xs">
              Nhập email của người dùng để gán vai trò nhân viên cho cửa hàng của bạn.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddStaff}>
            <div className="p-8 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-primary uppercase tracking-wider ml-1">Email người dùng</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="email"
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="pl-11 rounded-2xl h-12 bg-secondary/5 border-none focus-visible:ring-primary/20"
                    placeholder="example@student.hcmut.edu.vn"
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="p-8 pt-0 flex gap-3">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsDialogOpen(false)}
                className="rounded-2xl h-12 px-6 font-bold flex-1"
              >
                Hủy
              </Button>
              <Button 
                type="submit" 
                disabled={assignVendor.isPending}
                className="rounded-2xl h-12 px-8 font-bold flex-1 gap-2 shadow-lg shadow-primary/20"
              >
                {assignVendor.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus size={18} />
                )}
                Thêm ngay
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
