import type { StorybookConfig } from "@storybook/react-vite";
import { join, dirname } from "path";

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): any {
    return dirname(require.resolve(join(value, "package.json")));
}
const config: StorybookConfig = {
    stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],

    addons: [
        getAbsolutePath("@storybook/addon-links"),
        getAbsolutePath("@storybook/addon-essentials"),
        getAbsolutePath("@storybook/addon-onboarding"),
        getAbsolutePath("@storybook/addon-interactions"),
        getAbsolutePath("@storybook/addon-a11y"),
        getAbsolutePath("@storybook/addon-designs"),
        getAbsolutePath("@chromatic-com/storybook"),
    ],

    framework: {
        name: getAbsolutePath("@storybook/react-vite"),
        options: {},
    },

    docs: {},

    staticDirs: ['../public'],

    typescript: {
        reactDocgen: 'react-docgen-typescript',
        reactDocgenTypescriptOptions: {
            compilerOptions: {
                allowSyntheticDefaultImports: false,
                esModuleInterop: false,
            },
            // shouldExtractValuesFromUnion: true,
            shouldExtractLiteralValuesFromEnum: true,
            // Filter out third-party props from node_modules except @ifrc-go/ui package.
            propFilter: (prop) =>
                prop.parent ? !/node_modules\/(?!@ifrc-go\/ui)/.test(prop.parent.fileName) : true,
        },
    },
};
export default config;
