import { defineConfig, Schema } from '@julr/vite-plugin-validate-env';

export default defineConfig({
    APP_ADMIN_URL: Schema.string.optional({ format: 'url', protocol: true }),
    APP_API_ENDPOINT: Schema.string({ format: 'url', protocol: true }),
    APP_ENVIRONMENT: Schema.enum(['development', 'testing', 'staging', 'production'] as const),
    APP_MAPBOX_ACCESS_TOKEN: Schema.string(),
    APP_RISK_API_ENDPOINT: Schema.string({ format: 'url', protocol: true }),
    APP_SHOW_ENV_BANNER: Schema.boolean.optional(),
    APP_TINY_API_KEY: Schema.string(),
    APP_TITLE: Schema.string(),
    APP_SENTRY_DSN: Schema.string.optional(),
    APP_SENTRY_TRACES_SAMPLE_RATE: Schema.number.optional(),
    APP_SENTRY_REPLAYS_SESSION_SAMPLE_RATE: Schema.number.optional(),
    APP_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE: Schema.number.optional(),
    APP_GOOGLE_ANALYTICS_ID: Schema.string.optional(),
})
