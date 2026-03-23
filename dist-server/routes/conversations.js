import { Router } from 'express';
import { listConversations, createConversation } from '../services/data/conversation-repository.js';
import { getConversationMessages } from '../services/data/message-repository.js';
import { validateBody } from '../middleware/validate-request.js';
import { createConversationSchema } from '../schemas/conversation.schemas.js';
export const conversationsRouter = Router();
conversationsRouter.get('/', async (_req, res, next) => {
    try {
        const data = await listConversations();
        res.json(data);
    }
    catch (error) {
        next(error);
    }
});
conversationsRouter.post('/', validateBody(createConversationSchema), async (req, res, next) => {
    try {
        const created = await createConversation(req.body.title);
        res.status(201).json(created);
    }
    catch (error) {
        next(error);
    }
});
conversationsRouter.get('/:id/messages', async (req, res, next) => {
    try {
        const messages = await getConversationMessages(req.params.id);
        res.json(messages);
    }
    catch (error) {
        next(error);
    }
});
