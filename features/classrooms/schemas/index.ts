import { z } from "zod";

export const createClassroomSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Classroom name must be at least 2 characters")
    .max(50, "Classroom name must not exceed 50 characters"),
});

export type CreateClassroomFormValues = z.infer<typeof createClassroomSchema>;
