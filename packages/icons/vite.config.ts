import { extname, relative } from 'path';
import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import { globSync } from 'glob';
import dts from 'vite-plugin-dts';
import reactSwc from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [
        reactSwc(),
        tsconfigPaths(),
        dts({ tsconfigPath: './tsconfig.json' }),
    ],
    build: {
        lib: {
            entry: './src/index.ts',
            name: '@ifrc-go/icons',
            formats: ['es'],
        },
        emptyOutDir: false,
        rollupOptions: {
            external: ['react', 'react/jsx-runtime'],
            input: Object.fromEntries(
                globSync('src/**/*.{ts,tsx}', {
                    ignore: ['src/**/*.test.{ts,tsx}', 'src/**/*.d.ts'],
                }).map((file) => ([
                    relative(
                        'src',
                        file.slice(0, file.length - extname(file).length),
                    ),
                    fileURLToPath(new URL(file, import.meta.url)),
                ])),
            ),
            output: {
                entryFileNames: '[name].js',
                globals: {
                    react: 'React',
                },
            },
        },
    },
});
