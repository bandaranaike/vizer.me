# Repository Guidelines

## Project Structure & Module Organization
- `app/` hosts Next.js App Router pages, server actions, and route handlers; keep page-level state here and push reusable UI into `components/`.
- `components/` contains shared React building blocks (forms, dialogs, inputs). Co-locate CSS modules or Tailwind-friendly utility files beside components when needed.
- `lib/` is reserved for helper utilities (API clients, validation schemas) and should remain framework-agnostic.
- `prisma/` stores `schema.prisma`, migrations, and generated client artifacts; update it whenever domain models shift.
- Static assets live in `public/`, while user-uploaded artifacts during development fall under `uploads/`. Avoid committing secrets or production data here.

## Build, Test, and Development Commands
- `pnpm dev` – runs `next dev --turbopack` with hot reload on `http://localhost:3000`.
- `pnpm build` – compiles the production bundle; run before deploying or pushing large UI changes.
- `pnpm start` – serves the last build locally to sanity-check production behavior.
- `pnpm lint` – validates TypeScript, React, and accessibility rules via `next lint`.
- `pnpm dlx prisma migrate dev --name <change>` and `pnpm dlx prisma studio` manage schema evolution and inspect tables.

## Coding Style & Naming Conventions
- TypeScript + JSX, 2-space indentation, and ES module imports.
- React components in PascalCase (`JobCard.tsx`), hooks/utilities in camelCase, and route segments mirror URL slugs (`app/(dashboard)/jobs/page.tsx`).
- Prefer server components unless a feature needs browser APIs; mark client entries with `"use client"`.
- Tailwind utility classes should stay deterministic; extract repeated patterns into helper functions inside `lib/` or `components/ui`.

## Testing Guidelines
- Dedicated test tooling is not wired up yet; when adding tests, place `*.test.ts(x)` beside the code or inside a future `tests/` directory.
- Favor React Testing Library for component behavior and Playwright for end-to-end flows; target >80% coverage on new surfaces.
- Always run `pnpm lint && pnpm build` before submitting to catch typing and bundler regressions.

## Commit & Pull Request Guidelines
- Recent history mixes sentence-style messages with `feat:` prefixes; standardize on `<type>: <summary>` (e.g., `fix: guard unauthenticated uploads`).
- Keep commits scoped to one concern and include migration files when schema changes.
- Pull requests should describe the problem, the solution, affected routes, and any Prisma or environment prerequisites. Add screenshots or Loom links for UI changes and note manual test steps when automated coverage is missing.
