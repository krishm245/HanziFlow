# Flashdeck MVP Milestones

## Summary

Build a mobile-first, minimalist Chinese flashcard app with React, TypeScript, Vite, Convex, and Clerk. The MVP supports private user accounts, deck-based organization, pinyin-to-English cards, and a manual review loop where users reveal meanings and mark each card as known or needing practice.

## Milestones

1. **Project Foundation**
   - Configure Clerk and Convex providers in the React entrypoint.
   - Document required environment variables for local development.
   - Replace the starter Vite UI with a focused app shell.

2. **Authenticated Backend**
   - Add Convex schema for user-owned decks and cards.
   - Add indexes for owner-scoped deck queries and owner/deck-scoped card queries.
   - Implement Convex functions with validators and server-derived user identity.

3. **Deck Management**
   - Show the signed-in user's decks.
   - Support creating, renaming, and deleting decks.
   - Track card counts on deck documents.

4. **Card Management**
   - Show cards within a selected deck.
   - Support adding, editing, and deleting cards.
   - Require non-empty pinyin and English meaning fields.

5. **Manual Review Mode**
   - Start a review session from a selected deck.
   - Show pinyin first, then reveal English meaning.
   - Persist `known` and `needsPractice` review outcomes.

6. **MVP Polish**
   - Prioritize phone-sized screens with comfortable touch targets.
   - Add empty, loading, and signed-out states.
   - Run lint and production build checks.

## Out Of Scope For MVP

- Hanzi fields, audio, example sentences, tags, import/export, sharing, AI generation, analytics, and spaced repetition scheduling.

## Acceptance Criteria

- Signed-out users cannot access app data.
- Signed-in users can manage their own decks and cards.
- Review mode updates per-card review stats.
- The UI is usable on mobile and responsive on desktop.
- `pnpm lint` and `pnpm build` pass.
