/*
Stub for graphql-codegen `client-preset` output.
Both lint and typecheck steps fail if `generated/gql/index.ts` is missing.
We generally generate this file by running `pnpm generate:type:malawi-graphql`.
We cannot always generate this file (e.g. without the submodule), so we just
copy this stub to ensure lint and typecheck do not fail.
*/

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const graphql: (source: string) => any = () => ({});
