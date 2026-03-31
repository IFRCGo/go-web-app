const {
    APP_TITLE,
    APP_ENVIRONMENT,
    APP_API_ENDPOINT,
    APP_ADMIN_URL,
    APP_MAPBOX_ACCESS_TOKEN,
    APP_TINY_API_KEY,
    APP_RISK_API_ENDPOINT,
    APP_SDT_URL,
    APP_SENTRY_DSN,
    APP_SENTRY_TRACES_SAMPLE_RATE,
    APP_SENTRY_REPLAYS_SESSION_SAMPLE_RATE,
    APP_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE,
    APP_COMMIT_HASH,
    APP_VERSION,
    APP_PACKAGE_NAME,
    APP_REPOSITORY_URL,
} = import.meta.env;

export const environment = APP_ENVIRONMENT;

export const appTitle = APP_TITLE;
export const appCommitHash = APP_COMMIT_HASH;
export const appVersion = APP_VERSION;
export const appPackageName = APP_PACKAGE_NAME;
export const appRepositoryUrl = APP_REPOSITORY_URL;

export const api = APP_API_ENDPOINT;
export const adminUrl = APP_ADMIN_URL ?? `${api}admin/`;
export const mbtoken = APP_MAPBOX_ACCESS_TOKEN;
export const riskApi = APP_RISK_API_ENDPOINT;
export const sdtUrl = APP_SDT_URL;

export const tinyApiKey = APP_TINY_API_KEY;
export const sentryAppDsn = APP_SENTRY_DSN;
export const sentryTracesSampleRate = APP_SENTRY_TRACES_SAMPLE_RATE;
export const sentryReplaysSessionSampleRate = APP_SENTRY_REPLAYS_SESSION_SAMPLE_RATE;
export const sentryReplaysOnErrorSampleRate = APP_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE;
