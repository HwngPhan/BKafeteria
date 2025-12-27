"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAuth } from "@/providers/AuthProvider";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { User } from "@/features/user/config/user.config";
import { useUpdateMe } from "@/features/user/data-access/user.queries";
import { toast } from "sonner";

// ================= Schema =================
export const userSchema = z.object({
  fullName: z.string().min(1, "Required"),
  email: z.string().email(),
  phoneNumber: z.string().min(1),
  studentId: z.string().min(1),
  gender: z.enum(["MALE", "FEMALE"]),
  dateOfBirth: z.string(),
});

export type UserFormValues = z.infer<typeof userSchema>;

// ================= Helpers =================
const EMPTY_FORM: UserFormValues = {
  fullName: "",
  email: "",
  phoneNumber: "",
  studentId: "",
  gender: "MALE",
  dateOfBirth: "",
};

const mapUserToForm = (user: User): UserFormValues => ({
  fullName: user.fullName ?? "",
  email: user.email ?? "",
  phoneNumber: user.phoneNumber ?? "",
  studentId: user.studentId ?? "",
  gender: user.gender ?? "MALE",
  dateOfBirth: user.dateOfBirth ?? "",
});

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-2">
      <Label className="text-muted-foreground sm:col-span-1">{label}</Label>
      <p className="sm:col-span-2 text-sm font-medium">{value || "—"}</p>
    </div>
  );
}

export default function UserSettingsPage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const updateMe = useUpdateMe();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: EMPTY_FORM,
    mode: "onChange",
  });

  const {
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
  } = form;

  useEffect(() => {
    if (!user) return;
    reset(mapUserToForm(user));
  }, [user, reset]);

  if (!user) return null;

  const onEdit = () => {
    reset(mapUserToForm(user));
    setIsEditing(true);
  };

  const onCancel = () => {
    reset(mapUserToForm(user));
    setIsEditing(false);
  };

  const onSave = async (data: UserFormValues) => {
    // TODO: call update user API
    try {
        await updateMe.mutateAsync(data);
        reset(data);
        setIsEditing(false);
        toast.success('Profile information updated successfully.');
    } catch (error) {
        toast.error('Failed to update profile information. Please try again.');
    }
  };

  return (
    <div className="space-y-8 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Profile information</h2>
          <p className="text-sm text-muted-foreground">
            View and update your personal information
          </p>
        </div>
        {!isEditing && <Button onClick={onEdit}>Edit</Button>}
      </div>

      <Separator />

      {/* View mode */}
      {!isEditing && (
        <div className="space-y-1">
          <InfoRow label="Full name" value={user.fullName} />
          <Separator />
          <InfoRow label="Email" value={user.email} />
          <Separator />
          <InfoRow label="Phone number" value={user.phoneNumber} />
          <Separator />
          <InfoRow label="Student ID" value={user.studentId} />
          <Separator />
          <InfoRow label="Gender" value={user.gender} />
          <Separator />
          <InfoRow label="Date of birth" value={user.dateOfBirth} />
        </div>
      )}

      {/* Edit mode */}
      {isEditing && (
        <Form {...form}>
          <form onSubmit={handleSubmit(onSave)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input disabled {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="studentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student ID</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!isDirty || isSubmitting}>
                Save changes
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
