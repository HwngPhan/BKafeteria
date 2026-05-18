"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserDto } from "@/features/auth/config/auth.schema";
import {
  useAllUsers,
  useDeleteUser,
  useUpdateUser,
} from "@/features/user/data-access/user.queries";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/LanguageProvider";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  MoreHorizontal,
  Phone,
  Search,
  ShieldAlert,
  Trash2,
  UserCheck,
  UserCog,
  UserMinus,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const { t } = useLanguage();
  const [params, setParams] = useState({
    search: "",
    role: "",
    status: "",
    page: 0,
    size: 10,
  });

  const { data: usersPage, isLoading, refetch } = useAllUsers(params);
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  const [newRole, setNewRole] = useState("");

  const handleUpdateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    updateUser.mutate(
      {
        id: selectedUser.userId,
        data: {
          fullName: selectedUser.fullName,
          email: selectedUser.email,
          phoneNumber: selectedUser.phoneNumber,
          studentId: selectedUser.studentId,
          gender: selectedUser.gender,
          dateOfBirth: selectedUser.dateOfBirth,
          role: newRole as UserDto["role"],
          status: selectedUser.status,
        },
      },
      {
        onSuccess: () => {
          toast.success(
            t("admin.users.toast_role").replace(
              "{name}",
              selectedUser.fullName,
            ),
          );
          setIsRoleDialogOpen(false);
        },
      },
    );
  };

  const handleToggleStatus = (user: UserDto) => {
    const nextStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    updateUser.mutate(
      {
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
        },
      },
      {
        onSuccess: () => {
          toast.success(
            (nextStatus === "ACTIVE"
              ? t("admin.users.toast_activated")
              : t("admin.users.toast_locked")
            ).replace("{name}", user.fullName),
          );
          refetch();
        },
      },
    );
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(t("admin.users.confirm_delete").replace("{name}", name))) {
      deleteUser.mutate(
        { id },
        {
          onSuccess: () =>
            toast.success(
              t("admin.users.toast_deleted").replace("{name}", name),
            ),
        },
      );
    }
  };

  if (isLoading && !usersPage) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-16 w-16 text-primary animate-spin" />
      </div>
    );
  }

  const roleColors: Record<string, string> = {
    ADMIN: "bg-red-100 text-red-700 border-red-200",
    MANAGER: "bg-purple-100 text-purple-700 border-purple-200",
    STAFF: "bg-blue-100 text-blue-700 border-blue-200",
    CUSTOMER: "bg-gray-100 text-gray-700 border-gray-200",
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl md:text-4xl font-black tracking-tight text-primary">
          {t("admin.users.title")}
        </h1>
        <p className="text-muted-foreground mt-1 font-medium">
          {t("admin.users.subtitle")}
        </p>
      </div>

      <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-secondary/5 overflow-hidden bg-white">
        <CardHeader className="p-8 pb-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("admin.users.search")}
                value={params.search}
                onChange={(e) =>
                  setParams({ ...params, search: e.target.value, page: 0 })
                }
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
                  <SelectValue placeholder={t("admin.users.all_roles")} />
                </SelectTrigger>

                <SelectContent className="rounded-2xl border-none shadow-xl bg-background opacity-100">
                  <SelectItem value="all">
                    {t("admin.users.all_roles")}
                  </SelectItem>
                  <SelectItem value="ADMIN">{t("role.admin")}</SelectItem>
                  <SelectItem value="MANAGER">{t("role.manager")}</SelectItem>
                  <SelectItem value="STAFF">{t("role.staff")}</SelectItem>
                  <SelectItem value="CUSTOMER">{t("role.customer")}</SelectItem>
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
                  <th className="p-6 pl-8">{t("admin.users.col_user")}</th>
                  <th className="p-6">{t("admin.users.col_contact")}</th>
                  <th className="p-6">{t("admin.users.col_role")}</th>
                  <th className="p-6">{t("admin.users.col_status")}</th>
                  <th className="p-6 pr-8 text-right">
                    {t("admin.users.col_action")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary/5">
                <AnimatePresence mode="popLayout">
                  {usersPage?.content.map((user, index) => (
                    <motion.tr
                      key={user.userId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="group hover:bg-secondary/5 transition-colors"
                    >
                      <td className="p-6 pl-8">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 rounded-xl border-2 border-white shadow-sm">
                            <AvatarImage
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                            />
                            <AvatarFallback className="bg-primary/10 text-primary font-black">
                              {user.fullName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-sm text-primary group-hover:text-primary transition-colors">
                              {user.fullName}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                              MSSV: {user.studentId}
                            </p>
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
                        <Badge
                          className={cn(
                            "rounded-full px-3 py-0.5 text-[10px] font-bold border border-none shadow-sm",
                            roleColors[user.role],
                          )}
                        >
                          {t(`role.${user.role.toLowerCase()}`)}
                        </Badge>
                      </td>
                      <td className="p-6">
                        <Badge
                          className={cn(
                            "rounded-full px-3 py-0.5 text-[10px] font-bold border-none",
                            user.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700",
                          )}
                        >
                          {user.status === "ACTIVE"
                            ? t("admin.users.active")
                            : t("admin.users.inactive")}
                        </Badge>
                      </td>
                      <td className="p-6 pr-8 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-xl h-10 w-10"
                            >
                              <MoreHorizontal size={20} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="rounded-2xl border-none shadow-2xl w-48 p-2 bg-background opacity-100"
                          >
                            <DropdownMenuItem
                              className="rounded-xl cursor-pointer"
                              onClick={() => {
                                setSelectedUser(user);
                                setNewRole(user.role);
                                setIsRoleDialogOpen(true);
                              }}
                            >
                              <UserCog size={16} className="mr-2" />{" "}
                              {t("admin.users.change_role")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="rounded-xl cursor-pointer"
                              onClick={() => handleToggleStatus(user)}
                            >
                              {user.status === "ACTIVE" ? (
                                <>
                                  <UserMinus size={16} className="mr-2" />{" "}
                                  {t("admin.users.lock")}
                                </>
                              ) : (
                                <>
                                  <UserCheck size={16} className="mr-2" />{" "}
                                  {t("admin.users.activate")}
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-secondary/5" />
                            <DropdownMenuItem
                              className="rounded-xl text-red-500 focus:text-red-500 cursor-pointer"
                              onClick={() =>
                                handleDelete(user.userId, user.fullName)
                              }
                            >
                              <Trash2 size={16} className="mr-2" />{" "}
                              {t("admin.users.delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-8 border-t border-secondary/5 flex items-center justify-between">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              {t("admin.users.page_info")
                .replace("{page}", String(params.page + 1))
                .replace("{total}", String(usersPage?.totalPages || 1))
                .replace("{count}", String(usersPage?.totalElements || 0))}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={params.page === 0}
                onClick={() => setParams({ ...params, page: params.page - 1 })}
                className="rounded-xl h-10 w-10 border-secondary/20 shadow-sm"
              >
                <ChevronLeft size={18} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                disabled={params.page + 1 >= (usersPage?.totalPages || 1)}
                onClick={() => setParams({ ...params, page: params.page + 1 })}
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
            <DialogTitle className="text-xl font-black text-primary">
              {t("admin.users.role_dialog_title")}
            </DialogTitle>
            <DialogDescription className="font-medium text-xs">
              {t("admin.users.role_dialog_desc").replace(
                "{name}",
                selectedUser?.fullName || "",
              )}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateRole}>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-primary uppercase tracking-wider ml-1">
                  {t("admin.users.role_select")}
                </label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger className="rounded-2xl h-12 bg-secondary/5 border-none focus-visible:ring-primary/20">
                    <SelectValue placeholder={t("admin.users.role_select")} />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-xl bg-background opacity-100">
                    <SelectItem value="ADMIN" className="rounded-xl">
                      {t("role.admin")}
                    </SelectItem>
                    <SelectItem value="MANAGER" className="rounded-xl">
                      {t("role.manager")}
                    </SelectItem>
                    <SelectItem value="STAFF" className="rounded-xl">
                      {t("role.staff")}
                    </SelectItem>
                    <SelectItem value="CUSTOMER" className="rounded-xl">
                      {t("role.customer")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex gap-3">
                <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0" />
                <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase tracking-tighter">
                  {t("admin.users.role_warning")}
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
                {t("admin.users.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={updateUser.isPending}
                className="rounded-2xl h-12 px-8 font-bold flex-1 gap-2 shadow-lg shadow-primary/20"
              >
                {updateUser.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {t("admin.users.confirm")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
