import { z } from 'zod';

export const createExamSchema = z.object({

  title: z
    .string()
    .min(3)
    .max(200),

  description: z
    .string()
    .optional(),

  duration: z
    .number()
    .min(1),

});
