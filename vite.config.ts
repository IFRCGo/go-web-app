import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import webfontDownload from 'vite-plugin-webfont-dl';
import reactSwc from '@vitejs/plugin-react-swc';
import { execSync } from 'child_process';
import { compression } from 'vite-plugin-compression2';
import checker from 'vite-plugin-checker';
import { visualizer } from 'rollup-plugin-visualizer';
import { ValidateEnv as validateEnv } from '@julr/vite-plugin-validate-env';
import svgr from "vite-plugin-svgr";

import envConfig from './env';

/* Get commit hash */
const commitHash = execSync('git rev-parse --short HEAD').toString();

export default defineConfig(({ mode }) => {
    const isProd = mode === 'production';
    return {
        define: {
            'import.meta.env.APP_COMMIT_HASH': JSON.stringify(commitHash),
            'import.meta.env.APP_VERSION': JSON.stringify(process.env.npm_package_version),
        },
        plugins: [
            isProd ? checker({
                // typescript: true,
                eslint: {
                    lintCommand: 'eslint ./src',
                },
                stylelint: {
                    lintCommand: 'stylelint "./src/**/*.css"',
                },
            }) : undefined,
            isProd ? visualizer() : undefined,
            svgr(),
            reactSwc(),
            tsconfigPaths(),
            webfontDownload(),
            validateEnv(envConfig),
            isProd ? compression() : undefined,
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
            outDir: 'build',
            sourcemap: isProd,
            rollupOptions: {
                output: {
                    chunkFileNames: 'chunk-[name].[hash].js',
                    entryFileNames: 'entry-[name].[hash].js',
                    manualChunks: {
                        'mapbox-gl': ['mapbox-gl'],
                    }
                    // experimentalMinChunkSize: 500_000,
                },
            },
        },
        test: {
            environment: 'happy-dom',
        },
    };
});
