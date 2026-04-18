# Contributing

## Development

First, install dependencies and run the development server:

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/). Every commit message must use one of the following types:

| Type       | Description                                 | Triggers release? |
| ---------- | ------------------------------------------- | ----------------- |
| `feat`     | New feature                                 | Minor bump        |
| `fix`      | Bug fix                                     | Patch bump        |
| `perf`     | Performance improvement                     | Patch bump        |
| `revert`   | Reverts a previous commit                   | Patch bump        |
| `docs`     | Documentation changes                       | No                |
| `style`    | Formatting, whitespace                      | No                |
| `chore`    | Maintenance tasks, dependency updates       | No                |
| `refactor` | Code restructuring without behaviour change | No                |
| `test`     | Adding or updating tests                    | No                |
| `ci`       | CI/CD changes                               | No                |

A `BREAKING CHANGE` footer or `!` suffix on any type triggers a **major** bump.

Examples:

```
feat(topic-selector): add search filter
fix: prevent duplicate word on consecutive rounds
feat!: redesign game flow (breaking change)
```

## Release Flow

Releases are fully automated via [Semantic Release](https://semantic-release.com/) and triggered on every push to `main`. The pipeline runs in the following order:

### 1. Lint

Runs ESLint to catch code style issues.

```bash
bun run lint
```

### 2. Test

Runs the full test suite with Vitest.

```bash
bun run test:run
```

### 3. Build

Compiles the Next.js app to a static export (`./out`). Only runs if lint and test pass.

```bash
bun run build
```

### 4. Release (Semantic Release)

Runs `semantic-release` after a successful build. It executes the following plugins in order:

1. **`@semantic-release/commit-analyzer`** — Reads all commits since the last release and determines the next version bump (patch / minor / major) based on Conventional Commits.

2. **`@semantic-release/release-notes-generator`** — Generates a changelog from the commit history for the new release.

3. **`@semantic-release/npm`** _(npmPublish: false)_ — Writes the new version into `package.json` without publishing to npm.

4. **`@semantic-release/git`** — Commits the updated `package.json` back to `main` with message `chore(release): <version> [skip ci]`. The `[skip ci]` tag prevents the pipeline from re-triggering.

5. **`@semantic-release/github`** — Creates a GitHub Release with the generated notes and attaches it to the new version tag.

6. **`@semantic-release/exec`** — Sets the `released=true` output variable so the downstream deploy job can detect that a release occurred.

> If no release-triggering commits are found, Semantic Release exits without creating a release and the deploy step is skipped.

### 5. Deploy to GitHub Pages

Runs only when step 4 produced a release (`released == 'true'`). It:

1. Fetches the new version tag from GitHub (`gh release view`).
2. Builds the app again with `NEXT_PUBLIC_APP_VERSION` injected.
3. Uploads the `./out` artifact and deploys it to GitHub Pages.

## Running the Pipeline Locally

You can simulate the key steps locally before pushing:

```bash
bun run lint       # Check for lint errors
bun run test:run   # Run tests once
bun run build      # Verify the production build
```

Pre-commit hooks (via `pre-commit`) also run Prettier and validate commit messages automatically. Install them once with:

```bash
pre-commit install
```
