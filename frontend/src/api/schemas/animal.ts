import * as z from "zod";

export const animalSchema = z.object({
  name: z.string().min(2, "Name must be between 2 and 50 characters").max(50),
  species: z
    .string()
    .min(2, "Species must be between 2 and 50 characters")
    .max(50),
  kind: z.string().min(2, "Kind must be between 2 and 50 characters").max(50),
  description: z
    .string()
    .min(2, "Description must be between 2 and 500 characters")
    .max(500),
  image: z.string().url("Invalid image URL"),
  handling_enabled: z.boolean(),
  max_daily_checkout_hours: z.number().int().positive(),
  max_daily_checkouts: z.number().int().positive(),
  rest_time: z.number().positive(),
  tier: z.number().int().positive(),
});

export type AnimalSchema = z.infer<typeof animalSchema>;
