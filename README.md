# Digdag Language Support for VS Code

A VS Code extension providing language support for [Digdag](https://www.digdag.io/) workflow definition files (`.dig`).

## Features

### Syntax Highlighting

TextMate grammar for `.dig` files with highlighting for:

- Task definitions (`+task_name:`)
- Operators (`sh>`, `td>`, `py>`, etc.)
- Directives (`_retry`, `_parallel`, `_export`, etc.)
- Variable interpolations (`${session_date}`)
- Top-level keys (`timezone`, `schedule`, `sla`, `meta`)
- Strings, numbers, booleans, comments

### Diagnostics

Real-time validation with error and warning diagnostics:

| Rule | Severity |
|------|----------|
| YAML parse errors | Error |
| Only one operator per task | Error |
| Cannot have operator AND subtasks | Error |
| Invalid `_retry` shape | Error |
| Unclosed `${...}` interpolation | Error |
| `_after` requires `_parallel` in parent | Warning |
| `_background` conflicts with `_parallel` | Warning |
| Unknown operator name | Warning |
| Unknown `_` directive | Warning |

### Completion

Context-aware completions triggered by `>`, `:`, `$`, `{`, `_`, `+`:

- **Root level** — `+task`, `timezone`, `schedule`, `sla`, `_export`
- **Inside task** — 36+ operators (`sh>`, `td>`, `py>`, `bq>`, ...), directives (`_retry`, `_parallel`, ...), `+subtask`
- **After `schedule:`** — `daily>`, `hourly>`, `weekly>`, `monthly>`, `cron>`, `minutes_interval>`
- **Inside `${...}`** — built-in variables (`session_date`, `session_time`, `moment`, ...)

### Hover

Hover documentation for:

- Operators — description, parameters, example
- Directives — description, valid values
- Variables inside `${...}` — description, example value
- Top-level keys — description

## Getting Started

### Prerequisites

- Node.js >= 18
- VS Code >= 1.90

### Build

```sh
pnpm install
pnpm build
```

### Run Tests

```sh
pnpm test
```

### Debug in VS Code

1. Open this project in VS Code
2. Press **F5** to launch the Extension Development Host
3. Open a `.dig` file in the new window

## Project Structure

```
digdag-lsp/
├── packages/
│   ├── server/           # LSP server (TypeScript)
│   │   ├── src/
│   │   │   ├── server.ts             # Connection setup
│   │   │   ├── documentManager.ts    # Document sync & re-parse
│   │   │   ├── parser/               # YAML → DigdagDocument
│   │   │   ├── model/                # Data model types
│   │   │   ├── providers/            # Diagnostics, completion, hover
│   │   │   ├── data/                 # Operator/directive/variable catalogs
│   │   │   └── utils/                # Position & YAML helpers
│   │   └── __tests__/
│   └── client/           # VS Code extension
│       ├── src/
│       │   └── extension.ts          # Launches LSP server
│       └── syntaxes/                 # TextMate grammar
├── package.json          # pnpm workspaces root
├── tsconfig.base.json
└── vitest.config.ts
```

## Packaging

```sh
cd packages/client
pnpm vsce package
```

This produces a `.vsix` file that can be installed in VS Code via **Extensions > Install from VSIX...**.

## License

MIT
