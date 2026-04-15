# Copilot Instructions — Mental Health

You are a **senior software engineer** working on this codebase. Follow these guidelines at all times.

---
## Engineering Principles

- Write **clean, maintainable code**. Prefer clarity over cleverness.
- **Do not over-engineer.** Only add abstraction when there is a clear, present need — not in anticipation of future needs.
- Keep functions **short and focused** (single responsibility). If a function exceeds ~40 lines, break it up.
- **No dead code.** Remove unused variables, imports, and handlers immediately.
- Validate only at system boundaries (API inputs, form submissions). Skip redundant internal guards.

---

## UI Design — Mobile-First

- Design **mobile-first**. Start with the smallest viewport and layer up with `sm:`, `md:`, `lg:` Tailwind breakpoints.
- Use responsive layout primitives: `flex-col` on mobile → `flex-row` on desktop, stack cards vertically on small screens.
- Touch targets must be at least 44×44px. Prefer `Button` with adequate padding over tiny icon-only controls on mobile.
- Avoid fixed pixel widths. Use `w-full`, `max-w-*`, and `min-w-0` to allow natural reflow.
- Test layouts at 375px (iPhone SE) before considering a feature complete.

---

## React / Next.js Component Rules

- **Break pages into components.** A single page file should not become a monolith. Extract any logical UI section with its own state or handler set into its own component file under `components/`.
- Co-locate component-specific state, not global state unless it is truly shared.
- Use `useCallback` only when a function is passed as a prop or dep to a memoized child. Don't add it by default.
- Prefer named exports for components.

---

## UI Components — shadcn/ui

- **Use shadcn/ui components for all new UI.** Do not introduce new raw HTML elements or `@nextui-org/react` components for new features.
- **Slowly migrate existing `@nextui-org` components to shadcn** as you touch those areas. Do not rewrite untouched sections wholesale.
- Before using a shadcn component, load it via the **shadcn MCP server** to get the correct add command and examples:
  1. Call `mcp_shadcn_list_items_in_registries` to discover available components.
  2. Call `mcp_shadcn_get_add_command_for_items` to get the install command.
  3. Call `mcp_shadcn_view_items_in_registries` to see usage examples.
- Run the add command before using a component — never assume it is already installed.
- Prefer shadcn's composable primitives (`Dialog`, `DropdownMenu`, `Select`, `Tabs`, etc.) over building custom equivalents.

---

## Testing

- **Write tests for every new feature.** No exceptions.
- Place tests in `backend/test/` (`.test.mjs`) for backend logic and a `frontend/__tests__/` directory for frontend components.
- Test the public contract (inputs/outputs, API responses), not implementation details.
- For API/service changes, write at minimum one happy-path and one error-path test.
- Do not ship a feature PR without a corresponding test file.

---

## Code Style

- TypeScript everywhere. Avoid `any` — use proper types or generics.
- Use `const` by default; `let` only when reassignment is necessary.
- Destructure props and objects at the top of the function, not inline.
- Async/await over `.then()` chains.
- Errors should be handled explicitly — do not swallow catch blocks silently.

---

## External Integrations

- Before implementing any integration with a third-party service, **always check the official documentation first**.
- Use the `fetch_webpage` tool to retrieve up-to-date API docs when there is any doubt about endpoint signatures, auth flow, or response shape.
- For Hyperliquid specifically: always verify signing requirements and rate limits before adding new API calls.

---

## NestJS / Backend

- Use explicit `@Inject(ClassName)` decorators for all constructor params — `emitDecoratorMetadata` is **not** supported with the current `tsx`/esbuild toolchain. Implicit type-based injection silently injects `undefined`.
- Keep services thin. Push business logic into domain-specific service classes, not controllers.
- Validate DTOs at the controller boundary only.

---

## Database Migrations

- **Every schema change must have a migration file.** Never modify the DB inline in application code.
- Migration files live in `backend/migrations/` and are named `NNN_description.sql` (e.g. `003_add_indexes.sql`). Numbers are zero-padded to 3 digits and must be strictly sequential.
- The migration runner (`backend/scripts/migrate.ts`) tracks applied migrations in a `schema_migrations` table and runs each pending file once inside a transaction.
- Run migrations standalone with `npm run migrate` from the `backend/` directory.
- The deployment script (`scripts/deploy/deploy-backend.sh`) automatically runs `npm run migrate` before restarting the service — migrations are always applied on deploy.
- When adding a new table or column: (1) add the SQL to a new numbered `.sql` file, (2) update `backend/src/db/schema.ts` to match, (3) add any new methods to `db.service.ts`.

---

## Logging

- **Every service and controller must have a `Logger` instance**: `private readonly logger = new Logger(ClassName.name);`
- **Log all validation failures** at the controller boundary with the reason and the incoming request body (sanitised — omit secrets). This makes it trivial to diagnose 400s without a debugger.
- **Log errors with stack traces**: `this.logger.error('Context message', error instanceof Error ? error.stack : String(error));`
- **Log key lifecycle events** at `log` level: job created/updated/deleted, migration applied, strategy triggered, order placed/cancelled.
- **Never silently swallow a catch block.** At minimum, emit `this.logger.warn(...)`. If you re-throw, still log first so the call site has context.
- **Do not log sensitive data** (API keys, passwords, private keys). Redact or omit them before logging.
- Example controller catch block:
  ```ts
  } catch (error) {
    this.logger.error(`createJob failed — body: ${JSON.stringify(body)}`, error instanceof Error ? error.stack : String(error));
    this.mapError(error, HttpStatus.BAD_REQUEST);
  }
  ```

---

## shadcn Migration Strategy

When touching an existing page or component that uses `@nextui-org/react`:

1. Replace only the components you are **already modifying** — do not refactor untouched siblings.
2. Install the shadcn equivalent first via MCP.
3. Match the existing prop API as closely as possible to minimise diff size.
4. Leave a `// TODO: migrate` comment on `@nextui-org` components in the same file that you haven't touched yet, so future passes can find them.
