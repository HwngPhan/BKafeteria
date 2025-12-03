"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RegisterObject, RegisterObjectSchema } from "@/features/auth/config/auth.config";
import { useRegister } from "@/features/auth/data-access/auth.queries";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  const registerMutation = useRegister();

  const form = useForm<RegisterObject>({
    resolver: zodResolver(RegisterObjectSchema),
    defaultValues: {
      fullName: "",
      studentId: "",
      email: "",
      password: "",
      gender: undefined,
      dateOfBirth: undefined,
      phoneNumber: "",
    },
  });

  const onSubmit = async (data: RegisterObject) => {
    // Check confirm password manually
    if (data.password && confirmPassword && data.password !== confirmPassword) {
      setConfirmError("Passwords do not match");
      return;
    }

    setConfirmError("");

    try {
      setLoading(true);
      await registerMutation.mutateAsync(data);
      // TODO: redirect or show success
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      router.push("/verify");
    }
  };

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  return (
    <div className="w-full h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="relative hidden md:block">
        <Image src="/auth.png" alt="Authentication" fill className="object-cover" />
      </div>

      <div className="flex items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-md p-6 rounded-2xl shadow-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Sign Up</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Create a new account</p>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                {/* Full Name */}
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Student ID */}
                <FormField
                  control={form.control}
                  name="studentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student ID</FormLabel>
                      <FormControl>
                        <Input placeholder="1234567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type={showPassword ? "text" : "password"} {...field} />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Confirm Password (not in form) */}
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </FormControl>
                  {confirmError && <p className="text-red-500 text-sm">{confirmError}</p>}
                </FormItem>

                {/* Gender */}
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MALE">Male</SelectItem>
                            <SelectItem value="FEMALE">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date of Birth */}
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => {
                    const date = field.value ? new Date(field.value) : undefined;
                    const day = date?.getDate();
                    const month = date?.getMonth();
                    const year = date?.getFullYear();

                    return (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <div className="flex space-x-2">
                          <Select
                            value={day?.toString() || ""}
                            onValueChange={(val) => {
                              const d = Number(val);
                              const m = month ?? 0;
                              const y = year ?? new Date().getFullYear();
                              field.onChange(new Date(y, m, d));
                            }}
                          >
                            <SelectTrigger><SelectValue placeholder="Day" /></SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                                <SelectItem key={d} value={d.toString()}>{d}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select
                            value={month !== undefined ? month.toString() : ""}
                            onValueChange={(val) => {
                              const m = Number(val);
                              const d = day ?? 1;
                              const y = year ?? new Date().getFullYear();
                              field.onChange(new Date(y, m, d));
                            }}
                          >
                            <SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger>
                            <SelectContent>
                              {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m,i) => (
                                <SelectItem key={i} value={i.toString()}>{m}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Year"
                              value={year || ""}
                              onChange={(e) => {
                                const y = Number(e.target.value);
                                const d = day ?? 1;
                                const m = month ?? 0;
                                if (!isNaN(y)) field.onChange(new Date(y, m, d));
                              }}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                {/* Phone Number */}
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="0123456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button className="w-full" type="submit" disabled={loading}>
                  {loading ? "Registering..." : "Sign Up"}
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-2">
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <a href="/login" className="text-primary font-medium hover:underline">Login</a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
