# syntax=docker/dockerfile:1-labs

# -------------------------- Dev ---------------------------------------
FROM node:20-bullseye AS dev

RUN apt-get update -y \
    && apt-get install -y --no-install-recommends \
        git bash g++ make \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /code

RUN git config --global --add safe.directory /code

# -------------------------- Nginx - Builder --------------------------------
FROM dev AS nginx-build

# NOTE: --parents is not yet available in stable syntax, using docker/dockerfile:1-labs
COPY --parents package.json pnpm-lock.yaml pnpm-workspace.yaml ./**/package.json patches/ /code/

RUN corepack prepare --activate

RUN pnpm install

COPY ./packages/ui /code/packages/ui
COPY ./packages/go-ui-storybook /code/packages/go-ui-storybook

RUN pnpm build-storybook

# ---------------------------------------------------------------------------
FROM nginx:alpine AS nginx-serve

LABEL maintainer="IFRC"
LABEL org.opencontainers.image.source="https://github.com/IFRCGo/go-web-app/tree/develop/packages/go-ui-storybook"

COPY ./packages/go-ui-storybook/nginx-serve/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=nginx-build /code/packages/go-ui-storybook/storybook-static /usr/share/nginx/html