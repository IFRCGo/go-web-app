import { defineConfig, Schema } from '@julr/vite-plugin-validate-env';

export default defineConfig({
    APP_TITLE: Schema.string(),
    APP_ENVIRONMENT: (key, value) => {
        // NOTE: APP_ENVIRONMENT_PLACEHOLDER is meant to be used with image builds
        // The value will be later replaced with the actual value
        const regex = /^production|staging|testing|alpha-\d+|development|APP_ENVIRONMENT_PLACEHOLDER$/;
        const valid = !!value && (value.match(regex) !== null);
        if (!valid) {
            throw new Error(`Value for environment variable "${key}" must match regex "${regex}", instead received "${value}"`);
        }
        if (value === 'APP_ENVIRONMENT_PLACEHOLDER') {
            console.warn(`Using ${value} for app environment. Make sure to not use this for builds without helm chart`)
        }
        return value as ('production' | 'staging' | 'testing' | `alpha-${number}` | 'development' | 'APP_ENVIRONMENT_PLACEHOLDER');
    },
    APP_API_ENDPOINT: Schema.string({ format: 'url', protocol: true, tld: false }),
    APP_ADMIN_URL: Schema.string.optional({ format: 'url', protocol: true, tld: false }),
    APP_MAPBOX_ACCESS_TOKEN: Schema.string(),
    APP_TINY_API_KEY: Schema.string(),
    APP_RISK_API_ENDPOINT: Schema.string({ format: 'url', protocol: true }),
    APP_SDT_URL: Schema.string.optional({ format: 'url', protocol: true, tld: false }),
    APP_SENTRY_DSN: Schema.string.optional(),
    APP_SENTRY_TRACES_SAMPLE_RATE: Schema.number.optional(),
    APP_SENTRY_REPLAYS_SESSION_SAMPLE_RATE: Schema.number.optional(),
    APP_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE: Schema.number.optional(),
    APP_GOOGLE_ANALYTICS_ID: Schema.string.optional(),
});
