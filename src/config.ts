// NOTE: for some reason, old pipeline doesn't load env.js file and window.appSettings is undefined
if (!window.appSettings) {
    window.appSettings = {
        environmentDisplayName: 'Staging site',
        apiUrl: '',
        adminUrl: '',
        fdrsAuth: '',
        mbtoken: '',
        showEnvBanner: 'false',
        riskApi: '',
        riskAdminUrl: '',
        tinyApiKey: '',
    };
}

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

export const environment = APP_ENVIRONMENT ?? 'development';

export const api = APP_API_ENDPOINT ?? window.appSettings.apiUrl;
export const adminUrl = APP_ADMIN_URL ?? window.appSettings.adminUrl;
export const fdrsAuth = APP_FDRS_AUTH ?? window.appSettings.fdrsAuth;
export const mbtoken = APP_MAPBOX_ACCESS_TOKEN ?? window.appSettings.mbtoken;
export const showEnvBanner = APP_SHOW_ENV_BANNER ?? window.appSettings.showEnvBanner;
export const riskApi = APP_RISK_API_ENDPOINT ?? window.appSettings.riskApi;
export const riskAdminUrl = APP_RISK_ADMIN_URL ?? window.appSettings.riskAdminUrl;
export const tinyApiKey = APP_TINY_API_KEY ?? window.appSettings.tinyApiKey;
export const sentryAppDsn = APP_SENTRY_DSN;
export const sentryTraceSampleRate = Number(APP_SENTRY_TRACES_SAMPLE_RATE) || 0.2;
export const sentryNormalizeDepth = Number(APP_SENTRY_NORMALIZE_DEPTH) || 5;

const config = {
    api,
    environment,
    fdrsAuth,
};

export default config;
