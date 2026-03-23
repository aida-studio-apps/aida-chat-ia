import { MessageAuthor } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';

export async function getConversationMessages(conversationId: string) {
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    include: { attachments: true },
  });

  return messages.map((m) => ({
    id: m.id,
    conversationId: m.conversationId,
    author: m.author,
    content: m.content,
    createdAt: m.createdAt.toISOString(),
    attachments: m.attachments.map((a) => ({
      id: a.id,
      messageId: a.messageId,
      fileName: a.fileName,
      mimeType: 'application/pdf' as const,
      fileSize: a.fileSize,
      storagePath: a.storagePath,
      extractedText: a.extractedText || undefined,
      createdAt: a.createdAt.toISOString(),
    })),
  }));
}

export async function createMessage(params: {
  conversationId: string;
  author: MessageAuthor;
  content: string;
}) {
  return prisma.message.create({
    data: {
      conversationId: params.conversationId,
      author: params.author,
      content: params.content,
    },
  });
}

