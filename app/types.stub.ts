/*
Both lint and build steps fail if `generated/types.ts` is missing
We generally generate this file using a code generator.
We cannot always generate this file, so we just copy this stub file to
ensure that lint and build do not fail.
NOTE: typecheck step still fails.
*/

export interface paths {};

export interface components {};

export interface operations {};

export interface external {};
