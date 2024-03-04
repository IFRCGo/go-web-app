import { extname, relative } from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import { glob } from 'glob';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
import reactSwc from '@vitejs/plugin-react-swc';
import { peerDependencies } from './package.json';

export default defineConfig(({ mode }) => {
    const isProd = mode === 'production';
    return {
        plugins: [
            reactSwc(),
            tsconfigPaths(),
            dts({ tsconfigPath: './tsconfig.json' }),
            libInjectCss()
        ],
        css: {
            devSourcemap: isProd,
            modules: {
                scopeBehaviour: 'local',
                localsConvention: 'camelCaseOnly',
            },
        },
        build: {
            lib: {
                entry: './src/index.tsx',
                name: '@ifrc-go/ui',
                formats: ['es'],
            },
            emptyOutDir: false,
            rollupOptions: {
                external: ['react/jsx-runtime', ...Object.keys(peerDependencies)],
                input: Object.fromEntries(
                    glob.sync(
                        'src/**/*.{ts,tsx}',
                        { 'ignore': [
                            'src/**/*.test.{ts,tsx}',
                            'src/**/*.d.ts',
                            'src/**/.json',
                        ]}
                    ).map((file) => ([
                        relative(
                            'src',
                            file.slice(0, file.length - extname(file).length),
                        ),
                        fileURLToPath(new URL(file, import.meta.url))
                    ]))),
                output: {
                    entryFileNames: '[name].js',
                    globals: {
                        'react': 'React',
                        'react-dom': 'ReactDom',
                        '@ifrc-go/icons': 'GoIcons',
                    }
                }
            }
        }
    }
})
