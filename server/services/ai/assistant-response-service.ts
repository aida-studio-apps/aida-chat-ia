import { openai, DEPLOYMENT } from '../../ai-client.js';
import { getConversationMessages } from '../data/message-repository.js';
import { getMemoryContext, updateMemory } from './memory-service.js';
import { getPdfContext } from './pdf-context-service.js';

function getFullError(error: any): string {
  return [error?.status, error?.code, error?.error?.message || error?.message]
    .filter(Boolean)
    .join(' | ');
}

export async function generateAssistantResponse(conversationId: string, userContent: string) {
  try {
    const [history, memoryContext, pdfContext] = await Promise.all([
      getConversationMessages(conversationId),
      getMemoryContext(conversationId),
      getPdfContext(conversationId),
    ]);

    const systemPrompt = [
      'Tu es un assistant conversationnel francophone.',
      'Tu dois réutiliser les informations pertinentes des échanges précédents et de la mémoire.',
      'Si un PDF a été fourni, utilise son contenu pour répondre précisément.',
      'Sois clair, structuré et utile.',
      memoryContext,
      pdfContext,
    ]
      .filter(Boolean)
      .join('\n\n');

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...history.map((m) => ({ role: m.author === 'user' ? ('user' as const) : ('assistant' as const), content: m.content })),
      { role: 'user' as const, content: userContent },
    ];

    const completion = await openai.chat.completions.create({
      model: DEPLOYMENT,
      messages,
      temperature: 0.3,
    });

    const assistantText = completion.choices[0]?.message?.content?.trim() || 'Je n’ai pas pu générer de réponse.';

    const memoryCompletion = await openai.chat.completions.create({
      model: DEPLOYMENT,
      temperature: 0,
      messages: [
        { role: 'system', content: 'Résume les infos stables utiles sur l’utilisateur et liste 5 faits clés max en JSON strict {"summary":string,"keyFacts":string[]}.' },
        { role: 'user', content: `Historique:\n${history.map((m) => `${m.author}: ${m.content}`).join('\n')}\n\nNouveau message utilisateur:\n${userContent}\n\nRéponse assistant:\n${assistantText}` },
      ],
    });

    let summary = 'Mémoire conversationnelle mise à jour.';
    let keyFacts: string[] = [];
    const raw = memoryCompletion.choices[0]?.message?.content || '{}';
    try {
      const parsed = JSON.parse(raw);
      summary = typeof parsed.summary === 'string' ? parsed.summary : summary;
      keyFacts = Array.isArray(parsed.keyFacts)
        ? parsed.keyFacts.slice(0, 5).filter((x: unknown): x is string => typeof x === 'string')
        : [];
    } catch {
      summary = raw.slice(0, 600);
    }

    const memory = await updateMemory(conversationId, summary, keyFacts);

    return { assistantText, memory };
  } catch (error: any) {
    throw new Error(getFullError(error));
  }
}


