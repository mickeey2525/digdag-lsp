# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A VS Code extension providing language support (LSP) for [Digdag](https://www.digdag.io/) workflow `.dig` files. Features: syntax highlighting, diagnostics, completion, hover, and go-to-definition.

## Commands

```sh
pnpm install          # Install all dependencies (root + workspaces)
pnpm build            # Bundle server + client with esbuild
pnpm build:watch      # Bundle in watch mode
pnpm test             # Run all tests (vitest)
pnpm test:watch       # Run tests in watch mode
```

Run a single test file:
```sh
pnpm vitest run packages/server/__tests__/providers/completionProvider.test.ts
```

Package the extension:
```sh
cd packages/client && pnpm vsce package --no-dependencies
```

## Architecture

Monorepo with npm workspaces, two packages:

- **`packages/server`** — LSP server using `vscode-languageserver`. Parses `.dig` files (YAML-based) into a `DigdagDocument` model, then provides LSP features.
- **`packages/client`** — VS Code extension that launches the server. Also contains the TextMate grammar (`syntaxes/digdag.tmLanguage.json`).

### Server Pipeline

1. **`server.ts`** — Connection setup, registers LSP capability handlers
2. **`documentManager.ts`** — Listens for document open/change, triggers re-parse
3. **`parser/digdagParser.ts`** — Parses YAML text → `DigdagDocument` (tree of `Task` nodes with operators, directives, variables)
4. **`parser/variableParser.ts`** — Extracts `${...}` variable interpolations from text
5. **`providers/`** — Each provider implements one LSP feature:
   - `diagnosticsProvider.ts` — Validates operator conflicts, directive usage, retry shapes, unclosed interpolations
   - `completionProvider.ts` — Context-aware completions for operators, directives, variables, schedule types
   - `hoverProvider.ts` — Documentation on hover for operators, directives, variables
   - `definitionProvider.ts` — Go-to-definition support
6. **`data/`** — Static catalogs (`operators.ts`, `directives.ts`, `variables.ts`, `scheduleTypes.ts`) defining known Digdag operators, directives, and built-in variables
7. **`model/`** — Type definitions: `DigdagDocument`, `Task`, shared types

### Key Design Patterns

- The YAML library (`yaml` package) is used for parsing; the parser converts YAML AST into Digdag-specific `Task` tree structures.
- Providers receive the parsed `DigdagDocument` and the current cursor position to generate results.
- All Digdag domain knowledge (operator names, directive names, variable names) lives in `data/` as typed arrays/objects.

## Testing

Tests use **vitest** and live in `packages/server/__tests__/`, mirroring the `src/` structure. Tests cover parsers and all providers.

## Bundling

Both the server and client are bundled with **esbuild** (`esbuild.mjs` at the repo root). The server is bundled into `packages/client/out/server.js` so that both files are co-located and included in the `.vsix` package.

## TypeScript

- Target: ES2020, module: commonjs
- Strict mode enabled
- Base config in `tsconfig.base.json`, each package extends it
