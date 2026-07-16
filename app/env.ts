import {
    defineConfig,
    overrideDefineForWebAppServe,
    Schema,
} from '@togglecorp/vite-plugin-validate-env';

const webAppServeEnabled = process.env.WEB_APP_SERVE_ENABLED?.toLowerCase() === 'true';
if (webAppServeEnabled) {
    // eslint-disable-next-line no-console
    console.warn('Building application for web-app-serve');
}
const overrideDefine = webAppServeEnabled
    ? overrideDefineForWebAppServe
    : undefined;

export default defineConfig({
    overrideDefine,
    validator: 'builtin',
    schema: {
        APP_TITLE: Schema.string(),
        APP_ENVIRONMENT: (key: string, value: string) => {
            // NOTE: APP_ENVIRONMENT_PLACEHOLDER is meant to be used with image builds
            // The value will be later replaced with the actual value
            const regex = /^production|staging|testing|alpha-\d+|development|APP_ENVIRONMENT_PLACEHOLDER$/;
            const valid = !!value && (value.match(regex) !== null);
            if (!valid) {
                throw new Error(`Value for environment variable "${key}" must match regex "${regex}", instead received "${value}"`);
            }
            if (value === 'APP_ENVIRONMENT_PLACEHOLDER') {
                // eslint-disable-next-line no-console
                console.warn(`Using ${value} for app environment. Make sure to not use this for builds without web-app-serve`);
            }
            return value as ('production' | 'staging' | 'testing' | `alpha-${number}` | 'development' | 'APP_ENVIRONMENT_PLACEHOLDER');
        },
        APP_API_ENDPOINT: Schema.string({ format: 'url', protocol: true, tld: false }),

        APP_TRANSLATION_API_ENDPOINT: Schema.string({ format: 'url', protocol: true, tld: false }),

        APP_ADMIN_URL: Schema.string.optional({ format: 'url', protocol: true, tld: false }),
        APP_MAPBOX_ACCESS_TOKEN: Schema.string(),
        APP_TINY_API_KEY: Schema.string(),
        APP_RISK_API_ENDPOINT: Schema.string({ format: 'url', protocol: true }),
        APP_SDT_URL: Schema.string.optional({ format: 'url', protocol: true, tld: false }),
        APP_POWER_BI_REPORT_ID_1: Schema.string.optional(),
        APP_SENTRY_DSN: Schema.string.optional(),
        // NOTE: These Sentry sample rates are strings (not numbers) so they can be
        // web-app-serve runtime placeholders. Consumers coerce with Number(...).
        // overrideDefineForWebAppServe emits an unquoted token for non-string
        // schema values, which would be invalid JS, so keep these as strings.
        APP_SENTRY_TRACES_SAMPLE_RATE: Schema.string.optional(),
        APP_SENTRY_REPLAYS_SESSION_SAMPLE_RATE: Schema.string.optional(),
        APP_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE: Schema.string.optional(),

        // NOTE: APP_GOOGLE_ANALYTICS_ID and APP_HOTJAR_ID are intentionally NOT in
        // this schema. They are consumed only by VitePluginRadar in vite.config.ts
        // (via loadEnv, at BUILD time) to inject GA/Hotjar <script> tags into
        // index.html. They have no `import.meta.env` consumer, so they cannot be
        // web-app-serve runtime placeholders. Set them at build time (CI build-args)
        // if analytics is wanted; leave them unset (as production historically did)
        // and no analytics script is injected.
    },
});
