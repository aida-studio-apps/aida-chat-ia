import { getMemory, upsertMemory } from '../data/memory-repository.js';
export async function getMemoryContext(conversationId) {
    const memory = await getMemory(conversationId);
    if (!memory)
        return '';
    return `Résumé mémoire:\n${memory.summary}\n\nFaits clés:\n- ${memory.keyFacts.join('\n- ')}`;
}
export async function updateMemory(conversationId, summary, keyFacts) {
    const saved = await upsertMemory(conversationId, summary, keyFacts);
    return {
        id: saved.id,
        conversationId: saved.conversationId,
        summary: saved.summary,
        keyFacts: saved.keyFacts,
        updatedAt: saved.updatedAt.toISOString(),
    };
}
