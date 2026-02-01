# Basecamp Skill Complet pour OpenCode

## TL;DR

> **Quick Summary**: Compléter le skill Basecamp existant avec les 12 domaines Tier 1 de l'API, ajouter un MCP Server, et publier en open source sur npm/GitHub/ClawHub.
> 
> **Deliverables**:
> - CLI complet avec ~18 domaines (6 existants + 12 nouveaux)
> - MCP Server avec ~30-40 outils curés
> - Test suite automatisée (mocks)
> - User guide et documentation
> - Package publié `@drkraft/basecamp-cli`
> 
> **Estimated Effort**: Large (3-4 semaines à temps partiel)
> **Parallel Execution**: YES - 4 waves
> **Critical Path**: Phase 1 → Phase 2 → Phase 3 (domaines) → Phase 4 (MCP) → Phase 5 → Phase 6

---

## Context

### Original Request
Marc veut compléter le skill Basecamp existant pour qu'il implémente l'ensemble de l'API Basecamp 4, ajouter un MCP Server, puis publier en open source.

### Interview Summary
**Key Discussions**:
- Scope v1.0 : Tier 1 seulement (12 domaines clés = 80% valeur)
- MCP Server : Curated (~30-40 tools)
- Breaking changes : OK pour améliorer l'UX
- Tests : Automatisés (mocks) + validation manuelle finale
- Namespace : `@drkraft/basecamp-cli`

**Research Findings**:
- API Basecamp 4 : OAuth 2.0, REST JSON, pagination Link header
- Stack existante : TypeScript, Commander.js, Got, tsup
- ZERO tests actuellement
- Pas de pagination/retry logic implémentés

### Metis Review
**Identified Gaps** (addressed):
- Tests manquants → Phase 1 : Setup test infrastructure
- Pagination non gérée → Phase 1 : Implémenter fetchAllPages()
- Retry logic absent → Phase 1 : Ajouter exponential backoff
- User-Agent hardcodé → Phase 2 : Mettre à jour pour @drkraft
- Inconsistances CLI → Phase 2 : Standardiser interface

---

## Work Objectives

### Core Objective
Transformer le skill Basecamp partiel en un outil complet, testé et documenté, disponible en CLI et MCP Server, publié en open source.

### Concrete Deliverables
- `src/lib/api.ts` avec pagination et retry
- `src/__tests__/` avec tests pour tous les modules
- 12 nouveaux fichiers de commandes (Tier 1 domaines)
- `src/mcp/server.ts` avec ~30-40 outils
- `README.md` complet avec user guide
- Package publié sur npm, repo sur GitHub, skill sur ClawHub

### Definition of Done
- [ ] `bun test` → tous les tests passent
- [ ] `bun run build` → compile sans erreurs
- [ ] CLI : toutes les commandes Tier 1 fonctionnent
- [ ] MCP : server démarre et répond aux requêtes
- [ ] Validation manuelle sur compte Basecamp réel
- [ ] Publié sur npm, GitHub, ClawHub

### Must Have
- Couverture des 12 domaines Tier 1
- MCP Server fonctionnel avec outils curés
- Tests automatisés pour chaque module
- Documentation utilisateur complète
- OAuth flow fonctionnel

### Must NOT Have (Guardrails)
- Domaines Tier 2/3 (Chatbots, Questionnaires, Inbox, etc.) → v1.1+
- Tests d'intégration avec vrai Basecamp en CI
- Opérations bulk non présentes dans l'API officielle
- Stockage de secrets dans le code
- MCP avec 100+ outils (garder curé)

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: NO (à créer)
- **User wants tests**: YES (mocks + validation manuelle)
- **Framework**: vitest (moderne, rapide, bon support TypeScript)

### Automated Verification

**Per-module tests** (vitest + msw pour mocking HTTP):
```bash
bun test                              # Tous les tests
bun test src/__tests__/api.test.ts    # Tests API spécifiques
```

**Manual validation script**:
```bash
bun run validate                      # Script de validation contre vrai Basecamp
```

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Infrastructure - Start Immediately):
├── Task 1: Setup test infrastructure (vitest + msw)
├── Task 2: Implémenter pagination fetchAllPages()
└── Task 3: Ajouter retry logic avec exponential backoff

Wave 2 (Stabilisation CLI - After Wave 1):
├── Task 4: Mettre à jour package.json et identité
├── Task 5: Standardiser interface CLI (breaking changes)
└── Task 6: Ajouter tests pour modules existants

Wave 3 (Nouveaux Domaines Tier 1 - After Wave 2):
├── Task 7: Comments (CRUD)
├── Task 8: Documents & Uploads & Vaults
├── Task 9: Schedules & Schedule Entries
├── Task 10: Card Tables (tables, columns, cards, steps)
├── Task 11: Webhooks
├── Task 12: Recordings & Events
├── Task 13: Search
├── Task 14: Subscriptions
└── Task 15: Todolist Groups

Wave 4 (MCP & Publication - After Wave 3):
├── Task 16: MCP Server setup
├── Task 17: Implémenter outils MCP curés
├── Task 18: Validation manuelle complète
├── Task 19: Documentation & User Guide
└── Task 20: Publication (npm, GitHub, ClawHub)
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 6, 7-15 | 2, 3 |
| 2 | None | 7-15 | 1, 3 |
| 3 | None | 7-15 | 1, 2 |
| 4 | None | 20 | 5, 6 |
| 5 | None | 16 | 4, 6 |
| 6 | 1 | 7-15 | 4, 5 |
| 7-15 | 1, 2, 3, 6 | 16, 17 | Each other (parallel) |
| 16 | 5, 7-15 | 17 | None |
| 17 | 16 | 18 | None |
| 18 | 17 | 19, 20 | None |
| 19 | 18 | 20 | None |
| 20 | 19 | None | None |

---

## TODOs

---

### Phase 1: Infrastructure

- [x] 1. Setup test infrastructure (vitest + msw)

  **What to do**:
  - Installer vitest et msw comme devDependencies
  - Créer `vitest.config.ts` avec configuration TypeScript
  - Créer `src/__tests__/setup.ts` pour setup msw
  - Créer `src/__tests__/mocks/handlers.ts` pour mock Basecamp API
  - Ajouter scripts `test` et `test:watch` dans package.json
  - Créer un test exemple pour valider le setup

  **Must NOT do**:
  - Tests d'intégration avec vrai Basecamp
  - Stocker des tokens dans les tests
  - Jest (utiliser vitest)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Setup standard, patterns bien connus
  - **Skills**: [`git-master`]
    - `git-master`: Commit atomique après setup

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3)
  - **Blocks**: Tasks 6, 7-15
  - **Blocked By**: None

  **References**:
  - `package.json` - Voir devDependencies existantes (tsup, typescript)
  - `tsconfig.json` - Configuration TypeScript à respecter
  - https://vitest.dev/guide/ - Guide officiel vitest
  - https://mswjs.io/docs/getting-started - Setup msw pour mocking

  **Acceptance Criteria**:
  - [ ] `bun add -d vitest @vitest/coverage-v8 msw` → exit 0
  - [ ] `vitest.config.ts` existe et configure TypeScript
  - [ ] `src/__tests__/setup.ts` existe et configure msw
  - [ ] `bun test` → au moins 1 test passe
  - [ ] `package.json` contient script `"test": "vitest run"`

  **Commit**: YES
  - Message: `feat(tests): add vitest and msw test infrastructure`
  - Files: `package.json, vitest.config.ts, src/__tests__/*`
  - Pre-commit: `bun test`

---

- [x] 2. Implémenter pagination fetchAllPages()

  **What to do**:
  - Créer fonction `fetchAllPages<T>()` dans `src/lib/api.ts`
  - Parser le header `Link` pour trouver `rel="next"`
  - Itérer jusqu'à épuisement des pages
  - Retourner tableau agrégé de tous les résultats
  - Mettre à jour les fonctions existantes qui listent (listProjects, listTodos, etc.)

  **Must NOT do**:
  - Casser les signatures existantes
  - Ignorer les erreurs de pagination

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Pattern de pagination standard, bien documenté dans API Basecamp
  - **Skills**: []
    - Pas de skill spécifique nécessaire

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: Tasks 7-15
  - **Blocked By**: None

  **References**:
  - `src/lib/api.ts:18-52` - createClient() et pattern HTTP existant
  - `src/types/index.ts:220-224` - PaginatedResponse<T> déjà défini (mais non utilisé)
  - https://github.com/basecamp/bc3-api#pagination - RFC5988 Link header spec
  - Pattern: `Link: <url>; rel="next"` → extraire URL, fetch, concat

  **Acceptance Criteria**:
  - [ ] Fonction `fetchAllPages<T>()` existe dans `src/lib/api.ts`
  - [ ] Parse correctement le header Link avec regex ou lib
  - [ ] `bun test src/__tests__/pagination.test.ts` → test mock passe (simule 3 pages)
  - [ ] `listProjects()` utilise fetchAllPages si nécessaire

  **Commit**: YES
  - Message: `feat(api): implement pagination with fetchAllPages helper`
  - Files: `src/lib/api.ts, src/__tests__/pagination.test.ts`
  - Pre-commit: `bun test`

---

- [x] 3. Ajouter retry logic avec exponential backoff

  **What to do**:
  - Créer helper `withRetry()` dans `src/lib/api.ts`
  - Intercepter erreurs 429 et 5xx
  - Implémenter exponential backoff (1s, 2s, 4s, max 3 retries)
  - Respecter header `Retry-After` si présent
  - Intégrer dans createClient() hooks

  **Must NOT do**:
  - Retry sur erreurs 4xx (sauf 429)
  - Retry infini
  - Ignorer Retry-After header

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Pattern standard, bien documenté
  - **Skills**: []
    - Pas de skill spécifique nécessaire

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocks**: Tasks 7-15
  - **Blocked By**: None

  **References**:
  - `src/lib/api.ts:34-49` - Hook beforeError existant (log mais pas retry)
  - https://github.com/basecamp/bc3-api#rate-limiting-429-too-many-requests - Spec rate limit
  - https://github.com/sindresorhus/got#retry - Got retry options (ou custom)

  **Acceptance Criteria**:
  - [ ] Helper `withRetry()` ou config retry dans createClient()
  - [ ] Retry automatique sur 429 avec délai Retry-After
  - [ ] Retry sur 5xx avec exponential backoff
  - [ ] Max 3 retries puis throw
  - [ ] `bun test src/__tests__/retry.test.ts` → tests mock passent

  **Commit**: YES
  - Message: `feat(api): add retry logic with exponential backoff`
  - Files: `src/lib/api.ts, src/__tests__/retry.test.ts`
  - Pre-commit: `bun test`

---

### Phase 2: Stabilisation CLI

- [x] 4. Mettre à jour package.json et identité

  **What to do**:
  - Changer `name` en `@drkraft/basecamp-cli`
  - Mettre à jour `author`, `repository`, `homepage`
  - Changer User-Agent dans `src/lib/api.ts` pour `@drkraft/basecamp-cli (contact@drkraft.com)`
  - Mettre à jour version à `2.0.0` (breaking changes)
  - Ajouter `CHANGELOG.md` avec section v2.0.0

  **Must NOT do**:
  - Supprimer dépendances nécessaires
  - Changer la license MIT

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Modifications simples de config
  - **Skills**: [`git-master`]
    - `git-master`: Commit propre

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6)
  - **Blocks**: Task 20
  - **Blocked By**: None

  **References**:
  - `package.json` - Fichier à modifier
  - `src/lib/api.ts:16` - USER_AGENT constant à modifier
  - npm scope docs pour publication @scope

  **Acceptance Criteria**:
  - [ ] `package.json` name = `@drkraft/basecamp-cli`
  - [ ] `package.json` version = `2.0.0`
  - [ ] `src/lib/api.ts` USER_AGENT contient `@drkraft`
  - [ ] `CHANGELOG.md` existe avec section v2.0.0
  - [ ] `bun run build` → compile sans erreurs

  **Commit**: YES
  - Message: `chore: rebrand to @drkraft/basecamp-cli v2.0.0`
  - Files: `package.json, src/lib/api.ts, CHANGELOG.md`
  - Pre-commit: `bun run build`

---

- [x] 5. Standardiser interface CLI (breaking changes)

  **What to do**:
  - Renommer `basecamp me` → `basecamp people me` (cohérence)
  - Standardiser `--format table|json` pour toutes les commandes list/get
  - Ajouter `--verbose` flag global pour debug
  - Uniformiser pattern de commandes : `<resource> <action> [id] [options]`
  - Mettre à jour README.md avec nouvelle interface

  **Must NOT do**:
  - Changer la logique métier
  - Supprimer des fonctionnalités

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Refactoring d'interface, pas complexe
  - **Skills**: []
    - Pas de skill spécifique nécessaire

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 6)
  - **Blocks**: Task 16
  - **Blocked By**: None

  **References**:
  - `src/index.ts` - Point d'entrée commandes
  - `src/commands/people.ts:createMeCommand()` - À intégrer dans people
  - `src/commands/*.ts` - Tous les fichiers de commandes à standardiser
  - Commander.js docs pour options globales

  **Acceptance Criteria**:
  - [ ] `basecamp people me` fonctionne (et `basecamp me` supprimé ou alias)
  - [ ] `basecamp projects list --format json` → JSON
  - [ ] `basecamp projects list --format table` → Table formatée
  - [ ] `basecamp --verbose projects list` → Affiche debug info
  - [ ] README.md mis à jour avec exemples

  **Commit**: YES
  - Message: `refactor(cli): standardize command interface`
  - Files: `src/index.ts, src/commands/*.ts, README.md`
  - Pre-commit: `bun run build`

---

- [x] 6. Ajouter tests pour modules existants

  **What to do**:
  - Créer tests pour `src/lib/api.ts` (projects, todos, messages, campfires, people)
  - Créer tests pour `src/lib/auth.ts` (OAuth flow mock)
  - Créer tests pour `src/lib/config.ts`
  - Viser couverture des happy paths + erreurs principales
  - Utiliser msw pour mocker les appels API

  **Must NOT do**:
  - Tester contre vrai Basecamp
  - Viser 100% coverage (80% suffisant)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Tests standards, patterns clairs
  - **Skills**: []
    - Pas de skill spécifique nécessaire

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5)
  - **Blocks**: Tasks 7-15
  - **Blocked By**: Task 1

  **References**:
  - `src/lib/api.ts` - Fonctions à tester
  - `src/lib/auth.ts` - OAuth flow à tester
  - `src/__tests__/setup.ts` - Setup msw (créé en Task 1)
  - vitest docs pour assertions et mocking

  **Acceptance Criteria**:
  - [ ] `src/__tests__/api.test.ts` existe avec tests pour chaque fonction export
  - [ ] `src/__tests__/auth.test.ts` existe avec tests OAuth
  - [ ] `bun test` → tous les tests passent
  - [ ] Coverage > 70% sur src/lib/

  **Commit**: YES
  - Message: `test: add tests for existing api, auth, and config modules`
  - Files: `src/__tests__/*.test.ts`
  - Pre-commit: `bun test`

---

### Phase 3: Nouveaux Domaines Tier 1

- [x] 7. Implémenter Comments (CRUD)

  **What to do**:
  - Créer `src/commands/comments.ts` avec list, get, create, update, delete
  - Ajouter types dans `src/types/index.ts` (BasecampComment)
  - Ajouter fonctions API dans `src/lib/api.ts`
  - Les commentaires sont attachés à un "recording" (todo, message, etc.)
  - Créer tests

  **Must NOT do**:
  - Rich text complexe (HTML basique OK)
  - Mentions parsing avancé

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Pattern CRUD identique aux todos existants
  - **Skills**: []
    - Pattern bien établi dans le code existant

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 8-15)
  - **Blocks**: Tasks 16, 17
  - **Blocked By**: Tasks 1, 2, 3, 6

  **References**:
  - `src/commands/todos.ts` - Pattern CRUD à suivre
  - `src/types/index.ts:81-111` - Pattern types (BasecampTodo)
  - https://github.com/basecamp/bc3-api/blob/master/sections/comments.md - API spec
  - Endpoint: `GET/POST /buckets/{id}/recordings/{id}/comments.json`

  **Acceptance Criteria**:
  - [ ] `basecamp comments list --project <id> --recording <id>` → liste comments
  - [ ] `basecamp comments create --project <id> --recording <id> --content "..."` → crée
  - [ ] `basecamp comments update <id> --project <id> --content "..."` → update
  - [ ] `bun test src/__tests__/comments.test.ts` → tests passent

  **Commit**: YES
  - Message: `feat(comments): add comments CRUD commands`
  - Files: `src/commands/comments.ts, src/lib/api.ts, src/types/index.ts, src/__tests__/comments.test.ts`
  - Pre-commit: `bun test`

---

- [x] 8. Implémenter Documents, Uploads & Vaults

  **What to do**:
  - Créer `src/commands/vaults.ts` (list, get, create folder)
  - Créer `src/commands/documents.ts` (list, get, create, update)
  - Créer `src/commands/uploads.ts` (list, get, create)
  - Ajouter types BasecampVault, BasecampDocument, BasecampUpload
  - Vaults = dossiers, Documents = texte, Uploads = fichiers
  - Créer tests

  **Must NOT do**:
  - Upload binaire réel (juste référence via attachable_sgid)
  - Preview/thumbnail generation

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: 3 domaines liés, un peu plus de travail
  - **Skills**: []
    - Patterns établis

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7, 9-15)
  - **Blocks**: Tasks 16, 17
  - **Blocked By**: Tasks 1, 2, 3, 6

  **References**:
  - https://github.com/basecamp/bc3-api/blob/master/sections/vaults.md - Vaults API
  - https://github.com/basecamp/bc3-api/blob/master/sections/documents.md - Documents API
  - https://github.com/basecamp/bc3-api/blob/master/sections/uploads.md - Uploads API
  - `src/lib/api.ts:221-232` - Pattern listCampfires (dock-based)

  **Acceptance Criteria**:
  - [ ] `basecamp vaults list --project <id>` → liste dossiers
  - [ ] `basecamp documents list --project <id> --vault <id>` → liste docs
  - [ ] `basecamp documents create --project <id> --vault <id> --title "..." --content "..."` → crée
  - [ ] `bun test src/__tests__/vaults.test.ts` → tests passent

  **Commit**: YES
  - Message: `feat(files): add vaults, documents, and uploads commands`
  - Files: `src/commands/vaults.ts, src/commands/documents.ts, src/commands/uploads.ts, src/types/index.ts, src/__tests__/*.test.ts`
  - Pre-commit: `bun test`

---

- [x] 9. Implémenter Schedules & Schedule Entries

  **What to do**:
  - Créer `src/commands/schedules.ts` (get schedule, list/create/update entries)
  - Ajouter types BasecampSchedule, BasecampScheduleEntry
  - Supporter dates, all-day events, recurring (si API le supporte)
  - Créer tests

  **Must NOT do**:
  - Sync avec calendriers externes
  - Notifications/reminders custom

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Pattern standard CRUD
  - **Skills**: []
    - Patterns établis

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7-8, 10-15)
  - **Blocks**: Tasks 16, 17
  - **Blocked By**: Tasks 1, 2, 3, 6

  **References**:
  - https://github.com/basecamp/bc3-api/blob/master/sections/schedules.md - Schedules API
  - https://github.com/basecamp/bc3-api/blob/master/sections/schedule_entries.md - Entries API
  - Schedule via dock `name: "schedule"`

  **Acceptance Criteria**:
  - [ ] `basecamp schedules get --project <id>` → info schedule
  - [ ] `basecamp schedules entries --project <id>` → liste events
  - [ ] `basecamp schedules create-entry --project <id> --summary "..." --starts-at "..." --ends-at "..."` → crée
  - [ ] `bun test src/__tests__/schedules.test.ts` → tests passent

  **Commit**: YES
  - Message: `feat(schedules): add schedules and schedule entries commands`
  - Files: `src/commands/schedules.ts, src/types/index.ts, src/__tests__/schedules.test.ts`
  - Pre-commit: `bun test`

---

- [x] 10. Implémenter Card Tables (Kanban)

  **What to do**:
  - Créer `src/commands/cardtables.ts`
  - Implémenter: get table, list/create/update columns, list/create/update/move cards
  - Ajouter types BasecampCardTable, BasecampColumn, BasecampCard
  - Card tables = Kanban boards dans Basecamp
  - Créer tests

  **Must NOT do**:
  - Card steps (trop avancé pour v1)
  - Automation rules

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Plusieurs sous-entités (tables, columns, cards)
  - **Skills**: []
    - Patterns établis

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7-9, 11-15)
  - **Blocks**: Tasks 16, 17
  - **Blocked By**: Tasks 1, 2, 3, 6

  **References**:
  - https://github.com/basecamp/bc3-api/blob/master/sections/card_tables.md - Tables API
  - https://github.com/basecamp/bc3-api/blob/master/sections/card_table_columns.md - Columns API
  - https://github.com/basecamp/bc3-api/blob/master/sections/card_table_cards.md - Cards API
  - Card table via dock `name: "kanban_board"`

  **Acceptance Criteria**:
  - [ ] `basecamp cardtables get --project <id>` → info table
  - [ ] `basecamp cardtables columns --project <id>` → liste colonnes
  - [ ] `basecamp cardtables cards --project <id> --column <id>` → liste cards
  - [ ] `basecamp cardtables create-card --project <id> --column <id> --title "..."` → crée
  - [ ] `bun test src/__tests__/cardtables.test.ts` → tests passent

  **Commit**: YES
  - Message: `feat(cardtables): add card tables (kanban) commands`
  - Files: `src/commands/cardtables.ts, src/types/index.ts, src/__tests__/cardtables.test.ts`
  - Pre-commit: `bun test`

---

- [x] 11. Implémenter Webhooks

  **What to do**:
  - Créer `src/commands/webhooks.ts` avec list, get, create, update, delete
  - Ajouter types BasecampWebhook
  - Webhooks = notifications HTTP sur events Basecamp
  - Créer tests

  **Must NOT do**:
  - Serveur webhook local (juste gestion via API)
  - Validation de payload

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: CRUD standard
  - **Skills**: []
    - Patterns établis

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7-10, 12-15)
  - **Blocks**: Tasks 16, 17
  - **Blocked By**: Tasks 1, 2, 3, 6

  **References**:
  - https://github.com/basecamp/bc3-api/blob/master/sections/webhooks.md - Webhooks API
  - Endpoint: `/buckets/{project_id}/webhooks.json`

  **Acceptance Criteria**:
  - [ ] `basecamp webhooks list --project <id>` → liste webhooks
  - [ ] `basecamp webhooks create --project <id> --payload-url "https://..."` → crée
  - [ ] `basecamp webhooks delete <id> --project <id>` → supprime
  - [ ] `bun test src/__tests__/webhooks.test.ts` → tests passent

  **Commit**: YES
  - Message: `feat(webhooks): add webhooks management commands`
  - Files: `src/commands/webhooks.ts, src/types/index.ts, src/__tests__/webhooks.test.ts`
  - Pre-commit: `bun test`

---

- [x] 12. Implémenter Recordings & Events

  **What to do**:
  - Créer `src/commands/recordings.ts` (list by type, archive, unarchive, trash)
  - Créer `src/commands/events.ts` (list events/activity feed)
  - Recordings = contenus dans un bucket (cross-project query)
  - Events = fil d'activité
  - Créer tests

  **Must NOT do**:
  - Création de recordings (ils sont créés via leurs types spécifiques)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Patterns standards
  - **Skills**: []
    - Patterns établis

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7-11, 13-15)
  - **Blocks**: Tasks 16, 17
  - **Blocked By**: Tasks 1, 2, 3, 6

  **References**:
  - https://github.com/basecamp/bc3-api/blob/master/sections/recordings.md - Recordings API
  - https://github.com/basecamp/bc3-api/blob/master/sections/events.md - Events API
  - Recordings: `GET /projects/recordings.json?type=Todo`

  **Acceptance Criteria**:
  - [ ] `basecamp recordings list --type Todo` → liste tous les todos cross-project
  - [ ] `basecamp recordings archive <id> --project <id>` → archive
  - [ ] `basecamp events list --project <id>` → fil d'activité
  - [ ] `bun test src/__tests__/recordings.test.ts` → tests passent

  **Commit**: YES
  - Message: `feat(recordings): add recordings and events commands`
  - Files: `src/commands/recordings.ts, src/commands/events.ts, src/types/index.ts, src/__tests__/*.test.ts`
  - Pre-commit: `bun test`

---

- [x] 13. Implémenter Search

  **What to do**:
  - Créer `src/commands/search.ts` avec recherche globale
  - Ajouter type BasecampSearchResult
  - Supporter filtres par type si API le permet
  - Créer tests

  **Must NOT do**:
  - Search local/cache
  - Indexation custom

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Un seul endpoint
  - **Skills**: []
    - Pattern simple

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7-12, 14-15)
  - **Blocks**: Tasks 16, 17
  - **Blocked By**: Tasks 1, 2, 3, 6

  **References**:
  - https://github.com/basecamp/bc3-api/blob/master/sections/search.md - Search API
  - Endpoint: `GET /search.json?query=...`

  **Acceptance Criteria**:
  - [ ] `basecamp search "keyword"` → résultats de recherche
  - [ ] `basecamp search "keyword" --json` → JSON format
  - [ ] `bun test src/__tests__/search.test.ts` → tests passent

  **Commit**: YES
  - Message: `feat(search): add global search command`
  - Files: `src/commands/search.ts, src/types/index.ts, src/__tests__/search.test.ts`
  - Pre-commit: `bun test`

---

- [x] 14. Implémenter Subscriptions

  **What to do**:
  - Créer `src/commands/subscriptions.ts` (list, subscribe, unsubscribe)
  - Ajouter type BasecampSubscription
  - Subscriptions = qui reçoit les notifications sur un recording
  - Créer tests

  **Must NOT do**:
  - Notification delivery
  - Email settings

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Pattern simple
  - **Skills**: []
    - Pattern établi

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7-13, 15)
  - **Blocks**: Tasks 16, 17
  - **Blocked By**: Tasks 1, 2, 3, 6

  **References**:
  - https://github.com/basecamp/bc3-api/blob/master/sections/subscriptions.md - Subscriptions API
  - Endpoint: `GET /buckets/{id}/recordings/{id}/subscriptions.json`

  **Acceptance Criteria**:
  - [ ] `basecamp subscriptions list --project <id> --recording <id>` → liste abonnés
  - [ ] `basecamp subscriptions subscribe --project <id> --recording <id>` → s'abonner
  - [ ] `basecamp subscriptions unsubscribe --project <id> --recording <id>` → se désabonner
  - [ ] `bun test src/__tests__/subscriptions.test.ts` → tests passent

  **Commit**: YES
  - Message: `feat(subscriptions): add subscription management commands`
  - Files: `src/commands/subscriptions.ts, src/types/index.ts, src/__tests__/subscriptions.test.ts`
  - Pre-commit: `bun test`

---

- [x] 15. Implémenter Todolist Groups

  **What to do**:
  - Ajouter à `src/commands/todos.ts` : list groups, create group
  - Ajouter type BasecampTodolistGroup
  - Groups = regroupement de todolists dans un projet
  - Créer tests

  **Must NOT do**:
  - Nesting complexe
  - Drag & drop simulation

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Extension de module existant
  - **Skills**: []
    - Pattern établi

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7-14)
  - **Blocks**: Tasks 16, 17
  - **Blocked By**: Tasks 1, 2, 3, 6

  **References**:
  - https://github.com/basecamp/bc3-api/blob/master/sections/todolist_groups.md - Groups API
  - `src/commands/todos.ts` - Module à étendre
  - Endpoint: `GET /buckets/{id}/todosets/{id}/groups.json`

  **Acceptance Criteria**:
  - [ ] `basecamp todogroups list --project <id>` → liste groupes
  - [ ] `basecamp todogroups create --project <id> --name "..."` → crée groupe
  - [ ] `bun test src/__tests__/todogroups.test.ts` → tests passent

  **Commit**: YES
  - Message: `feat(todos): add todolist groups commands`
  - Files: `src/commands/todos.ts, src/types/index.ts, src/__tests__/todogroups.test.ts`
  - Pre-commit: `bun test`

---

### Phase 4: MCP Server

- [x] 16. Setup MCP Server infrastructure

  **What to do**:
  - Installer `@modelcontextprotocol/sdk`
  - Créer `src/mcp/server.ts` avec setup MCP de base
  - Créer `src/mcp/tools/index.ts` pour registry des outils
  - Ajouter script `mcp` dans package.json
  - Ajouter entry point `src/mcp.ts`

  **Must NOT do**:
  - Implémenter tous les outils (juste structure)
  - Resources MCP (juste Tools pour v1)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Nouvelle architecture, mais SDK bien documenté
  - **Skills**: []
    - SDK MCP a bonne doc

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Task 17
  - **Blocked By**: Tasks 5, 7-15

  **References**:
  - https://modelcontextprotocol.io/docs/concepts/tools - MCP Tools spec
  - https://github.com/modelcontextprotocol/typescript-sdk - SDK TypeScript
  - `src/lib/api.ts` - Fonctions API à réutiliser

  **Acceptance Criteria**:
  - [ ] `@modelcontextprotocol/sdk` installé
  - [ ] `src/mcp/server.ts` existe et démarre sans erreur
  - [ ] `bun run mcp` → démarre le server MCP
  - [ ] Répond à `tools/list` avec au moins 1 tool

  **Commit**: YES
  - Message: `feat(mcp): add MCP server infrastructure`
  - Files: `src/mcp/*, package.json`
  - Pre-commit: `bun run build`

---

- [x] 17. Implémenter outils MCP curés (~30-40 tools)

  **What to do**:
  - Créer outils MCP pour les opérations les plus utiles
  - Catégories : Projects, Todos, Messages, People, Comments, Documents, Schedules, Card Tables
  - Chaque outil = wrapper autour des fonctions `src/lib/api.ts`
  - Documenter chaque outil avec description claire
  - Créer tests

  **Must NOT do**:
  - 1:1 mapping CLI → MCP (curé seulement)
  - Outils pour domaines Tier 2/3
  - Outils destructifs sans confirmation flag

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Beaucoup d'outils à créer, nécessite réflexion sur l'UX
  - **Skills**: []
    - Pattern MCP établi dans Task 16

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Task 18
  - **Blocked By**: Task 16

  **References**:
  - `src/mcp/server.ts` - Infrastructure créée en Task 16
  - `src/lib/api.ts` - Toutes les fonctions API
  - MCP spec pour tool schemas (JSON Schema)

  **Tools à créer (priorité):**
  ```
  Projects: list_projects, get_project, create_project
  Todos: list_todolists, list_todos, create_todo, complete_todo, update_todo
  Messages: list_messages, get_message, create_message
  People: list_people, get_person, get_me
  Comments: list_comments, create_comment
  Documents: list_documents, create_document
  Vaults: list_vaults
  Schedules: list_schedule_entries, create_schedule_entry
  Card Tables: list_cards, create_card, move_card
  Webhooks: list_webhooks, create_webhook
  Search: search
  ```

  **Acceptance Criteria**:
  - [ ] 30-40 outils MCP implémentés
  - [ ] Chaque outil a description et inputSchema JSON
  - [ ] `bun run mcp` → `tools/list` retourne 30+ outils
  - [ ] `bun test src/__tests__/mcp.test.ts` → tests passent

  **Commit**: YES
  - Message: `feat(mcp): implement curated MCP tools`
  - Files: `src/mcp/tools/*.ts, src/__tests__/mcp.test.ts`
  - Pre-commit: `bun test`

---

### Phase 5: Validation & Documentation

- [~] 18. Validation manuelle complète (BLOCKED - requires BASECAMP_CLIENT_SECRET, run: bun scripts/validate.ts)

  **What to do**:
  - Créer `scripts/validate.ts` script de validation
  - Tester chaque commande CLI contre vrai Basecamp
  - Tester MCP server avec client MCP
  - Documenter les bugs trouvés et les corriger
  - Créer project de test dans Basecamp si nécessaire

  **Must NOT do**:
  - Automatiser avec tokens en clair
  - Skipper des commandes

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Validation systématique
  - **Skills**: []
    - Pas de skill spécifique

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Tasks 19, 20
  - **Blocked By**: Task 17

  **References**:
  - README.md - Commandes à tester
  - Compte Basecamp de Marc

  **Acceptance Criteria**:
  - [ ] `scripts/validate.ts` existe
  - [ ] Toutes les commandes CLI testées (checklist dans script)
  - [ ] MCP server testé avec au moins 5 outils
  - [ ] Aucun bug bloquant restant

  **Commit**: YES
  - Message: `test: add manual validation script and fix issues`
  - Files: `scripts/validate.ts, src/**/* (fixes)`
  - Pre-commit: `bun test`

---

- [x] 19. Documentation & User Guide

  **What to do**:
  - Réécrire README.md complet avec:
    - Installation
    - Configuration OAuth
    - Toutes les commandes avec exemples
    - Usage MCP avec OpenCode
  - Créer CONTRIBUTING.md pour contributions open source
  - S'assurer que CHANGELOG.md est à jour
  - Ajouter LICENSE si manquant

  **Must NOT do**:
  - Documentation des features Tier 2/3
  - Tutoriels vidéo (texte seulement)

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: Documentation technique
  - **Skills**: []
    - Pas de skill spécifique

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Task 20
  - **Blocked By**: Task 18

  **References**:
  - README.md actuel - Base à améliorer
  - SKILL.md - Format skill ClawHub
  - Exemples de bons README npm

  **Acceptance Criteria**:
  - [ ] README.md > 500 lignes avec doc complète
  - [ ] Toutes les commandes documentées avec exemples
  - [ ] Section MCP usage avec exemples
  - [ ] CONTRIBUTING.md existe
  - [ ] CHANGELOG.md à jour pour v2.0.0

  **Commit**: YES
  - Message: `docs: complete documentation and user guide`
  - Files: `README.md, CONTRIBUTING.md, CHANGELOG.md, SKILL.md`
  - Pre-commit: None

---

- [~] 20. Publication (READY - run: ./scripts/release.sh)

  **What to do**:
  - Vérifier package.json prêt pour publication
  - `npm publish --access public` sur npm
  - Push sur GitHub (repo @drkraft/basecamp-cli)
  - Publier sur ClawHub
  - Créer release GitHub avec notes

  **Must NOT do**:
  - Publier si tests échouent
  - Publier sans validation manuelle
  - Publier avec secrets/tokens

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Commandes de publication standard
  - **Skills**: [`git-master`]
    - `git-master`: Tags et releases

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Final
  - **Blocks**: None
  - **Blocked By**: Task 19

  **References**:
  - `package.json` - Config publication
  - npm publish docs
  - ClawHub submission process

  **Acceptance Criteria**:
  - [ ] `npm publish --dry-run` → success
  - [ ] Package visible sur npmjs.com/@drkraft/basecamp-cli
  - [ ] Repo GitHub public avec README visible
  - [ ] Skill visible sur ClawHub
  - [ ] GitHub release v2.0.0 créée

  **Commit**: YES
  - Message: `chore: prepare v2.0.0 release`
  - Files: `package.json` (version bump if needed)
  - Pre-commit: `bun test && bun run build`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `feat(tests): add vitest and msw test infrastructure` | package.json, vitest.config.ts, src/__tests__/* | `bun test` |
| 2 | `feat(api): implement pagination with fetchAllPages helper` | src/lib/api.ts, tests | `bun test` |
| 3 | `feat(api): add retry logic with exponential backoff` | src/lib/api.ts, tests | `bun test` |
| 4 | `chore: rebrand to @drkraft/basecamp-cli v2.0.0` | package.json, src/lib/api.ts, CHANGELOG.md | `bun run build` |
| 5 | `refactor(cli): standardize command interface` | src/commands/*, README.md | `bun run build` |
| 6 | `test: add tests for existing modules` | src/__tests__/*.test.ts | `bun test` |
| 7-15 | `feat(<domain>): add <domain> commands` | src/commands/*, src/types/*, tests | `bun test` |
| 16 | `feat(mcp): add MCP server infrastructure` | src/mcp/*, package.json | `bun run build` |
| 17 | `feat(mcp): implement curated MCP tools` | src/mcp/tools/*.ts, tests | `bun test` |
| 18 | `test: add manual validation script and fix issues` | scripts/validate.ts, fixes | `bun test` |
| 19 | `docs: complete documentation and user guide` | README.md, CONTRIBUTING.md, etc. | None |
| 20 | `chore: prepare v2.0.0 release` | package.json | `bun test && bun run build` |

---

## Success Criteria

### Verification Commands
```bash
# Tests
bun test                                # All tests pass

# Build
bun run build                           # Compiles without errors

# CLI smoke test
./dist/index.js projects list --json    # Returns JSON array
./dist/index.js todos list --project 123 --list 456 --json  # Returns JSON

# MCP smoke test
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | bun run mcp
# Returns list of 30+ tools

# Package check
npm pack --dry-run                      # Shows package contents
```

### Final Checklist
- [ ] Tous les tests passent (`bun test`)
- [ ] Build réussit (`bun run build`)
- [ ] 18 domaines CLI fonctionnels (6 existants + 12 nouveaux)
- [ ] MCP Server avec 30-40 outils
- [ ] Documentation complète
- [ ] Publié sur npm, GitHub, ClawHub
- [ ] Validation manuelle passée
