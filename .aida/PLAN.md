# Plan d’implémentation — Assistant conversationnel avec mémoire longue durée + pièces jointes PDF

## 1. Stack technique

### Template choisi
**`express-fullstack-ai`**

### Justification
Le cahier des charges impose :
- un **frontend conversationnel** (chat + historique),
- un **backend API** (persistance, upload PDF, orchestration IA),
- de la **mémoire conversationnelle durable**,
- l’**analyse/réutilisation du contenu PDF** dans les réponses,
- une logique IA côté serveur.

Le template `express-fullstack-ai` est le plus adapté car il fournit React + Express + client Azure OpenAI pré-câblé, conforme aux contraintes de sécurité (variables d’environnement injectées automatiquement).

### Dépendances supplémentaires à prévoir (planifiées, non installées ici)
- Frontend
  - `react-router-dom` (navigation Conversation / Historique)
  - `lucide-react` (icônes UI modernes)
  - `date-fns` (formatage dates/messages)
- Backend
  - `multer` (upload PDF multipart)
  - `pdf-parse` (extraction texte PDF)
  - `zod` (validation payloads)
- Base de données
  - `@prisma/client` (runtime DB)
  - `prisma` (devDependency migrations/génération)

---

## 2. Arborescence des fichiers

> Respect strict de la structure du template `express-fullstack-ai`.

```text
/workspace/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx
│   │   │   └── TopNav.tsx
│   │   ├── chat/
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageItem.tsx
│   │   │   ├── MessageComposer.tsx
│   │   │   ├── PdfAttachmentBadge.tsx
│   │   │   └── TypingIndicator.tsx
│   │   ├── history/
│   │   │   ├── ConversationList.tsx
│   │   │   └── ConversationListItem.tsx
│   │   └── common/
│   │       ├── EmptyState.tsx
│   │       ├── LoadingSpinner.tsx
│   │       └── ErrorBanner.tsx
│   ├── hooks/
│   │   ├── useConversations.ts
│   │   ├── useConversationMessages.ts
│   │   └── useSendMessage.ts
│   ├── pages/
│   │   ├── ChatPage.tsx
│   │   └── HistoryPage.tsx
│   ├── services/
│   │   ├── apiClient.ts
│   │   ├── conversationsApi.ts
│   │   └── messagesApi.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── date.ts
│   │   └── constants.ts
│   ├── App.tsx
│   └── main.tsx
├── server/
│   ├── index.ts
│   ├── ai-client.ts
│   ├── routes/
│   │   ├── conversations.ts
│   │   ├── messages.ts
│   │   └── health.ts
│   ├── services/
│   │   ├── ai/
│   │   │   ├── memory-service.ts
│   │   │   ├── pdf-context-service.ts
│   │   │   └── assistant-response-service.ts
│   │   ├── files/
│   │   │   ├── upload-service.ts
│   │   │   └── pdf-extraction-service.ts
│   │   └── data/
│   │       ├── conversation-repository.ts
│   │       ├── message-repository.ts
│   │       ├── memory-repository.ts
│   │       └── attachment-repository.ts
│   ├── middleware/
│   │   ├── error-handler.ts
│   │   └── validate-request.ts
│   ├── schemas/
│   │   ├── conversation.schemas.ts
│   │   └── message.schemas.ts
│   ├── types/
│   │   └── api.ts
│   └── lib/
│       └── prisma.ts
├── prisma/
│   └── schema.prisma
├── package.json
└── index.html
```

### Description synthétique des fichiers
- `prisma/schema.prisma` : schéma relationnel Conversations/Messages/Mémoire/PDF.
- `server/lib/prisma.ts` : client Prisma singleton.
- `server/routes/*.ts` : endpoints REST du domaine.
- `server/services/ai/*` : orchestration mémoire + contexte PDF + génération réponse assistant.
- `server/services/files/*` : upload physique + extraction texte PDF.
- `server/services/data/*` : accès DB encapsulé (repositories).
- `src/pages/*` : 2 écrans demandés (Chat, Historique).
- `src/components/chat/*` : affichage chronologique + composeur + pièce jointe.
- `src/components/history/*` : listing conversations, reprise d’échange.
- `src/hooks/*` : logique de récupération/envoi, découplée des composants.

---

## 3. Modèles de données (TypeScript)

```ts
export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  hasAttachments: boolean;
  lastMessagePreview: string | null;
}

export type MessageAuthor = 'user' | 'assistant';

export interface Attachment {
  id: string;
  messageId: string;
  fileName: string;
  mimeType: 'application/pdf';
  fileSize: number;
  storagePath: string;
  extractedText?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  author: MessageAuthor;
  content: string;
  createdAt: string;
  attachments: Attachment[];
}

export interface ConversationMemory {
  id: string;
  conversationId: string;
  summary: string;
  keyFacts: string[];
  updatedAt: string;
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  attachment?: File;
}

export interface SendMessageResponse {
  userMessage: Message;
  assistantMessage: Message;
  memory: ConversationMemory;
}
```

---

## 3b. Schéma de base de données (Prisma + PostgreSQL)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Conversation {
  id          String    @id @default(cuid())
  title       String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  messages    Message[]
  memory      ConversationMemory?

  @@index([updatedAt])
}

model Message {
  id             String       @id @default(cuid())
  conversationId String
  author         MessageAuthor
  content        String
  createdAt      DateTime     @default(now())
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  attachments    Attachment[]

  @@index([conversationId, createdAt])
}

model Attachment {
  id            String   @id @default(cuid())
  messageId     String
  fileName      String
  mimeType      String
  fileSize      Int
  storagePath   String
  extractedText String?
  createdAt     DateTime @default(now())
  message       Message  @relation(fields: [messageId], references: [id], onDelete: Cascade)

  @@index([messageId])
}

model ConversationMemory {
  id             String       @id @default(cuid())
  conversationId String       @unique
  summary        String
  keyFacts       String[]
  updatedAt      DateTime     @updatedAt
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
}

enum MessageAuthor {
  user
  assistant
}
```

---

## 4. Architecture des composants

- `AppShell` (parent layout global)
  - intègre `TopNav` (liens Chat / Historique)
  - rend les pages via routing.

- `ChatPage`
  - `MessageList` (liste chronologique)
    - `MessageItem` (message user/assistant)
    - `PdfAttachmentBadge` (documents liés)
  - `TypingIndicator` (état envoi/réponse)
  - `MessageComposer` (textarea + upload PDF + submit)

- `HistoryPage`
  - `ConversationList`
    - `ConversationListItem` (titre, date, aperçu, badge pièces jointes)

- composants transverses
  - `LoadingSpinner`, `ErrorBanner`, `EmptyState`.

---

## 5. Gestion d’état

- **Local UI state** : `useState` (champ message, fichier sélectionné, loading).
- **State serveur** : hooks dédiés (`useConversations`, `useConversationMessages`, `useSendMessage`) basés sur appels API.
- **Persistance durable** : PostgreSQL via Prisma (conversations, messages, mémoire, pièces jointes).
- **Fichiers PDF** : stockés côté serveur (dossier uploads), métadonnées + texte extrait en base.
- **Mémoire conversationnelle** : mise à jour après chaque réponse assistant (résumé + keyFacts).

---

## 6. Routing

- `/` → redirection vers `/chat`
- `/chat` → `ChatPage`
- `/chat/:conversationId` → `ChatPage` (reprise conversation)
- `/history` → `HistoryPage`

---

## 7. API Design (backend)

### Conversations
- `GET /api/conversations`
  - Response: `Conversation[]`
- `POST /api/conversations`
  - Body: `{ title?: string }`
  - Response: `Conversation`
- `GET /api/conversations/:id/messages`
  - Response: `Message[]`

### Messages + PDF
- `POST /api/messages`
  - Content-Type: `multipart/form-data`
  - Fields:
    - `conversationId` (string)
    - `content` (string)
    - `attachment` (optional PDF)
  - Flow:
    1. persist user message,
    2. lier/persister PDF + extraction texte si présent,
    3. charger mémoire conversation,
    4. générer réponse assistant via Azure OpenAI,
    5. persister message assistant,
    6. mettre à jour mémoire.
  - Response: `SendMessageResponse`

### Santé
- `GET /api/health`
  - Response: `{ status: "ok" }`

---

## 8. Parties complexes et solutions prévues

1. **Mémoire long terme sans limite**
   - Stockage DB de tous les messages.
   - Mémoire synthétique (`ConversationMemory`) mise à jour incrémentalement (summary + keyFacts) pour éviter de renvoyer tout l’historique au LLM.

2. **Question-réponse basée PDF**
   - Upload serveur via `multer`.
   - Extraction texte avec `pdf-parse`.
   - Injection du texte (ou extrait pertinent) dans le prompt système/contexte du tour courant.

3. **Association stricte PDF ↔ message**
   - FK `Attachment.messageId`, suppression en cascade.
   - Badge visuel côté historique et conversation.

4. **Robustesse IA**
   - Utilisation `server/ai-client.ts` du template.
   - Propagation des erreurs IA (pas de fallback silencieux), logging serveur + erreurs API propres.

5. **UX claire et moderne**
   - Composants compacts, contraste net, actions primaires visibles (écrire, joindre PDF, historique).

---

## 9. Dépendances à installer

```bash
npm install react-router-dom lucide-react date-fns multer pdf-parse zod @prisma/client
npm install -D prisma
```

---

## 10. Ordre d’implémentation

1. `prisma/schema.prisma` (modèle de données source)
2. `server/lib/prisma.ts`
3. `server/types/api.ts`
4. `server/schemas/conversation.schemas.ts`
5. `server/schemas/message.schemas.ts`
6. `server/services/data/conversation-repository.ts`
7. `server/services/data/message-repository.ts`
8. `server/services/data/attachment-repository.ts`
9. `server/services/data/memory-repository.ts`
10. `server/services/files/upload-service.ts`
11. `server/services/files/pdf-extraction-service.ts`
12. `server/services/ai/memory-service.ts`
13. `server/services/ai/pdf-context-service.ts`
14. `server/services/ai/assistant-response-service.ts`
15. `server/middleware/validate-request.ts`
16. `server/middleware/error-handler.ts`
17. `server/routes/health.ts`
18. `server/routes/conversations.ts`
19. `server/routes/messages.ts`
20. `server/index.ts` (brancher routes + middleware)
21. `src/types/index.ts`
22. `src/services/apiClient.ts`
23. `src/services/conversationsApi.ts`
24. `src/services/messagesApi.ts`
25. `src/hooks/useConversations.ts`
26. `src/hooks/useConversationMessages.ts`
27. `src/hooks/useSendMessage.ts`
28. `src/utils/constants.ts`
29. `src/utils/date.ts`
30. `src/components/common/LoadingSpinner.tsx`
31. `src/components/common/ErrorBanner.tsx`
32. `src/components/common/EmptyState.tsx`
33. `src/components/layout/TopNav.tsx`
34. `src/components/layout/AppShell.tsx`
35. `src/components/chat/PdfAttachmentBadge.tsx`
36. `src/components/chat/MessageItem.tsx`
37. `src/components/chat/MessageList.tsx`
38. `src/components/chat/TypingIndicator.tsx`
39. `src/components/chat/MessageComposer.tsx`
40. `src/components/history/ConversationListItem.tsx`
41. `src/components/history/ConversationList.tsx`
42. `src/pages/ChatPage.tsx`
43. `src/pages/HistoryPage.tsx`
44. `src/App.tsx`
45. `src/main.tsx`

---

## 11. Validation par scénarios de test du cahier

- **Test 1 (continuité)** : vérifier que `ConversationMemory.keyFacts` est utilisé dans le prompt.
- **Test 2 (upload PDF)** : vérifier record `Attachment` + affichage badge dans chat/historique.
- **Test 3 (question sur PDF)** : vérifier que `extractedText` est injecté dans le contexte LLM du tour.
- **Test 4 (mémoire + PDF)** : vérifier combinaison des deux contextes (mémoire + document) avant génération réponse.
