const {
    APP_ENVIRONMENT,
    APP_API_ENDPOINT,
    APP_ADMIN_URL,
    APP_MAPBOX_ACCESS_TOKEN,
    APP_RISK_API_ENDPOINT,
    APP_TINY_API_KEY,
    APP_SHOW_ENV_BANNER,
    APP_TITLE,
    APP_COMMIT_HASH,
    APP_VERSION,
    APP_SENTRY_DSN,
    APP_SENTRY_TRACES_SAMPLE_RATE,
    APP_SENTRY_REPLAYS_SESSION_SAMPLE_RATE,
    APP_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE,
} = import.meta.env;

export const environment = APP_ENVIRONMENT;

export const appTitle = APP_TITLE;
export const appCommitHash = APP_COMMIT_HASH;
export const appVersion = APP_VERSION;

export const api = APP_API_ENDPOINT;
export const adminUrl = APP_ADMIN_URL ?? api;
export const mbtoken = APP_MAPBOX_ACCESS_TOKEN;
export const showEnvBanner = APP_SHOW_ENV_BANNER;
export const riskApi = APP_RISK_API_ENDPOINT;
export const tinyApiKey = APP_TINY_API_KEY;
export const sentryAppDsn = APP_SENTRY_DSN;
export const sentryTracesSampleRate = APP_SENTRY_TRACES_SAMPLE_RATE;
export const sentryReplaysSessionSampleRate = APP_SENTRY_REPLAYS_SESSION_SAMPLE_RATE;
export const sentryReplaysOnErrorSampleRate = APP_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE;
