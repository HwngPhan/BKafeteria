"use client";

import { useLanguage } from "@/providers/LanguageProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Loader2, Utensils } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRegister } from "@/features/auth/data-access/auth.queries";

/* ---------------- SCHEMA ---------------- */

// Định nghĩa kiểu dữ liệu gửi lên API (RegisterObject)
type RegisterObject = {
  fullName: string;
  email: string;
  phoneNumber: string;
  studentId: string;
  gender: "MALE" | "FEMALE";
  dateOfBirth: Date;
  password: string;
};

/* ---------------- HELPERS ---------------- */

const RequiredMark = () => <span className="text-red-500 ml-1">*</span>;

const range = (start: number, end: number) => {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};

function AbsoluteFormMessage() {
  return (
    <FormMessage className="absolute left-0 top-full mt-1 text-xs font-medium text-red-500 animate-in fade-in-0 slide-in-from-top-1" />
  );
}

/* ---------------- PAGE ---------------- */

export default function RegisterPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const formSchema = useMemo(
    () =>
      z
        .object({
          fullName: z.string().min(2, t("register.fullname_error")),
          email: z.string().email(t("register.email_invalid")),
          studentId: z.string().length(7, t("register.student_id_error")),
          phoneNumber: z
            .string()
            .min(10, t("register.phone_min"))
            .regex(/^[0-9]+$/, t("register.phone_digits")),
          gender: z.enum(["MALE", "FEMALE"], {
            error: t("register.gender_error"),
          }),
          day: z.string().min(1, t("register.day_error")),
          month: z.string().min(1, t("register.month_error")),
          year: z.string().min(1, t("register.year_error")),
          password: z.string().min(6, t("register.password_min")),
          confirmPassword: z.string(),
        })
        .refine((data) => data.password === data.confirmPassword, {
          path: ["confirmPassword"],
          message: t("register.confirm_mismatch"),
        }),
    [t],
  );

  const { mutateAsync: registerMutation } = useRegister();

  const currentYear = new Date().getFullYear();
  const years = useMemo(
    () => range(1950, currentYear - 5).reverse(),
    [currentYear],
  );
  const months = useMemo(() => range(1, 12), []);
  const days = useMemo(() => range(1, 31), []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      studentId: "",
      password: "",
      confirmPassword: "",
      day: "",
      month: "",
      year: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (values.password !== values.confirmPassword) {
      toast.error(t("register.password_mismatch"));
      return;
    }

    const { day, month, year, confirmPassword: _confirmPassword, ...rest } = values;
    const dob = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    if (dob.getMonth() !== parseInt(month) - 1) {
      form.setError("day", { message: t("register.dob_invalid") });
      toast.error(t("register.dob_invalid"));
      return;
    }

    const apiData: RegisterObject = {
      ...rest,
      dateOfBirth: dob,
    } as RegisterObject;

    try {
      setIsLoading(true);
      await registerMutation(apiData);
      toast.success(t("register.success"));
      router.push("/verify");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : t("register.failed");
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-2xl"
      >
        <Card className="rounded-3xl border-4 border-dashed border-secondary/30 shadow-xl">
          <CardHeader className="bg-secondary/5 text-center pt-10 pb-8">
            <div className="mx-auto mb-4 w-fit rounded-2xl bg-white p-4 shadow-sm">
              <Utensils className="h-10 w-10 text-secondary" />
            </div>
            <CardTitle className="text-3xl font-bold text-primary">
              {t("register.title")}
            </CardTitle>
            <CardDescription className="mt-2 text-base">
              {t("register.subtitle")}{" "}
              <span className="font-semibold text-secondary">BKAFETERIA</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8 w-full"
              >
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem className="w-full relative">
                      <FormLabel>
                        {t("register.fullname")} <RequiredMark />
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t("register.fullname_placeholder")}
                          className="h-12 w-full rounded-xl border-secondary/20 bg-secondary/5 focus:bg-background transition-colors"
                        />
                      </FormControl>
                      <AbsoluteFormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                  <FormField
                    control={form.control}
                    name="studentId"
                    render={({ field }) => (
                      <FormItem className="w-full relative">
                        <FormLabel>
                          {t("register.student_id")} <RequiredMark />
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t("register.student_id_placeholder")}
                            className="h-12 w-full rounded-xl border-secondary/20"
                          />
                        </FormControl>
                        <AbsoluteFormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem className="w-full relative">
                        <FormLabel>
                          {t("register.gender")} <RequiredMark />
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 w-full rounded-xl border-secondary/20">
                              <SelectValue
                                placeholder={t("register.gender_select")}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent
                            position="popper"
                            className="bg-background z-50"
                          >
                            <SelectItem value="MALE">
                              {t("register.gender_male")}
                            </SelectItem>
                            <SelectItem value="FEMALE">
                              {t("register.gender_female")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <AbsoluteFormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="w-full">
                  <FormLabel>
                    {t("register.dob")} <RequiredMark />
                  </FormLabel>
                  <div className="grid grid-cols-3 gap-4 w-full mt-2">
                    <FormField
                      control={form.control}
                      name="day"
                      render={({ field }) => (
                        <FormItem className="relative">
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12 w-full rounded-xl border-secondary/20">
                                <SelectValue placeholder={t("register.day")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent
                              position="popper"
                              className="h-[200px] bg-background z-50"
                            >
                              {days.map((d) => (
                                <SelectItem key={d} value={d.toString()}>
                                  {d}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <AbsoluteFormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="month"
                      render={({ field }) => (
                        <FormItem className="relative">
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12 w-full rounded-xl border-secondary/20">
                                <SelectValue
                                  placeholder={t("register.month")}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent
                              position="popper"
                              className="h-[200px] bg-background z-50"
                            >
                              {months.map((m) => (
                                <SelectItem key={m} value={m.toString()}>
                                  {t(`register.month_prefix${m}`)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <AbsoluteFormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem className="relative">
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12 w-full rounded-xl border-secondary/20">
                                <SelectValue placeholder={t("register.year")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent
                              position="popper"
                              className="h-[200px] bg-background z-50"
                            >
                              {years.map((y) => (
                                <SelectItem key={y} value={y.toString()}>
                                  {y}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <AbsoluteFormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem className="w-full relative">
                        <FormLabel>
                          {t("register.phone")} <RequiredMark />
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="tel"
                            placeholder="0xxxxxxxxx"
                            className="h-12 w-full rounded-xl border-secondary/20"
                          />
                        </FormControl>
                        <AbsoluteFormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="w-full relative">
                        <FormLabel>
                          {t("register.email")} <RequiredMark />
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder={t("register.email_placeholder")}
                            className="h-12 w-full rounded-xl border-secondary/20"
                          />
                        </FormControl>
                        <AbsoluteFormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="w-full relative">
                        <FormLabel>
                          {t("register.password")} <RequiredMark />
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                            className="h-12 w-full rounded-xl border-secondary/20"
                          />
                        </FormControl>
                        <AbsoluteFormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem className="w-full relative">
                        <FormLabel>
                          {t("register.confirm_password")} <RequiredMark />
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                            className="h-12 w-full rounded-xl border-secondary/20"
                          />
                        </FormControl>
                        <AbsoluteFormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-14 w-full rounded-xl bg-primary text-lg font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 mt-4 transition-all hover:scale-[1.01]"
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  )}
                  {t("register.submit")}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  {t("register.already_account")}{" "}
                  <Button
                    type="button"
                    variant="link"
                    className="px-1 font-bold text-secondary text-base"
                    onClick={() => router.push("/login")}
                  >
                    {t("register.login")}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
