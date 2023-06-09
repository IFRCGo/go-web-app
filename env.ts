import { defineConfig, Schema } from '@julr/vite-plugin-validate-env';

export default defineConfig({
    APP_ADMIN_URL: Schema.string.optional(),
    APP_API_ENDPOINT: Schema.string(),
    APP_ENVIRONMENT: Schema.string.optional(),
    APP_MAPBOX_ACCESS_TOKEN: Schema.string(),
    APP_RISK_API_ENDPOINT: Schema.string(),
    APP_SENTRY_DSN: Schema.string.optional(),
    APP_SENTRY_NORMALIZE_DEPTH: Schema.number.optional(),
    APP_SENTRY_TRACES_SAMPLE_RATE: Schema.number.optional(),
    APP_SHOW_ENV_BANNER: Schema.boolean.optional(),
    APP_TINY_API_KEY: Schema.string(),
    APP_TITLE: Schema.string(),
})
