import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

// Component test harness for @ifrc-go/ui.
// JSX is transformed by Vite's esbuild (tsconfig `jsx: react-jsx`), so no
// React plugin is needed; tsconfigPaths resolves the `#components/*` etc.
// aliases. CSS is disabled — these are behaviour/accessibility tests, not
// visual ones, so CSS-module class lookups resolving to undefined is fine.
// `happy-dom` matches the environment the app package already uses.
export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        environment: 'happy-dom',
        globals: false,
        setupFiles: ['./src/setupTests.ts'],
        include: ['src/**/*.test.{ts,tsx}'],
        css: false,
    },
});
