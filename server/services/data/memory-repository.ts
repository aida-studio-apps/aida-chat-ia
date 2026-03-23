import { prisma } from '../../lib/prisma.js';

export async function getMemory(conversationId: string) {
  return prisma.conversationMemory.findUnique({ where: { conversationId } });
}

export async function upsertMemory(conversationId: string, summary: string, keyFacts: string[]) {
  return prisma.conversationMemory.upsert({
    where: { conversationId },
    update: { summary, keyFacts },
    create: { conversationId, summary, keyFacts },
  });
}

