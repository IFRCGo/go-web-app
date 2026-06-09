---
"@ifrc-go/ui": minor
---

Add `colorVariant` support in Heading, Breadcrumbs and Description components

- Add shared `ColorVariant` type in utils, re-used by ButtonLayout's `ButtonColorVariant`
- Heading: optional `colorVariant` prop; when set, it also takes precedence over the legacy print colors
- Description: optional `colorVariant` prop; `withLightText` now reduces the opacity of the current color using `color-mix` so it composes with any color variant
- Breadcrumbs: `colorVariant` prop (defaults to `text`); items and separators now use a uniform color and the current page is emphasized with a medium font weight instead of the previous gray/black hierarchy
