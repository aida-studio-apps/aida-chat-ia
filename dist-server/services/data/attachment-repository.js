import { prisma } from '../../lib/prisma.js';
export async function createAttachment(params) {
    return prisma.attachment.create({
        data: params,
    });
}
export async function getConversationAttachmentsText(conversationId) {
    const attachments = await prisma.attachment.findMany({
        where: {
            message: {
                conversationId,
            },
        },
        orderBy: { createdAt: 'asc' },
    });
    return attachments
        .map((a) => `Document: ${a.fileName}\n${a.extractedText || ''}`)
        .join('\n\n');
}
