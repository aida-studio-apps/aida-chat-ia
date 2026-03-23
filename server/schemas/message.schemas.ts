import { z } from 'zod';

export const sendMessageBodySchema = z.object({
  conversationId: z.string().cuid(),
  content: z.string().trim().min(1).max(8000),
});

