import { z } from "zod";

export const phoneE164Regex = /^\+[1-9]\d{7,14}$/;

export const studentSchema = z.object({
  rollNumber: z
    .string()
    .trim()
    .max(20, "Roll number must not exceed 20 characters")
    .optional(),
  name: z
    .string()
    .trim()
    .min(2, "Student name must be at least 2 characters")
    .max(60, "Student name must not exceed 60 characters"),
  parentWhatsappNumber: z
    .string()
    .trim()
    .regex(
      phoneE164Regex,
      "WhatsApp number must be in international E.164 format starting with '+' (e.g. +923001234567)"
    ),
});

export type StudentFormValues = z.infer<typeof studentSchema>;
