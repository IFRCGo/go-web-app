# syntax=docker/dockerfile:1-labs

# -------------------------- Dev ---------------------------------------
FROM node:20-bookworm AS dev

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /code

# -------------------------- Nginx - Builder --------------------------------
FROM dev AS nginx-build

# NOTE: --parents is not yet available in stable syntax, using docker/dockerfile:1-labs
COPY --parents package.json pnpm-lock.yaml pnpm-workspace.yaml ./**/package.json patches/ /code/

RUN corepack prepare --activate

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY . /code/

# Dynamic configs. Can be changed with containers. (Placeholder values)
ENV APP_TITLE=APP_TITLE_PLACEHOLDER
ENV APP_ENVIRONMENT=APP_ENVIRONMENT_PLACEHOLDER
ENV APP_MAPBOX_ACCESS_TOKEN=APP_MAPBOX_ACCESS_TOKEN_PLACEHOLDER
ENV APP_TINY_API_KEY=APP_TINY_API_KEY_PLACEHOLDER
ENV APP_API_ENDPOINT=https://APP-API-ENDPOINT-PLACEHOLDER.COM/
ENV APP_RISK_API_ENDPOINT=https://APP-RISK-API-ENDPOINT-PLACEHOLDER.COM/
ENV APP_SDT_URL=https://APP-SDT-URL-PLACEHOLDER.COM/
ENV APP_SENTRY_DSN=https://APP-SENTRY-DSN-PLACEHOLDER.COM/

# Static configs (Configured when building docker image)
ARG APP_SENTRY_TRACES_SAMPLE_RATE=
ENV APP_SENTRY_TRACES_SAMPLE_RATE=${APP_SENTRY_TRACES_SAMPLE_RATE}
ARG APP_SENTRY_REPLAYS_SESSION_SAMPLE_RATE=
ENV APP_SENTRY_REPLAYS_SESSION_SAMPLE_RATE=${APP_SENTRY_REPLAYS_SESSION_SAMPLE_RATE}
ARG APP_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE=
ENV APP_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE=${APP_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE}

RUN pnpm build

# ---------------------------------------------------------------------------
FROM nginx:bookworm AS nginx-serve

LABEL maintainer="IFRC"
LABEL org.opencontainers.image.source="https://github.com/IFRCGo/go-web-app"

COPY ./nginx-serve/apply-config.sh /docker-entrypoint.d/
COPY ./nginx-serve/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=nginx-build /code/build /code/build

# NOTE: Used by apply-config.sh
ENV APPLY_CONFIG__SOURCE_DIRECTORY=/code/build/
ENV APPLY_CONFIG__DESTINATION_DIRECTORY=/usr/share/nginx/html/
ENV APPLY_CONFIG__OVERWRITE_DESTINATION=true
