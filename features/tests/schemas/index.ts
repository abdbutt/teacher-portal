import { z } from "zod";

export const createTestSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(2, "Subject name must be at least 2 characters")
    .max(60, "Subject name must not exceed 60 characters"),
  totalMarks: z.coerce
    .number()
    .min(1, "Total marks must be at least 1")
    .max(1000, "Total marks cannot exceed 1000"),
  date: z.string().min(1, "Test date is required"),
});

export type CreateTestFormValues = z.infer<typeof createTestSchema>;
