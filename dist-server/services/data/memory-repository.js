import { prisma } from '../../lib/prisma.js';
export async function getMemory(conversationId) {
    return prisma.conversationMemory.findUnique({ where: { conversationId } });
}
export async function upsertMemory(conversationId, summary, keyFacts) {
    return prisma.conversationMemory.upsert({
        where: { conversationId },
        update: { summary, keyFacts },
        create: { conversationId, summary, keyFacts },
    });
}
