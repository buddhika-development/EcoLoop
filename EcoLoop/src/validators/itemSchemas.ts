import { z } from "zod";

export const categoryEnum = z.enum([
    "home-appliance",
    "electronics",
    "office-equipment",
    "furniture",
    "other",
]);

export const step1Schema = z.object({
    name: z.string().min(2, "Please enter an item name"),
    category: categoryEnum,
    brand: z.string().optional(),
    model: z.string().optional(),
    description: z.string().max(500, "Keep it under 500 characters").optional(),
});

export type Step1Values = z.infer<typeof step1Schema>;

export const step2Schema = z.object({
    purchaseDate: z.string().min(1, "Purchase date is required"),
    warrantyMonths: z
        .number()
        .int()
        .nonnegative("Must be 0 or greater")
        .optional()
        .or(z.nan().transform(() => 0) as any),
    warrantyExpiry: z.string().optional(), // auto-computed; user may override
    trackWarranty: z.boolean().optional(),
});

export type Step2Values = z.infer<typeof step2Schema>;

export const itemMediaSchema = z.object({
    imagesLocal: z.array(z.any()).min(1, "Please add at least one image"),
    docsLocal: z.array(z.any()).optional(),
});
export type ItemMediaValues = z.infer<typeof itemMediaSchema>;
