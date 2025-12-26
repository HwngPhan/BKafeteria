"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { VendorDtoSchema } from "@/features/vendor/config/vendor.config";
import { CreateVendorApi } from "../data-access/vendor.api";

type CreateVendorInput = z.infer<typeof VendorDtoSchema>;

interface CreateVendorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

export function CreateVendorDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateVendorDialogProps) {
  const form = useForm<CreateVendorInput>({
    resolver: zodResolver(VendorDtoSchema),
    defaultValues: {
      name: "",
      description: "",
      workingHourFrom: "",
      workingHourTo: "",
    },
  });

  const onSubmit = async (values: CreateVendorInput) => {
    await CreateVendorApi(values);

    onOpenChange(false);
    form.reset();
    onCreated?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Vendor</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor name</FormLabel>
                  <FormControl>
                    <Input placeholder="Canteen A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Best noodles in campus"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="workingHourFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Open</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="workingHourTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Close</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
