# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Keep this file up to date.** Update CLAUDE.md whenever the project structure, architecture, tech stack, or key patterns change.

## Project Overview

"Impostor Game" is a browser-based party game assistant. Players take turns being shown their role (civilian or impostor) along with a secret word on a shared device, without the others seeing.

Key behaviours that shape the code:

- Word bank loaded remotely from a YAML file (GitHub raw URL) and cached in memory
- Last-used word is excluded from the next random draw to avoid immediate repetition
- Game setup (participant count, impostor count, topic) persisted in `localStorage` and restored on next session
- Min 3 / max 20 participants; impostor count capped at half the participant count

## Commands

```bash
bun run dev       # Start development server (http://localhost:3000)
bun run build     # Build for production (static export to ./out)
bun run start     # Start production server
bun run lint      # Run ESLint
bun run test      # Run tests in watch mode
bun run test:run  # Run tests once
```

## Architecture

This is a Next.js 16 web application using:

- **App Router** (`src/app/`) — File-based routing with React Server Components by default
- **TypeScript** — Strict type checking enabled
- **Tailwind CSS v4** — Utility-first styling via `@tailwindcss/postcss`
- **Vitest** — Testing framework with React Testing Library

### Project Structure

```
src/app/
├── layout.tsx                    # Root layout (wraps all pages)
├── page.tsx                      # Home page — game orchestrator (loading → setup → playing phases)
├── globals.css                   # Global styles and Tailwind imports
├── components/
│   ├── ParticipantSetup.tsx      # Setup screen: participant list, topic, impostor count, start button
│   ├── PlayerReveal.tsx          # Per-player role reveal screen (shown one player at a time)
│   ├── ImpostorCounter.tsx       # +/- control for choosing how many impostors
│   └── TopicSelector.tsx         # Dropdown for selecting a word-bank topic
├── lib/
│   ├── gameLogic.ts              # Role assignment and shuffle logic
│   ├── gameSettings.ts           # localStorage persistence of last game config
│   └── wordBank.ts               # Remote YAML word-bank loader, topic listing, word selection
└── __tests__/                    # Vitest + React Testing Library test files
```

### Word Bank

The word bank lives in `word-bank/es.yaml` (checked into the repo) and is served from GitHub's raw CDN at runtime:

```
https://raw.githubusercontent.com/abelazo/impostor/refs/heads/main/word-bank/es.yaml
```

Format:

```yaml
topics:
  <topicId>:
    title: "Display Name"
    words: [word1, word2, ...]
```

### Key Patterns

- Pages are `page.tsx` files that export a default React component
- Layouts in `layout.tsx` wrap child routes and persist across navigation
- Use `'use client'` directive for client-side interactivity (onClick, useState, etc.)
- Server Components (default) can directly fetch data without useEffect
- Import alias `@/*` maps to `src/*`
- The whole app is a single client-side page; there is no server-side logic or API routes

## TDD Workflow

Follow Test-Driven Development:

1. Write a failing test first (`bun run test`)
2. Write minimal code to make it pass
3. Refactor while keeping tests green

Test files go in `__tests__/` directories with `.test.tsx` extension.

## CI/CD & Commits

See [CONTRIBUTING.md](.github/CONTRIBUTING.md) for commit conventions, the full release pipeline, and pre-commit hook setup.
