import { ValidateEnv as validateEnv } from '@julr/vite-plugin-validate-env';
import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import webfontDownload from 'vite-plugin-webfont-dl';
import reactSwc from '@vitejs/plugin-react-swc';
import { execSync } from 'child_process';
import { visualizer } from 'rollup-plugin-visualizer';
import checker from 'vite-plugin-checker';
import { compression } from 'vite-plugin-compression2';
import { VitePluginRadar } from 'vite-plugin-radar';
import svgr from 'vite-plugin-svgr';
import pkg from './package.json';

import envConfig from './env';

/* Get commit hash */
const commitHash = execSync('git rev-parse --short HEAD').toString();

export default defineConfig(({ mode }) => {
    const isProd = mode === 'production';
    const env = loadEnv(mode, process.cwd(), '')

    return {
        define: {
            'import.meta.env.APP_COMMIT_HASH': JSON.stringify(commitHash),
            'import.meta.env.APP_VERSION': JSON.stringify(env.npm_package_version),
            'import.meta.env.APP_PACKAGE_NAME': JSON.stringify(env.npm_package_name),
            'import.meta.env.APP_REPOSITORY_URL': JSON.stringify(pkg.repository.url.match(/https:\/\/github\.com\/[^ ]+/)?.[0].replace(/\.git$/, '')),
            // NOTE: To fix 'global is not defined' issue after migration from yarn to pnpm
            global: {},
        },
        plugins: [
            isProd ? checker({
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
            webfontDownload(),
            validateEnv(envConfig),
            isProd ? compression() : undefined,
            isProd ? visualizer({ sourcemap: true }) : undefined,
            VitePluginRadar({
                analytics: {
                    id: env.APP_GOOGLE_ANALYTICS_ID,
                },
            })
        ],
        css: {
            devSourcemap: isProd,
            modules: {
                scopeBehaviour: 'local',
                localsConvention: 'camelCaseOnly',
            },
        },
        envPrefix: 'APP_',
        server: {
            port: 3000,
            strictPort: true,
        },
        build: {
            outDir: '../build',
            sourcemap: isProd,
            emptyOutDir: true,
            rollupOptions: {
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
