import { prisma } from '../../lib/prisma.js';
export async function listConversations() {
    const conversations = await prisma.conversation.findMany({
        orderBy: { updatedAt: 'desc' },
        include: {
            messages: {
                orderBy: { createdAt: 'desc' },
                take: 1,
                include: { attachments: true },
            },
        },
    });
    return conversations.map((c) => ({
        id: c.id,
        title: c.title,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        hasAttachments: c.messages.some((m) => m.attachments.length > 0),
        lastMessagePreview: c.messages[0]?.content?.slice(0, 120) || null,
    }));
}
export async function createConversation(title) {
    const conversation = await prisma.conversation.create({
        data: { title: title?.trim() || 'Nouvelle conversation' },
    });
    return {
        id: conversation.id,
        title: conversation.title,
        createdAt: conversation.createdAt.toISOString(),
        updatedAt: conversation.updatedAt.toISOString(),
        hasAttachments: false,
        lastMessagePreview: null,
    };
}
