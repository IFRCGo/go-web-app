/// <reference types="vite/client" />

type ImportMetaEnvAugmented = import('@togglecorp/vite-plugin-validate-env').ImportMetaEnvAugmented<
  typeof import('../../env').default
>

interface ImportMetaEnv extends ImportMetaEnvAugmented {
    // The custom environment variables that are passed through the vite
    APP_COMMIT_HASH: string;
    APP_VERSION: string;
    APP_PACKAGE_NAME: string;
    APP_REPOSITORY_URL: string;
    APP_PER_DASHBOARD_STATIC_MODE?: string;
    APP_BASE_PATH?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

declare const APP_MAPBOX_ACCESS_TOKEN_FOR_BUILD: string | undefined;
