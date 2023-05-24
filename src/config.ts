const {
    APP_ENVIRONMENT,
    APP_API_ENDPOINT,
    APP_ADMIN_URL,
    APP_FDRS_AUTH,
    APP_MAPBOX_ACCESS_TOKEN,
    APP_RISK_API_ENDPOINT,
    APP_RISK_ADMIN_URL,
    APP_TINY_API_KEY,
    APP_SHOW_ENV_BANNER,
    APP_SENTRY_DSN,
    APP_SENTRY_TRACES_SAMPLE_RATE,
    APP_SENTRY_NORMALIZE_DEPTH,
} = import.meta.env;

export const environment = APP_ENVIRONMENT;

export const api = APP_API_ENDPOINT;
export const adminUrl = APP_ADMIN_URL ?? api;
export const fdrsAuth = APP_FDRS_AUTH;
export const mbtoken = APP_MAPBOX_ACCESS_TOKEN;
export const showEnvBanner = APP_SHOW_ENV_BANNER;
export const riskApi = APP_RISK_API_ENDPOINT;
export const riskAdminUrl = APP_RISK_ADMIN_URL;
export const tinyApiKey = APP_TINY_API_KEY;
export const sentryAppDsn = APP_SENTRY_DSN;
export const sentryTraceSampleRate = APP_SENTRY_TRACES_SAMPLE_RATE;
export const sentryNormalizeDepth = APP_SENTRY_NORMALIZE_DEPTH;
