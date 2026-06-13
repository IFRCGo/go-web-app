# Migration guide

## v2.x → v3.0.0

v3 restructures the library around two ideas: a declared **component layer model** (raw → generic → specific) and **token specs** — visual props (`spacing`, `textSize`, `backgroundColor`, `borderRadius`, `boxShadow`) resolved against the shared token scales through static CSS utility classes. See `CONTRIBUTING.md` for the conventions and `README.md` for the spec reference. Everything below is a mechanical rewrite; visual changes are explicitly flagged.

### Spec engine (internal mechanism — `spacing` props unchanged)

- `useSpacingToken(options)` (from `@ifrc-go/ui/hooks`) → `getSpacingClassName(options)` (pure function, from `@ifrc-go/ui/utils`). Same options object, same className semantics, no more runtime `<style>` injection.
- `getSpacingValue` / `getOpticallyCorrectedSpacingValue` remain in `@ifrc-go/ui/utils`.
- New resolvers exported alongside: `getTextSizeClassName`, `getBackgroundColorClassName`, `getBorderRadiusClassName`, `getBoxShadowClassName`, plus the scale types `TextSizeType`, `BackgroundColorType`, `BorderRadiusType`, `BoxShadowType`.

### Background tokens

`BackgroundColorType` = `'foreground'` (white card surface) · `'background'` (page gray) · `'element'` (input-well gray). The boolean props below map onto these.

### Button family

| Old | New |
| --- | --- |
| `Button`/`ConfirmButton` `colorVariant` + `styleVariant` | single `variant?: 'primary' \| 'secondary' \| 'tertiary' \| 'subtle'` (default `'secondary'`) |
| `(primary, filled)` | `variant="primary"` |
| `(primary, outline)` / lone `styleVariant="outline"` | `variant="secondary"` (the default — usually just delete the props) |
| `(text, action)` / lone `styleVariant="action"` | `variant="tertiary"` |
| `(primary, translucent)` | `variant="subtle"` |
| any other pair (`text-on-dark`, `success`, `danger`, …) | compose `RawButton` + `ButtonLayout` with the two-axis pair (`ButtonLayout` keeps the full axis API) |
| `Button` `layoutElementRef` | `elementRef` (refs the visual root) |
| `IconButton` `round` | removed — icon buttons are always round |
| `IconButton` `colorVariant`/`styleVariant` | removed — these were **silently ignored** before; delete them |
| `DropdownMenu` `labelColorVariant`+`labelStyleVariant` | `labelVariant` (same mapping as Button) |

`IconButton` defaults to `variant="tertiary"` (preserves the old transparent look). Flagged visual deltas: button padding is now spacing-token-driven and IconButton hover feedback comes from ButtonLayout — minor visual differences possible at dense call sites.

### Status components

- `Alert`: `type` → `variant` (same values). `withoutShadow` → `boxShadow="none"`.
- `ProgressBar`: `colorVariant` → `variant`. The data-driven escape (`variant="custom"` + `color`) is unchanged.
- `TopBanner`: `variant` is now optional (default `'information'`).
- Behavior fixes shipped along the way: `Message` now renders `erroredDescription` when errored (previously rendered an empty block); `DefaultMessage` styles error states with the error variant.

### Containers

- `Container` / `Modal` / `ExpandableContainer` / `InputSection` (Props extend Container's): `withBackground` → `backgroundColor="foreground"` · `withDarkBackground` → `backgroundColor="background"` · `withShadow` → `boxShadow="md"` · `variant` → `styleVariant`. Corner radius now follows `backgroundColor`/`withBorder` automatically (override with the new `borderRadius` prop).
- `ListView`: `withBackground` → `backgroundColor="foreground"` · `withDarkBackground` → `backgroundColor="background"`.
- `Heading`: `variant` → `styleVariant`.

### Inputs

Everything built on `InputContainer` (`TextInput`, `NumberInput`, `DateInput`, `PasswordInput`, `TextArea`, select inputs, `RadioInput`, `Checklist`, `BooleanInput`, …):

- `containerRef` → `elementRef` (root node, per the ref convention)
- `variant` → `styleVariant` (`'form' | 'general' | 'transparent'`)
- `withBackground`/`withDarkBackground` → `backgroundColor`
- `TextArea`'s `inputElementRef` is now correctly typed `HTMLTextAreaElement`; `inputElementRef` props are now actually forwarded to the inner node (previously a silent no-op on several inputs).
- `Checkbox`/`Switch`: `withBackground`/`withDarkBackground` → `backgroundColor`.
- `SegmentInput`: background props removed entirely — the track styles itself.

### Outputs and figures

- New generic `RawOutput` component: the `valueType` discriminated union (`'boolean' | 'number' | 'date' | 'text'` or plain node) previously duplicated inside `TextOutput` and `KeyFigure`. Use it instead of hand-rolled switches.
- `TextOutput`: `withBackground` → `backgroundColor="background"` (page gray — note this is the **inverse** of Container's mapping) · `withLightBackground` → `backgroundColor="foreground"` · `textSize` now accepts the full shared scale (old values unchanged).
- `KeyFigure`: `size` → `textSize` (`'sm'`→`"2xl"`, `'md'`→default, `'lg'`→`"4xl"`); `valueOptions` object flattened into direct props.
- `KeyFigureView` → **`KeyFigureCard`** (`KeyFigureViewProps` → `KeyFigureCardProps`); `withShadow` → `boxShadow="md"`; the never-rendered `children` prop is gone.
- printable `TextOutput`: `variant` → `styleVariant` · `withBackground` → `backgroundColor="background"`.

### File inputs

- `RawFileInput` → **`FileInputButton`** for every existing call site (props 1:1, including the two-axis ButtonLayout styling props).
- The new `RawFileInput` is a true raw primitive: hidden input + `children` as a custom trigger, no styling props.

### Removed

- `List` / `ListProps` — compose `ListView` + `RawList` + `DefaultMessage`.
- `Tab`'s `active` prop — it was always overridden by the Tabs context.
