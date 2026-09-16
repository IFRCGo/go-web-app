import { ValidateEnv as validateEnv } from '@togglecorp/vite-plugin-validate-env';
import { isDefined } from '@togglecorp/fujs';
import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import webfontDownload from 'vite-plugin-webfont-dl';
import reactSwc from '@vitejs/plugin-react-swc';
import { execSync } from 'child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { visualizer } from 'rollup-plugin-visualizer';
import checker from 'vite-plugin-checker';
import { compression } from 'vite-plugin-compression2';
import { VitePluginRadar } from 'vite-plugin-radar';
import svgr from 'vite-plugin-svgr';
import pkg from './package.json';

import envConfig from './env';

/* Get commit hash */
function getCommitHash() {
    try {
        return execSync(
            'git rev-parse --short HEAD',
            { stdio: ['ignore', 'pipe', 'ignore'] },
        ).toString().trim();
    } catch {
        return process.env.APP_COMMIT_HASH ?? 'local';
    }
}

const commitHash = getCommitHash();
const configDirectory = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
    const isStaticReviewBuild = mode === 'static-review';
    const isProd = mode === 'production';
    const isOptimizedBuild = isProd || isStaticReviewBuild;
    const env = loadEnv(mode, process.cwd(), '')
    const staticBasePath = env.APP_BASE_PATH;

    if (
        isStaticReviewBuild
        && (
            !staticBasePath
            || !staticBasePath.startsWith('/')
            || !staticBasePath.endsWith('/')
        )
    ) {
        throw new Error('APP_BASE_PATH must be an absolute path ending in / for the static-review build.');
    }

    return {
        base: isStaticReviewBuild ? staticBasePath : undefined,
        publicDir: isStaticReviewBuild
            ? resolve(configDirectory, 'static-review-public')
            : 'public',
        define: {
            'import.meta.env.APP_COMMIT_HASH': JSON.stringify(commitHash),
            'import.meta.env.APP_VERSION': JSON.stringify(env.npm_package_version),
            'import.meta.env.APP_PACKAGE_NAME': JSON.stringify(env.npm_package_name),
            'import.meta.env.APP_REPOSITORY_URL': JSON.stringify(pkg.repository.url.match(/https:\/\/github\.com\/[^ ]+/)?.[0].replace(/\.git$/, '')),
            APP_MAPBOX_ACCESS_TOKEN_FOR_BUILD: isStaticReviewBuild
                ? 'undefined'
                : JSON.stringify(env.APP_MAPBOX_ACCESS_TOKEN ?? ''),
            // NOTE: To fix 'global is not defined' issue after migration from yarn to pnpm
            global: {},
        },
        plugins: [
            isOptimizedBuild ? checker({
                // typescript: true,
                eslint: {
                    useFlatConfig: true,
                    lintCommand: 'eslint ./src',
                },
                // TODO: Enable this once https://github.com/fi3ework/vite-plugin-checker/issues/260 is fixed
                // stylelint: {
                //     lintCommand: 'stylelint "./src/**/*.css"',
                // },
            }) : undefined,
            svgr(),
            reactSwc(),
            tsconfigPaths(),
            isStaticReviewBuild ? webfontDownload({ throwError: false }) : webfontDownload(),
            isStaticReviewBuild ? undefined : validateEnv(envConfig),
            isProd ? compression() : undefined,
            isProd ? visualizer({ sourcemap: true }) : undefined,
            isStaticReviewBuild ? undefined : VitePluginRadar({
                analytics: {
                    id: env.APP_GOOGLE_ANALYTICS_ID,
                },
                hotjar: isDefined(env.APP_HOTJAR_ID) ? ({
                    id: Number(env.APP_HOTJAR_ID),
                }) : undefined,
            })
        ],
        css: {
            devSourcemap: isOptimizedBuild,
            modules: {
                scopeBehaviour: 'local',
                localsConvention: 'camelCaseOnly',
            },
        },
        envPrefix: 'APP_',
        server: {
            port: 3000,
            allowedHosts: ["host.docker.internal"],
            strictPort: true,
        },
        build: {
            outDir: isStaticReviewBuild ? '../build-per-dashboard-review' : '../build',
            sourcemap: isProd,
            emptyOutDir: true,
            rollupOptions: {
                input: isStaticReviewBuild
                    ? resolve(configDirectory, 'static-review.html')
                    : undefined,
                output: {
                    chunkFileNames: `${env.npm_package_version}/chunk-[name].[hash].js`,
                    entryFileNames: `${env.npm_package_version}/entry-[name].[hash].js`,
                    assetFileNames: `${env.npm_package_version}/asset-[name]-[hash].[ext]`,
                    manualChunks: {
                        'mapbox-gl': ['mapbox-gl'],
                        'exceljs': ['exceljs'],
                    }
                    // experimentalMinChunkSize: 500_000,
                },
            },
        },
        test: {
            environment: 'happy-dom',
            coverage: {
                enabled: true,
                reporter: 'html',
            },
        },
    };
});
