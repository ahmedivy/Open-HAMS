import * as z from "zod";

export const groupSchema = z.object({
  title: z.string(),
  zoo_id: z.string(),
});

export type GroupSchema = z.infer<typeof groupSchema>;
