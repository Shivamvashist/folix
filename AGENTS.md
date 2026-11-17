# AGENTS.md

Instructions for any AI coding agent working in this repo (Claude, Gemini, Codex, Cursor and others).

**Start here:**

1. [CLAUDE.md](CLAUDE.md): product context, working rules, stack, layout, commands. The rules there apply to every agent.
2. [docs/planning/STATUS.md](docs/planning/STATUS.md): the current state and what is next.
3. [docs/rules/README.md](docs/rules/README.md): how code is written here.

The short version: one milestone at a time, no em-dashes, schema first, the AI never invents facts, user edits always win, every rule enforced on the server, stay in scope, read the installed version's docs before using a framework API, run `pnpm check` before calling anything done, and no git commits unless asked.

Next.js in this repo is version 16 and differs from older versions. Its docs are in `apps/web/node_modules/next/dist/docs/`. See also [apps/web/AGENTS.md](apps/web/AGENTS.md), which Next.js maintains.
