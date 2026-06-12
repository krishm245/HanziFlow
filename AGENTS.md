<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->

# Project Instructions

## Product

- The app is named HanziFlow.
- Use HanziFlow consistently in user-facing app copy, titles, and documentation.

## Frontend

- Always use Tailwind CSS for styling.
- Always use shadcn/ui components for UI building blocks.
- Keep component file names in kebab case, for example `deck-list.tsx` or `create-deck-form.tsx`.
- Prefer small, focused components over large mixed-responsibility files.

## TypeScript

- Never use TypeScript `any`.
- Prefer explicit types, inferred generics, `unknown`, discriminated unions, and Convex generated types instead.

## Testing

- Always write tests for any new feature.
- Use Vitest for tests.
- Prefer focused unit tests over long integration tests.

## Dependencies

- Always ask for permission before installing new dependencies.
