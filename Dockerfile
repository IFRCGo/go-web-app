# syntax=docker/dockerfile:1-labs

# -------------------------- Dev ---------------------------------------
FROM node:22-bookworm AS dev

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /code

# -------------------------- web-app-serve - Builder ------------------------
FROM dev AS web-app-serve-build

# NOTE: --parents is not yet available in stable syntax, using docker/dockerfile:1-labs
COPY --parents package.json pnpm-lock.yaml pnpm-workspace.yaml ./**/package.json patches/ /code/

# NOTE: Activates the pnpm version pinned in package.json "packageManager"
RUN corepack prepare --activate

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY . /code/

# NOTE: Dynamic env variables
# These env variables can be dynamically defined in the web-app-serve container
# at runtime. The build-time values below only need to be valid for env.ts schema
# validation; overrideDefineForWebAppServe replaces them with runtime placeholders.
# See the "schema" field in "./app/env.ts".
# NOTE: APP_TITLE is also consumed at build time by Vite's `%APP_TITLE%` HTML
# replacement in index.html (overrideDefine only rewrites `import.meta.env.*` in
# JS). Use the raw web-app-serve placeholder marker as the build value so the
# served index.html carries a runtime placeholder too (same trick as JS keys).
ENV APP_TITLE=WEB_APP_SERVE_PLACEHOLDER__APP_TITLE
ENV APP_ENVIRONMENT=development
ENV APP_API_ENDPOINT=https://web-app-serve-placeholder.com/
ENV APP_TRANSLATION_API_ENDPOINT=https://web-app-serve-placeholder.com/
ENV APP_ADMIN_URL=https://web-app-serve-placeholder.com/
ENV APP_MAPBOX_ACCESS_TOKEN=web-app-serve-placeholder
ENV APP_TINY_API_KEY=web-app-serve-placeholder
ENV APP_RISK_API_ENDPOINT=https://web-app-serve-placeholder.com/
ENV APP_SDT_URL=https://web-app-serve-placeholder.com/
ENV APP_POWER_BI_REPORT_ID_1=web-app-serve-placeholder
ENV APP_SENTRY_DSN=https://web-app-serve-placeholder.com/
ENV APP_SENTRY_TRACES_SAMPLE_RATE=0
ENV APP_SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0
ENV APP_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE=0

# NOTE: APP_GOOGLE_ANALYTICS_ID and APP_HOTJAR_ID are deliberately NOT set here.
# They are build-time-only (consumed by VitePluginRadar in vite.config.ts via
# loadEnv to inject GA/Hotjar <script> tags into index.html) with no
# `import.meta.env` consumer, so they cannot be runtime placeholders. Leaving them
# unset means no analytics script is baked into the web-app-serve image (matching
# historical production behavior). Set them at build time only if analytics is
# wanted for this image.

# NOTE: WEB_APP_SERVE_ENABLED=true swaps the above build-time values for
# web-app-serve runtime placeholders. See "overrideDefine" in "./app/env.ts".
RUN WEB_APP_SERVE_ENABLED=true pnpm build

# ---------------------------------------------------------------------
# Final image using web-app-serve
FROM ghcr.io/toggle-corp/web-app-serve:v0.1.2 AS web-app-serve

LABEL maintainer="IFRC"
LABEL org.opencontainers.image.source="https://github.com/IFRCGo/go-web-app"

# Env for apply-config script (base image only presets DESTINATION_DIRECTORY)
ENV APPLY_CONFIG__SOURCE_DIRECTORY=/code/build/

COPY --from=web-app-serve-build /code/build "$APPLY_CONFIG__SOURCE_DIRECTORY"

# Ship a hardened custom apply-config (grep ^APP_) instead of the base image's
# stock default-app-apply-config.sh. The stock script only substitutes vars that
# are SET and never blanks unfilled markers, so an unset var leaked the literal
# WEB_APP_SERVE_PLACEHOLDER__* marker into the bundle — visibly so for APP_TITLE,
# which appears as `%APP_TITLE%` in index.html (<title>, noscript, splash). Our
# script escapes sed metachars (values with &/|/\ substitute literally, no crash)
# and blanks unfilled placeholders to "" (restores the old nginx-serve semantics:
# unset == empty/falsy). See ./web-app-serve/apply-config.sh.
COPY ./web-app-serve/apply-config.sh /web-app-serve/app-apply-config.sh
RUN chmod +x /web-app-serve/app-apply-config.sh
ENV APPLY_CONFIG__APPLY_CONFIG_PATH=/web-app-serve/app-apply-config.sh

# NOTE: APP_TITLE is a default (overridable) var — it has a sensible shared
# default ("IFRC GO") but stays runtime-overridable. Bake the default as an ENV
# here in the final stage; apply-config substitutes it at startup like any other
# var, so deployments need not set it, yet can override it. (The build stage sets
# APP_TITLE to the raw placeholder marker so index.html carries a runtime slot.)
ENV APP_TITLE="IFRC GO"
