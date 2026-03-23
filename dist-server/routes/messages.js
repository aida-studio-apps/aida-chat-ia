import { Router } from 'express';
import { uploadPdf } from '../services/files/upload-service.js';
import { extractPdfText } from '../services/files/pdf-extraction-service.js';
import { sendMessageBodySchema } from '../schemas/message.schemas.js';
import { createMessage } from '../services/data/message-repository.js';
import { createAttachment } from '../services/data/attachment-repository.js';
import { generateAssistantResponse } from '../services/ai/assistant-response-service.js';
export const messagesRouter = Router();
messagesRouter.post('/', uploadPdf.single('attachment'), async (req, res, next) => {
    const requestWithFile = req;
    try {
        const parsed = sendMessageBodySchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.flatten() });
        }
        const { conversationId, content } = parsed.data;
        const userMessage = await createMessage({
            conversationId,
            author: 'user',
            content,
        });
        if (requestWithFile.file) {
            const extractedText = await extractPdfText(requestWithFile.file.path);
            await createAttachment({
                messageId: userMessage.id,
                fileName: requestWithFile.file.originalname,
                mimeType: requestWithFile.file.mimetype,
                fileSize: requestWithFile.file.size,
                storagePath: requestWithFile.file.path,
                extractedText,
            });
        }
        const { assistantText, memory } = await generateAssistantResponse(conversationId, content);
        const assistantMessage = await createMessage({
            conversationId,
            author: 'assistant',
            content: assistantText,
        });
        res.status(201).json({
            userMessage: {
                id: userMessage.id,
                conversationId: userMessage.conversationId,
                author: userMessage.author,
                content: userMessage.content,
                createdAt: userMessage.createdAt.toISOString(),
                attachments: [],
            },
            assistantMessage: {
                id: assistantMessage.id,
                conversationId: assistantMessage.conversationId,
                author: assistantMessage.author,
                content: assistantMessage.content,
                createdAt: assistantMessage.createdAt.toISOString(),
                attachments: [],
            },
            memory,
        });
    }
    catch (error) {
        next(error);
    }
});
