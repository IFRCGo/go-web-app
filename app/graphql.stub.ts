/*
Stub for graphql-codegen `client-preset` output.
Both lint and typecheck steps fail if `generated/gql/index.ts` is missing.
We generally generate this file by running `pnpm generate:type:malawi-graphql`.
We cannot always generate this file (e.g. without the submodule), so we just
copy this stub to ensure lint and typecheck do not fail.

Unlike the OpenAPI type stubs, the generated gql module is runtime code: it
maps query sources to parsed GraphQL documents. The stub must therefore never
ship in a build — it throws on use so a misbuilt bundle fails loudly instead
of crashing deep inside urql with a minified React error.
*/

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const graphql: (source: string) => any = () => {
    throw new Error(
        'generated/gql is the stub — GraphQL codegen output is missing from this build. '
        + 'Run `pnpm generate:type:malawi-graphql` (requires the malawi-risk-watch-backend submodule) before building.',
    );
};
