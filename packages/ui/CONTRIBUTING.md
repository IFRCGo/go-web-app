# Contributing to IFRC GO UI

This document records the library's architectural conventions. Every component and every PR is expected to follow them; deviations need an explicit reason in review.

## Component layers

Every component belongs to exactly one layer:

| Layer | Naming | Definition | Examples |
| --- | --- | --- | --- |
| **Raw** | `Raw*` | Unstyled behavioral primitives. No spec props, no sibling component imports, no visual opinion. | `RawButton`, `RawInput`, `RawList`, `RawFileInput` |
| **Generic** | `*Layout`, `*View`, and blessed building blocks | Cover most designs through composition. `*Layout` = slot arrangement meant to be **embedded inside another component's element** (e.g. `ButtonLayout` inside `RawButton`). `*View` = **standalone** generic block placed directly in a page. | `InlineLayout`, `TabLayout`, `ButtonLayout`, `BlockView`, `InlineView`, `ListView`, `Container`, `InputContainer`, `Heading`, `RawOutput` |
| **Specific** | No suffix | Consumer-facing, domain-meaningful components composed from generic + raw pieces. | `Button`, `Alert`, `KeyFigureCard`, `FileInputButton`, `TextOutput` |

Dependency rule (convention, enforced in review): **imports point downward only.** Specific components import generic and raw components — never each other. Generic components import raw components and other generic components below them. Raw components import nothing from the library. A component that needs "a button" inside it imports `ButtonLayout` or `RawButton`, not `Button`.

## Token specs

Visual dimensions are expressed as **specs**: token-valued props backed by the CSS variable scales in `src/index.css` and applied through static utility classes (`src/utils/specs.module.css`) via the resolvers in `src/utils/style.ts`.

| Spec | Prop | Type | Scale | Offset prop |
| --- | --- | --- | --- | --- |
| Spacing | `spacing` | `SpacingType` | `none`, `5xs`–`5xl` (`--go-ui-spacing-*`) | `spacingOffset` |
| Text size | `textSize` | `TextSizeType` | `2xs`–`4xl` (`--go-ui-font-size-*`) | `textSizeOffset` (where needed) |
| Background | `backgroundColor` | `BackgroundColorType` | `foreground` (white surface), `background` (page gray), `element` (input well) | — (categorical) |
| Border radius | `borderRadius` | `BorderRadiusType` | `none`–`3xl`, `full` (`--go-ui-border-radius-*`) | `borderRadiusOffset` (where needed) |
| Shadow | `boxShadow` | `BoxShadowType` | `none`, `xs`–`2xl` (`--go-ui-box-shadow-*`) | `boxShadowOffset` (where needed) |

Rules:

- A spec is defined **once** in `src/utils/style.ts` (type + scale + resolver). Components never declare private size/color scales. To constrain a spec, narrow the shared type: `Extract<TextSizeType, 'xs' | 'sm' | 'md' | 'lg'>`.
- **Offsets** exist on ordinal specs only. An offset shifts the resolved token along the scale (clamped at both ends), so a component rendered in a visually larger or smaller context can shift its whole scale without inventing new tokens.
- `spacing` is **unified**: one value drives gaps and (when `withPadding` is set) padding. Do not split it into separate gap/padding props.
- **Tokens only.** Spec props accept tokens, never arbitrary CSS values. The single exception: data-driven visualization components (`ProgressBar`, charts) may take custom colors through a discriminated union (`variant: 'custom'` + `color`), because there the color encodes data, not design. If a design needs a value the scale lacks, extend the scale — don't add an escape hatch.

## Variants

- **Generic** components expose the two-axis API: `colorVariant` (semantic color) + `styleVariant` (visual treatment). Example: `ButtonLayout`, `TabLayout`.
- **Specific** components expose a single curated `variant` whose values map to axis pairs internally. Example: `Button`'s `variant="primary"` → `ButtonLayout` `colorVariant="primary" styleVariant="filled"`.
- `type` is reserved for HTML semantics (`button type`, `input type`) — never for styling.

## Boolean props

Booleans are for true binaries only (`disabled`, `readOnly`, `withAsterisk`). Anything backed by a token scale or with three or more states must be a token/enum prop (`backgroundColor`, not `withBackground`/`withDarkBackground`).

**Polarity follows the default:** `withX` names a feature that is off by default; `withoutX` names a feature that is on by default. A bare boolean attribute therefore always *flips* the default. When a feature's default changes, its prop must be renamed — that's intentional, it surfaces the behavior change at every call site.

## Refs and styling slots

- `elementRef` always refers to the component's **root** DOM node.
- Secondary nodes get `<slot>Ref` names (`inputElementRef`, `inputSectionRef`).
- Styling escape hatches are flat `<slot>ClassName` props (`labelClassName`, `afterContainerClassName`); `className` applies to the root and is merged last, so consumer overrides win.

## Documentation

- Every exported component carries a JSDoc block: what it is, which layer it belongs to, and notes on non-obvious props. These flow into Storybook automatically via react-docgen.
- Breaking changes ship with a changeset **and** a `MIGRATION.md` entry containing exact before/after call-site rewrites.

## Translations

Keep `strings.*` usages inside the component's own `index.tsx`. The `i18n-usage` lint rule only scans the co-located `index.tsx`, and its autofix deletes keys it believes are unused.

## Releases

Versioning is handled with [changesets](https://github.com/changesets/changesets). Run `npx changeset` at the repo root, pick the bump level, and describe the change from a consumer's perspective.
