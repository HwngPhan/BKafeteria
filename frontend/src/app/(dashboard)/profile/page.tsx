'use client'

import { useAuth } from '@/providers/AuthProvider'
import { useUpdateMe } from '@/features/user/data-access/user.queries'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  CreditCard, 
  Calendar, 
  Shield, 
  Trophy, 
  Wallet,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { ImageUpload } from '@/components/ui/image-upload'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'

export default function ProfilePage() {
  const { user } = useAuth()
  const updateMe = useUpdateMe()
  
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    gender: 'MALE' as 'MALE' | 'FEMALE',
    dateOfBirth: '',
    avatarUrl: ''
  })

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || '',
        gender: user.gender as 'MALE' | 'FEMALE' || 'MALE',
        dateOfBirth: user.dateOfBirth || '',
        avatarUrl: user.avatarUrl || ''
      })
    }
  }, [user])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMe.mutate(formData, {
      onSuccess: () => {
        toast.success('Cập nhật hồ sơ thành công')
      },
      onError: (error: any) => {
        toast.error('Cập nhật thất bại: ' + error.message)
      }
    })
  }

  if (!user) return null

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-2"
      >
        <h1 className="text-4xl font-black tracking-tight text-primary">Hồ sơ cá nhân</h1>
        <p className="text-muted-foreground font-medium">Quản lý thông tin tài khoản và cài đặt của bạn.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Summary */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-1 space-y-6"
        >
          <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-secondary/5 overflow-hidden bg-white">
            <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
              <ImageUpload 
                value={formData.avatarUrl}
                onChange={(url) => setFormData({ ...formData, avatarUrl: url })}
                className="w-full"
              />
              
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-primary">{user.fullName}</h3>
                <Badge variant="secondary" className="rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary border-none">
                  {user.role}
                </Badge>
              </div>

              <div className="grid grid-cols-2 w-full gap-4 pt-4 border-t border-secondary/5">
                <div className="flex flex-col items-center p-3 rounded-2xl bg-secondary/5">
                  <Wallet size={18} className="text-primary mb-1" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Số dư</span>
                  <span className="font-black text-primary">{(user.balance || 0).toLocaleString()}đ</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-2xl bg-secondary/5">
                  <Trophy size={18} className="text-amber-500 mb-1" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Điểm</span>
                  <span className="font-black text-amber-600">{user.points || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-none shadow-xl shadow-secondary/5 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/20">
                  <Shield size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Trạng thái</p>
                  <p className="font-bold">Đã xác minh</p>
                </div>
                <CheckCircle2 size={24} className="ml-auto text-white" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column: Edit Form */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-secondary/5 bg-white overflow-hidden">
              <CardHeader className="p-8 border-b bg-secondary/5">
                <CardTitle className="text-xl font-black text-primary flex items-center gap-2">
                  <UserIcon size={20} />
                  Thông tin cá nhân
                </CardTitle>
                <CardDescription className="font-medium text-xs">
                  Cập nhật các thông tin cơ bản về bạn để mọi người có thể nhận diện.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-primary uppercase tracking-wider ml-1">Họ và tên</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="pl-11 rounded-2xl h-12 bg-secondary/5 border-none focus-visible:ring-primary/20"
                        placeholder="Nguyễn Văn A"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-primary uppercase tracking-wider ml-1">Số điện thoại</Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        className="pl-11 rounded-2xl h-12 bg-secondary/5 border-none focus-visible:ring-primary/20"
                        placeholder="0123456789"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-primary uppercase tracking-wider ml-1">Giới tính</Label>
                    <Select 
                      value={formData.gender}
                      onValueChange={(v: any) => setFormData({ ...formData, gender: v })}
                    >
                      <SelectTrigger className="rounded-2xl h-12 bg-secondary/5 border-none focus-visible:ring-primary/20">
                        <SelectValue placeholder="Chọn giới tính" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-xl">
                        <SelectItem value="MALE" className="rounded-xl">Nam</SelectItem>
                        <SelectItem value="FEMALE" className="rounded-xl">Nữ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-primary uppercase tracking-wider ml-1">Ngày sinh</Label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className="pl-11 rounded-2xl h-12 bg-secondary/5 border-none focus-visible:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-secondary/5 bg-white overflow-hidden">
              <CardHeader className="p-8 border-b bg-secondary/5">
                <CardTitle className="text-xl font-black text-primary flex items-center gap-2">
                  <Shield size={20} />
                  Thông tin tài khoản
                </CardTitle>
                <CardDescription className="font-medium text-xs">
                  Các thông tin định danh không thể thay đổi.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-primary uppercase tracking-wider ml-1">Email</Label>
                    <div className="relative opacity-60">
                      <Mail className="absolute left-4 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        value={user.email}
                        disabled
                        className="pl-11 rounded-2xl h-12 bg-secondary/5 border-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-primary uppercase tracking-wider ml-1">Mã số sinh viên</Label>
                    <div className="relative opacity-60">
                      <CreditCard className="absolute left-4 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        value={user.studentId}
                        disabled
                        className="pl-11 rounded-2xl h-12 bg-secondary/5 border-none"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                disabled={updateMe.isPending}
                className="rounded-2xl h-14 px-10 font-bold gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
              >
                {updateMe.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <CheckCircle2 size={20} />
                )}
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
