import { z } from "zod";

export const eventTypeSchema = z.object({
  name: z.string(),
  zoo_id: z.string(),
  group_id: z.string(),
});

export type EventTypeSchema = z.infer<typeof eventTypeSchema>;
