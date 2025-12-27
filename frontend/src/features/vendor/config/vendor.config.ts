import z from "zod";

export const VendorStatusSchema = z.enum([
    "PENDING",
    "ACCEPTED",
    "REJECTED",
    "CLOSED",
]);

export const BaseVendorEntitySchema = z.object({
    vendorId: z.uuid(),
    createdAt: z.string(),
    updatedAt: z.string(),
})

export const VendorDtoSchema = z
  .object({
    name: z.string().min(1, "Vendor name is required"),
    description: z.string().optional(),
    workingHourFrom: z.string(),
    workingHourTo: z.string(),
  })
  .refine(
    (data) => {
      if (!data.workingHourFrom || !data.workingHourTo) return true;

      const [fromH, fromM] = data.workingHourFrom.split(":").map(Number);
      const [toH, toM] = data.workingHourTo.split(":").map(Number);

      const fromMinutes = fromH * 60 + fromM;
      const toMinutes = toH * 60 + toM;

      return fromMinutes < toMinutes;
    },
    {
      message: "Closing time must be later than opening time",
      path: ["workingHourTo"], // gắn lỗi vào field To
    }
  );

export const VendorEntitySchema = z.object({
    status: VendorStatusSchema,
    managerId: z.string(),
    approvedBy: z.string().optional(),
}).extend(VendorDtoSchema.shape).extend(BaseVendorEntitySchema.shape);

export type VendorStatus = z.infer<typeof VendorStatusSchema>;

export type VendorDto = z.infer<typeof VendorDtoSchema>;

export type VendorEntity = z.infer<typeof VendorEntitySchema>;