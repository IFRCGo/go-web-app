---
"@ifrc-go/ui": major
---

Restructure the library around a declared component layer model (raw → generic → specific) and token specs.

- **Token specs**: `textSize`, `backgroundColor`, `borderRadius` and `boxShadow` join `spacing` as token-valued props resolved through static utility classes (no more runtime style injection; `useSpacingToken` is replaced by the pure `getSpacingClassName`). Ordinal specs support offsets.
- **Variant model**: generic components keep the two-axis `colorVariant` + `styleVariant` API; specific components expose a single curated `variant` (`Button`: `primary`/`secondary`/`tertiary`/`subtle`; `Alert`'s `type` and `ProgressBar`'s `colorVariant` are renamed to `variant`).
- **Boolean→token conversions**: `withBackground`/`withDarkBackground`/`withLightBackground` → `backgroundColor`; `withShadow`/`withoutShadow` → `boxShadow`.
- **Naming**: `variant` → `styleVariant` on Container/InputContainer/Heading; `containerRef` → `elementRef`; `layoutElementRef` removed.
- **Structural**: new generic `RawOutput` value-rendering adapter (TextOutput and KeyFigure rebuilt on it); `KeyFigureView` → `KeyFigureCard`; `RawFileInput` split into a headless primitive plus the new `FileInputButton`; `List` removed in favor of `ListView` + `RawList` + `DefaultMessage`.

See `packages/ui/MIGRATION.md` for exact call-site rewrites.
