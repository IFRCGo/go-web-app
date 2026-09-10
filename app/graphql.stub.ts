/*
Stub for the graphql-codegen output in `generated/gql/`.
Lint and typecheck fail if `generated/gql/index.ts` is missing, and codegen needs
the malawi-risk-watch-backend submodule. Without it, this stub is copied instead.
Unlike the OpenAPI stubs it also has a runtime role: `graphql()` returns the
parsed document, so the stub throws rather than silently returning nothing.
NOTE: typecheck step still fails.
*/

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const graphql: (source: string) => any = () => {
    throw new Error('GraphQL documents were not generated. Initialize the malawi-risk-watch-backend submodule and run `pnpm generate:type`.');
};
