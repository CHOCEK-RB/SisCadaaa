import { z } from "zod";

export const updateTopicsSchema = z.object({
  completedTopics: z.array(z.string()).default([]),
  groupName: z.string(),
});

export type UpdateTopicsSchema = typeof updateTopicsSchema;
