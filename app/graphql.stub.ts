/*
Stub for the graphql-codegen output in `generated/gql/`.
Lint and typecheck fail if `generated/gql/index.ts` is missing, and codegen needs
the malawi-risk-watch-backend submodule. Without it, this stub is copied instead.
Unlike the OpenAPI stubs it also has a runtime role: `graphql()` returns the
parsed document. The stub parses at runtime, so builds without the submodule
(staging runs a plain `pnpm build`) still work; only the generated types are lost.
NOTE: typecheck step still fails.
*/

import { parse } from 'graphql';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const graphql: (source: string) => any = (source) => parse(source);
