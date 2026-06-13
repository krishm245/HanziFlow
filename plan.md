# HanziFlow Feature Build Plan

## Product Goal

HanziFlow is a mobile-first Chinese flashcard app for building, organizing, and reviewing pinyin-to-English study cards. The MVP should feel like a usable daily study tool, not just a data-entry demo: signed-in users can create decks, add cards quickly, review them, and track which cards need more practice.

## Current MVP Scope

The MVP includes:

- Private user accounts through Clerk and Convex auth.
- User-owned decks with names, card counts, and basic lifecycle actions.
- User-owned cards with pinyin, English meaning, review stats, and timestamps.
- A focused deck workspace for creating, editing, deleting, and reviewing cards.
- A custom pinyin keyboard for entering tonal pinyin into cards.
- Manual review mode where users reveal answers and mark outcomes.
- Mobile-first responsive UI built with Tailwind CSS and shadcn/ui.
- Focused Vitest coverage for new feature logic and critical flows.

The MVP excludes:

- Hanzi writing practice, handwriting recognition, AI card generation, sharing, public decks, audio generation, import/export, analytics dashboards, and true spaced repetition scheduling.

## Feature Milestones

### 1. App Foundation And Shell

Build the stable product frame users land in after authentication.

- Rename remaining user-facing "Flashdeck" or template copy to "HanziFlow".
- Replace starter Vite documentation and UI remnants with HanziFlow-specific app copy.
- Keep Clerk and Convex providers wired in the React entrypoint.
- Add a mobile-first app shell with a clear header, signed-in user affordance, and responsive content area.
- Add signed-out, auth-loading, and auth-refreshing states that use HanziFlow branding.
- Document required local environment variables for Clerk and Convex.

Acceptance criteria:

- Signed-out users see a clear HanziFlow entry screen.
- Signed-in users land directly in the deck workspace.
- The app name is consistently HanziFlow in visible UI and project docs.
- `pnpm lint`, `pnpm build`, and relevant tests pass.

### 2. Authenticated Convex Data Model

Finish the private backend contract that all deck and card features depend on.

- Confirm the Convex schema supports owner-scoped `decks` and `cards`.
- Keep indexes for owner deck queries and owner/deck card queries.
- Use server-derived identity for every Convex query and mutation.
- Validate all mutation inputs with Convex validators.
- Prevent cross-user access to decks and cards in every function.
- Keep card counts accurate when cards are created or deleted.
- Add tests for unauthorized access, ownership isolation, and card count updates.

Acceptance criteria:

- A user can only read and mutate their own decks and cards.
- Invalid deck and card input is rejected by Convex functions.
- Deck `cardCount` stays correct after card creation and deletion.
- Backend tests cover the core auth and ownership rules.

### 3. Deck Management

Make deck organization complete enough for daily use.

- Show the signed-in user's decks sorted by most recently updated.
- Show deck name, card count, and last updated state for each deck.
- Create decks from an inline form or dialog.
- Rename decks without leaving the deck workspace.
- Delete decks with confirmation and cascade-delete or otherwise clean up their cards.
- Select a deck and keep the selected deck obvious on mobile and desktop.
- Add empty states for users with no decks.
- Add loading and error states for deck queries and mutations.

Acceptance criteria:

- Users can create, rename, select, and delete decks.
- Deleting a deck cannot leave orphaned visible cards.
- Empty, loading, and error states are visible and usable.
- Deck management has focused tests for validation and mutation behavior.

### 4. Card Management

Build the complete card authoring workflow inside a selected deck.

- Show all cards in the selected deck.
- Display pinyin, English meaning, review status, and lightweight review stats.
- Add cards with required pinyin and English fields.
- Edit card pinyin and English meaning.
- Delete cards with confirmation.
- Trim whitespace and block empty values.
- Prevent duplicate pinyin entries within the same deck when practical.
- Keep forms comfortable on phone screens with large touch targets.
- Add empty states for decks with no cards.
- Add loading and error states for card queries and mutations.

Acceptance criteria:

- Users can add, edit, and delete cards inside a deck.
- Cards cannot be saved with blank pinyin or English meaning.
- Duplicate prevention behavior is defined and tested.
- Card list UI remains usable on mobile and desktop.

### 5. Custom Pinyin Keyboard

Build an in-app keyboard that helps users enter tonal pinyin quickly when creating or editing cards.

- Add a reusable `pinyin-keyboard` component for card forms.
- Support inserting vowels with tone marks: `ā á ǎ à`, `ē é ě è`, `ī í ǐ ì`, `ō ó ǒ ò`, `ū ú ǔ ù`, and `ǖ ǘ ǚ ǜ`.
- Support neutral tone entry by allowing plain vowels and syllables.
- Provide quick keys for common initials and finals where useful.
- Insert characters at the current cursor position instead of only appending.
- Preserve focus in the pinyin input while using the keyboard.
- Support backspace, space, apostrophe, and clear actions.
- Allow the keyboard to collapse or expand so it does not dominate small screens.
- Make buttons large enough for touch and accessible with labels.
- Keep the component independent from Convex so it can be unit tested.
- Add Vitest tests for insertion, deletion, cursor handling, and tone-mark output.

Acceptance criteria:

- Users can enter tone-marked pinyin without relying on the system keyboard.
- Keyboard actions work while editing text in the middle of a pinyin value.
- The pinyin keyboard is available anywhere card pinyin can be entered.
- Unit tests cover the pinyin text-editing helpers.

### 6. Manual Review Mode

Create the study loop for a selected deck.

- Start a review session from any deck with at least one card.
- Present pinyin first and hide the English meaning initially.
- Reveal the English meaning on tap or button press.
- Let users mark each card as `known` or `needsPractice`.
- Persist review outcome, review counts, and last reviewed timestamp.
- Move through cards one at a time with progress visible.
- Show a session summary with known and needs-practice counts.
- Handle empty decks with a useful prompt to add cards.
- Keep review controls thumb-friendly on mobile.

Acceptance criteria:

- Review mode updates per-card review stats correctly.
- Users can complete a deck review without losing progress in the UI.
- Empty decks cannot start a broken review session.
- Review mutations and session-state helpers have focused tests.

### 7. Study Quality Improvements

Add small features that make review and authoring feel reliable without expanding beyond MVP.

- Filter cards by all, known, needs practice, and unreviewed.
- Sort cards by recently updated, pinyin, or needs-practice count.
- Add a simple search field for pinyin and English meaning.
- Show subtle inline validation messages in forms.
- Add optimistic UI or disabled states to prevent duplicate submissions.
- Add toast or inline feedback for successful create, update, and delete actions.
- Preserve selected deck and workspace state during normal navigation where practical.

Acceptance criteria:

- Users can find and triage cards in a medium-sized deck.
- Form errors explain what needs to be fixed.
- Repeated clicks do not create accidental duplicate records.

### 8. Visual Polish And Responsive QA

Make the MVP feel cohesive across phone and desktop layouts.

- Use Tailwind CSS for all styling.
- Use shadcn/ui components for dialogs, buttons, inputs, cards, tabs, and menus.
- Keep component files small and named in kebab case.
- Verify phone-sized layouts for deck list, card list, card form, pinyin keyboard, and review mode.
- Add accessible labels for icon-only actions.
- Ensure loading, empty, and destructive-confirmation states are visually clear.
- Replace unused starter assets and styles.

Acceptance criteria:

- The main flows are comfortable on a narrow mobile viewport.
- Text does not overflow buttons, cards, forms, or review controls.
- Destructive actions require confirmation.
- UI implementation follows the project component and styling conventions.

### 9. Testing And Release Readiness

Lock down the MVP before treating it as shippable.

- Add Vitest tests for new pure helpers and feature-specific behavior.
- Add Convex tests for backend ownership, validation, and review mutations.
- Run `pnpm lint`.
- Run `pnpm test:once`.
- Run `pnpm build`.
- Update README with HanziFlow-specific setup and development instructions.
- Record known limitations and next-feature candidates.

Acceptance criteria:

- Lint, test, and production build commands pass.
- README describes the actual HanziFlow app instead of the Vite starter.
- Known limitations are explicit and separated from MVP acceptance criteria.

## Suggested Build Order

1. Finish HanziFlow naming, README cleanup, and app shell polish.
2. Complete and test Convex ownership rules for decks and cards.
3. Finish deck management.
4. Finish card management.
5. Build and test the custom pinyin keyboard.
6. Build manual review mode.
7. Add filtering, sorting, search, and small quality improvements.
8. Run responsive QA, fix rough edges, and complete release checks.

## Global Acceptance Criteria

- Signed-out users cannot access private app data.
- Signed-in users can manage their own decks and cards.
- Users can enter tone-marked pinyin through HanziFlow's custom keyboard.
- Users can review a deck and persist known or needs-practice outcomes.
- The app is usable on mobile and responsive on desktop.
- New features include focused Vitest or Convex tests.
- TypeScript code avoids `any`.
- `pnpm lint`, `pnpm test:once`, and `pnpm build` pass before release.
