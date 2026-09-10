import type { CodegenConfig } from '@graphql-codegen/cli';

// Typed GraphQL documents for the Malawi Risk Watch backend, generated from
// the schema in the malawi-risk-watch-backend submodule.
const config: CodegenConfig = {
    schema: '../malawi-risk-watch-backend/schema.graphql',
    documents: ['src/**/*.{ts,tsx}'],
    ignoreNoDocuments: true,
    config: {
        // Custom scalars would otherwise be typed as `any`.
        scalars: {
            Date: 'string',
            DateTime: 'string',
            Decimal: 'string',
            JSON: 'unknown',
        },
        enumsAsTypes: true,
        useTypeImports: true,
    },
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
