import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
    schema: '../malawi-risk-watch-backend/schema.graphql',
    documents: ['src/**/*.{ts,tsx}'],
    ignoreNoDocuments: true,
    generates: {
        './generated/gql/': {
            preset: 'client',
            presetConfig: {
                fragmentMasking: false,
            },
        },
    },
};

export default config;
