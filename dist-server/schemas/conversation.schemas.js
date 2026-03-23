import { z } from 'zod';
export const createConversationSchema = z.object({
    title: z.string().trim().min(1).max(120).optional(),
});
