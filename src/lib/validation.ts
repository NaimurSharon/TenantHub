import { z } from "zod";

/** Schema for creating/editing a tenant — matches POST /customers. */
export const createTenantSchema = z.object({
  display_name: z
    .string()
    .min(1, "Display name is required")
    .max(120, "Name is too long"),
  customer_type: z.enum(["individual", "company"]).default("individual"),
  contact_person: z.string().max(120).optional(),
  email: z
    .string()
    .max(100)
    .optional()
    .transform((v) => (v && v.includes("@") ? v : undefined)),
  phone: z.string().max(20).optional(),
  address: z.string().max(300).optional(),
  national_id_no: z.string().max(50).optional(),
  trade_license_no: z.string().max(50).optional(),
});

export type CreateTenantFormData = z.infer<typeof createTenantSchema>;

/** Extract the first human-readable error from a Zod or generic error. */
export function firstError(err: unknown): string {
  if (err instanceof z.ZodError)
    return err.errors[0]?.message ?? "Validation error";
  if (err instanceof Error) return err.message;
  return "Something went wrong";
}
