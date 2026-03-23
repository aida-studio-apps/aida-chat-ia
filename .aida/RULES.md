# Conventions de code — Projet `express-fullstack-ai`

## 1) Principes généraux
- Priorité à la lisibilité et à la simplicité.
- Aucune logique métier complexe dans les composants UI.
- Séparer clairement : **routes** → **services** → **repositories**.
- Éviter toute duplication (DRY) pour les types, validators, appels API.

## 2) Nommage
- Composants React : **PascalCase** (`MessageComposer.tsx`).
- Hooks : préfixe `use` + camelCase (`useConversationMessages.ts`).
- Fonctions/variables : **camelCase**.
- Constantes globales : **UPPER_SNAKE_CASE**.
- Fichiers backend service/repository : kebab-case (`memory-repository.ts`).

## 3) Exports
- Composants React : `export default`.
- Helpers/services/types : exports nommés.
- Un seul composant principal par fichier `.tsx`.

## 4) Imports (ordre obligatoire)
1. `react`
2. bibliothèques tierces
3. imports internes absolus/relatifs (components, hooks, services)
4. types
5. styles/assets

Séparer chaque groupe par une ligne vide.

## 5) TypeScript
- `any` interdit.
- Tous les paramètres/retours de fonctions doivent être typés.
- Centraliser les interfaces métier dans `src/types/index.ts` et `server/types/api.ts`.
- Préférer `interface` pour objets métier, `type` pour unions/littéraux.

## 6) React / Frontend
- Composants en fonctions fléchées.
- État local via `useState`; effets via `useEffect` strictement nécessaires.
- Hooks personnalisés pour accès API et orchestration asynchrone.
- Tailwind dans le JSX; CSS custom uniquement si blocage réel.
- Accessibilité minimale : labels inputs, boutons explicites, états disabled pendant submit.

## 7) Backend Express
- Routes minces : validation + appel service + réponse HTTP.
- Logique métier dans `server/services/*`.
- Accès DB uniquement via repositories `server/services/data/*`.
- Validation des entrées via `zod` avant traitement.

## 8) Gestion d’erreurs
- Utiliser `try/catch` dans routes/services asynchrones.
- Propager vers middleware `error-handler` avec erreurs normalisées.
- Réponses d’erreur API : format homogène `{ error: { code, message } }`.
- Frontend : afficher `ErrorBanner`/notification utilisateur claire.

## 9) Upload et fichiers PDF
- Accepter uniquement `application/pdf`.
- Limiter taille de fichier (ex. 10 Mo) côté middleware upload.
- Ne jamais faire confiance au nom fichier utilisateur (sanitization côté serveur).
- Stocker métadonnées + chemin + texte extrait en base.

## 10) Règles IA (CRITIQUE)
- Ne jamais hardcoder clés API/endpoints/secrets.
- Toujours utiliser les variables d’environnement `process.env.AZURE_OPENAI_*` via `server/ai-client.ts`.
- Ne pas créer de fichier `.env`.
- En cas d’erreur IA, **ne pas** renvoyer de faux fallback : propager l’erreur au middleware.
- Gérer explicitement timeouts, réponses vides, erreurs réseau.

## 11) Prisma / PostgreSQL
- Toute évolution DB passe par `prisma/schema.prisma` puis migration Prisma.
- Ne jamais hardcoder `DATABASE_URL`.
- Utiliser un client Prisma singleton (`server/lib/prisma.ts`).

## 12) Git / qualité
- Commits atomiques par fonctionnalité.
- Noms de branches explicites (`feature/chat-upload-pdf`, `feature/conversation-memory`).
- Vérifier build/lint/typecheck avant fusion.
