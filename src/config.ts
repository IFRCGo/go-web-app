export const api = 'https://goadmin.ifrc.org';
export const riskApi = 'https://risk-module-api-ifrc.dev.datafriendlyspace.org';
export const tinyApiKey = ''; //FIXME use api key
/*
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

export const environment = process.env.REACT_APP_ENVIRONMENT ?? 'development';

export const api = process.env.REACT_APP_API_ENDPOINT ?? window.appSettings.apiUrl;
export const adminUrl = process.env.REACT_APP_ADMIN_URL ?? window.appSettings.adminUrl;
export const fdrsAuth = process.env.REACT_APP_FDRS_AUTH ?? window.appSettings.fdrsAuth;
export const mbtoken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN ?? window.appSettings.mbtoken;
export const showEnvBanner = process.env.REACT_APP_SHOW_ENV_BANNER ?? window.appSettings.showEnvBanner;
export const riskApi = process.env.REACT_APP_RISK_API_ENDPOINT ?? window.appSettings.riskApi;
export const riskAdminUrl = process.env.REACT_APP_RISK_ADMIN_URL ?? window.appSettings.riskAdminUrl;


// NOTE: New variables required by Sentry
export const sentryAppDsn = process.env.REACT_APP_SENTRY_DSN;
export const sentryTraceSampleRate = Number(process.env.REACT_APP_SENTRY_TRACES_SAMPLE_RATE) || 0.2;
export const sentryNormalizeDepth = Number(process.env.REACT_APP_SENTRY_NORMALIZE_DEPTH) || 5;

const config = {
  api,
  environment,
  fdrsAuth,
};

export default config;
*/
