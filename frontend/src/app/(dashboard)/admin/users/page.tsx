'use client'

import { useAllUsers, useUpdateUser, useDeleteUser } from '@/features/user/data-access/user.queries'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  Loader2, 
  Search, 
  UserCog, 
  Trash2, 
  UserCheck, 
  UserMinus,
  Mail,
  Phone,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
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
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export default function AdminUsersPage() {
  const [params, setParams] = useState({
    search: '',
    role: '',
    status: '',
    page: 0,
    size: 10
  })

  const { data: usersPage, isLoading, refetch } = useAllUsers(params)
  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()

  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [newRole, setNewRole] = useState('')

  const handleUpdateRole = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    updateUser.mutate({
      id: selectedUser.userId,
      data: {
        fullName: selectedUser.fullName,
        email: selectedUser.email,
        phoneNumber: selectedUser.phoneNumber,
        studentId: selectedUser.studentId,
        gender: selectedUser.gender,
        dateOfBirth: selectedUser.dateOfBirth,
        role: newRole as any,
        status: selectedUser.status,
      }
    }, {
      onSuccess: () => {
        toast.success(`Đã cập nhật vai trò cho ${selectedUser.fullName}`)
        setIsRoleDialogOpen(false)
      }
    })
  }

  const handleToggleStatus = (user: any) => {
    const nextStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    updateUser.mutate({
      id: user.userId,
      data: {
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        studentId: user.studentId,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        role: user.role,
        status: nextStatus,
      }
    }, {
      onSuccess: () => {
        toast.success(`Đã ${nextStatus === 'ACTIVE' ? 'kích hoạt' : 'khóa'} tài khoản ${user.fullName}`)
        refetch()
      }
    })
  }

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa tài khoản ${name}?`)) {
      deleteUser.mutate({ id }, {
        onSuccess: () => {
          toast.success(`Đã xóa tài khoản ${name}`)
        }
      })
    }
  }

  if (isLoading && !usersPage) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-16 w-16 text-primary animate-spin" />
      </div>
    )
  }

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-700 border-red-200',
    MANAGER: 'bg-purple-100 text-purple-700 border-purple-200',
    STAFF: 'bg-blue-100 text-blue-700 border-blue-200',
    CUSTOMER: 'bg-gray-100 text-gray-700 border-gray-200',
  }

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-primary">Quản lý người dùng</h1>
        <p className="text-muted-foreground mt-1 font-medium">Hệ thống quản lý tài khoản và phân quyền người dùng.</p>
      </div>

      <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-secondary/5 overflow-hidden bg-white">
        <CardHeader className="p-8 pb-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Tìm theo tên, email, SĐT..." 
                value={params.search}
                onChange={e => setParams({...params, search: e.target.value, page: 0})}
                className="pl-11 rounded-2xl h-12 bg-secondary/5 border-none focus-visible:ring-primary/20"
              />
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <Select
                value={params.role || "all"}
                onValueChange={(val) =>
                  setParams({
                    ...params,
                    role: val === "all" ? "" : val,
                    page: 0,
                  })
                }
              >
                <SelectTrigger className="rounded-2xl h-12 bg-secondary border-none min-w-[140px]">
                  <SelectValue placeholder="Tất cả vai trò" />
                </SelectTrigger>

                <SelectContent className="rounded-2xl border-none shadow-xl bg-background opacity-100">
                  <SelectItem value="all">Tất cả vai trò</SelectItem>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                  <SelectItem value="MANAGER">MANAGER</SelectItem>
                  <SelectItem value="STAFF">STAFF</SelectItem>
                  <SelectItem value="CUSTOMER">CUSTOMER</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-secondary/5 border-b border-secondary/5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <th className="p-6 pl-8">Người dùng</th>
                  <th className="p-6">Liên hệ</th>
                  <th className="p-6">Vai trò</th>
                  <th className="p-6">Trạng thái</th>
                  <th className="p-6 pr-8 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary/5">
                {usersPage?.content.map((user) => (
                  <tr key={user.userId} className="group hover:bg-secondary/5 transition-colors">
                    <td className="p-6 pl-8">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 rounded-xl border-2 border-white shadow-sm">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                          <AvatarFallback className="bg-primary/10 text-primary font-black">
                            {user.fullName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-sm text-primary group-hover:text-primary transition-colors">{user.fullName}</p>
                          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">MSSV: {user.studentId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Mail size={12} className="text-primary/40" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Phone size={12} className="text-primary/40" />
                          {user.phoneNumber}
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <Badge className={cn('rounded-full px-3 py-0.5 text-[10px] font-bold border border-none shadow-sm', roleColors[user.role])}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="p-6">
                      <Badge className={cn(
                        'rounded-full px-3 py-0.5 text-[10px] font-bold border-none',
                        user.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      )}>
                        {user.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đã khóa'}
                      </Badge>
                    </td>
                    <td className="p-6 pr-8 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10">
                            <MoreHorizontal size={20} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-2xl w-48 p-2 bg-background opacity-100">
                          <DropdownMenuItem className="rounded-xl cursor-pointer" onClick={() => {
                            setSelectedUser(user)
                            setNewRole(user.role)
                            setIsRoleDialogOpen(true)
                          }}>
                            <UserCog size={16} className="mr-2" /> Đổi vai trò
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-xl cursor-pointer" onClick={() => handleToggleStatus(user)}>
                            {user.status === 'ACTIVE' ? (
                              <><UserMinus size={16} className="mr-2" /> Khóa tài khoản</>
                            ) : (
                              <><UserCheck size={16} className="mr-2" /> Kích hoạt</>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-secondary/5" />
                          <DropdownMenuItem className="rounded-xl text-red-500 focus:text-red-500 cursor-pointer" onClick={() => handleDelete(user.userId, user.fullName)}>
                            <Trash2 size={16} className="mr-2" /> Xóa tài khoản
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-8 border-t border-secondary/5 flex items-center justify-between">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Trang {params.page + 1} / {usersPage?.totalPages || 1} ({usersPage?.totalElements || 0} người dùng)
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                disabled={params.page === 0}
                onClick={() => setParams({...params, page: params.page - 1})}
                className="rounded-xl h-10 w-10 border-secondary/20 shadow-sm"
              >
                <ChevronLeft size={18} />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                disabled={params.page + 1 >= (usersPage?.totalPages || 1)}
                onClick={() => setParams({...params, page: params.page + 1})}
                className="rounded-xl h-10 w-10 border-secondary/20 shadow-sm"
              >
                <ChevronRight size={18} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role Update Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white max-w-sm">
          <DialogHeader className="p-8 bg-secondary/5 border-b">
            <DialogTitle className="text-xl font-black text-primary">Thay đổi vai trò</DialogTitle>
            <DialogDescription className="font-medium text-xs">
              Chọn vai trò mới cho người dùng {selectedUser?.fullName}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateRole}>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-primary uppercase tracking-wider ml-1">Chọn vai trò</label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger className="rounded-2xl h-12 bg-secondary/5 border-none focus-visible:ring-primary/20">
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-xl bg-background opacity-100">
                    <SelectItem value="ADMIN" className="rounded-xl">ADMIN</SelectItem>
                    <SelectItem value="MANAGER" className="rounded-xl">MANAGER</SelectItem>
                    <SelectItem value="STAFF" className="rounded-xl">STAFF</SelectItem>
                    <SelectItem value="CUSTOMER" className="rounded-xl">CUSTOMER</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex gap-3">
                <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0" />
                <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase tracking-tighter">
                  Cẩn trọng: Thay đổi vai trò có thể ảnh hưởng đến quyền truy cập của người dùng này vào hệ thống.
                </p>
              </div>
            </div>
            <DialogFooter className="p-8 pt-0 flex gap-3">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsRoleDialogOpen(false)}
                className="rounded-2xl h-12 px-6 font-bold flex-1"
              >
                Hủy
              </Button>
              <Button 
                type="submit" 
                disabled={updateUser.isPending}
                className="rounded-2xl h-12 px-8 font-bold flex-1 gap-2 shadow-lg shadow-primary/20"
              >
                {updateUser.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Xác nhận
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
