import { prisma } from '../../lib/prisma.js';

export async function createAttachment(params: {
  messageId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  storagePath: string;
  extractedText?: string;
}) {
  return prisma.attachment.create({
    data: params,
  });
}

export async function getConversationAttachmentsText(conversationId: string): Promise<string> {
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

