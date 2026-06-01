# ADR 0007 — "Review event" link to the Malawi backend Django admin

**Status:** implemented

## Context
JBA event details already expose a **Create early warning report** link. Operators also need a fast path to the
underlying record in the Malawi Risk Watch backend's Django **admin** (to inspect/curate the ingested forecast). The
frontend knows the backend only through `APP_MALAWI_RISK_WATCH_GRAPHQL_ENDPOINT`, and in dev that endpoint is the
frontend origin (`http://localhost:3000/malawi-graphql`) reverse-proxied by Vite to the real backend — so the real
backend origin is not directly known to the client.

## Decision
- Add a sibling **`Review event`** `Link` (external, `withLinkIcon`, `outline`/`primary`) beside
  *Create early warning report* in `Jba/EventDetails`. Both links are wrapped in a row `ListView` and gated behind the
  existing `canCreateReport = isAuthenticated && !isGuestUser`.
- It opens the admin **index** (`…/admin/`), not a per-event change page. The GraphQL `id` on a flood-forecast impact
  has no known Django `app/model/pk` path, and the request was literally "backend domain/admin", so a reliable deep
  link is out of scope (see Consequences).
- New config export `malawiRiskWatchAdminUrl` (`config.ts`):
  `APP_MALAWI_RISK_WATCH_ADMIN_URL ?? \`${new URL(malawiRiskWatchGraphqlApi).origin}/admin/\``. New **optional**,
  url-validated env var registered in `env.ts`; a commented example added to `.env`. This mirrors the existing
  `adminUrl = APP_ADMIN_URL ?? \`${api}admin/\`` pattern for the GO backend.

## Alternatives
- Deep-link to `…/admin/<app>/<model>/<pk>/change/` — rejected: the GraphQL id → Django admin route is unknown.
- Reuse the GraphQL endpoint origin only (no override env var) — rejected: in dev the endpoint is the *frontend*
  origin (proxied), so the derived `…/admin/` would be a dead link without an explicit override.
- Add a `/malawi-admin` Vite proxy like `/malawi-graphql` — unnecessary: the admin is a browser navigation (new tab),
  not a CORS-constrained `fetch`, so it only needs the real origin, not a same-origin proxy.

## Consequences
- **Default dev is a dead link:** with the default proxied endpoint, the fallback resolves to
  `http://localhost:3000/admin/` (the frontend). Set `APP_MALAWI_RISK_WATCH_ADMIN_URL=http://localhost:8060/admin/`
  (or the deployed backend's `/admin/`) for it to work. In prod the GraphQL endpoint is the real backend origin, so
  the fallback is correct.
- Link label is hard-coded (`// FIXME: use strings`).
- Index-only target means "Review event" lands operators on the admin home, not the specific record; revisit if the
  backend later exposes a stable per-impact admin path.

## Files
`Jba/EventDetails/index.tsx` (the link + row), `config.ts` (`malawiRiskWatchAdminUrl`), `env.ts`
(`APP_MALAWI_RISK_WATCH_ADMIN_URL`), `.env` (commented example).
