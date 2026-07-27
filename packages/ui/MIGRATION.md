# Migration guide

## v2.x → v3.0.0

v3 restructures the library around two ideas: a declared **component layer model** (raw → generic → specific) and **token specs** — visual props (`spacing`, `textSize`, `backgroundColor`, `borderRadius`, `boxShadow`) resolved against the shared token scales through static CSS utility classes. See `CONTRIBUTING.md` for the conventions and `README.md` for the spec reference. Everything below is a mechanical rewrite; visual changes are explicitly flagged.

### Component renames (HTML/ARIA-aligned)

Pure renames — update the import, the JSX tag, and the `Props` type; props are otherwise unchanged:

| Old | New |
| --- | --- |
| `Modal` / `ModalProps` | `Dialog` / `DialogProps` |
| `Popup` / `PopupProps` | `Popover` / `PopoverProps` |
| `InlineFrame` / `InlineFrameProps` | `Iframe` / `IframeProps` |
| `Pager` / `PagerProps` | `Pagination` / `PaginationProps` |
| `Label` / `LabelProps` | `DisplayLabel` / `DisplayLabelProps` (the generic text label; **not** the form `InputLabel`) |
| `ReducedListDisplay` / `…Props` | `TruncatedList` / `TruncatedListProps` (now a disclosure — full list in DOM, `aria-expanded`) |
| `TextOutput` / `TextOutputProps` | `DataDisplay` / `DataDisplayProps` (now renders `<dl>/<dt>/<dd>`) |
| `NumberOutput` → `NumberDisplay`, `DateOutput` → `DateDisplay`, `BooleanOutput` → `BooleanDisplay`, `DateRangeOutput` → `DateRangeDisplay`, `HtmlOutput` → `HtmlDisplay`, `RawOutput` → `RawDisplay` | the read-only value family is now `*Display` (mirrors `*Input`) |
| `Chip` | split → `ChipLayout` (generic base, `styleVariant`), `Tag` (static label), `Selection` / `SelectionList` (removable selected values) |
| `DropdownMenu` / `DropdownMenuProps` | `Menu` / `MenuProps` (action menu; `role="menu"`). Icon-only triggers should pass `ariaLabel`. |
| `InfoPopup` / `InfoPopupProps` | `MoreInfo` / `MoreInfoProps` — generic info affordance, `as="popover" \| "dialog"`; `infoLabel`→`label`, `description`→`children` (old names kept as deprecated aliases) |
| `DismissableTextOutput`, `DismissableListOutput` | `Selection` (same props) |
| `DismissableMultiListOutput` | `SelectionList` (same props; optional `label` group prefix) |
| `DropdownMenuContext` / `DropdownMenuContextProps` (`@ifrc-go/ui/contexts`) | `MenuContext` / `MenuContextProps` (member `setShowDropdown` unchanged) |
| `TextBadge` | `CharacterCount` (internal; was not exported) |

New: `Dropdown` (generic disclosure that `Menu` composes), `Tag`, `Selection`, `SelectionList`, `ChipLayout`. Unchanged: `KeyFigure`, `KeyFigureCard`, `ColorPreview`, `InputLabel`, `Tooltip`.

Overlays now use native platform features where they fit — no public API changes:
- `Dialog` uses the native `<dialog>` element opened with `showModal()`: focus trapping, focus restore, background inerting, top-layer rendering and the `::backdrop` come from the platform (the `react-focus-on` dependency and the portal are gone; `aria-labelledby` is wired to the Container heading). Escape and backdrop clicks route through `onClose` gated by `closeOnEscape`/`closeOnClickOutside`.
- `Popover` (and the disclosure-style consumers built on it — `Dropdown`, `Menu`, `MoreInfo`, the select dropdowns, floating `InputError`) uses the native Popover API (`popover="manual"`) + **CSS Anchor Positioning** (`anchor-name`/`position-anchor`/`position-area` + `position-try-fallbacks`), with a Portal fallback when the Popover API is unavailable. This path is for **HTML-element triggers**.
- `Tooltip` is intentionally simpler and does **not** use the native Popover API: it renders a `Portal` positioned with `useFloatPlacement` (JS). This keeps the surface in the HTML namespace and uses `getBoundingClientRect`, so tooltips placed **inside `<svg>` (e.g. chart points)** work — the native Popover API is `HTMLElement`-only and CSS anchor positioning doesn't handle SVG anchors.

**Removed dependency:** `react-focus-on` is dropped — the native `<dialog>` provides focus trapping/restore. (`useFloatPlacement` remains, used by `Tooltip`.)

### Accessibility

- **Form fields**: `InputContainer` now wires `<label htmlFor>` (`InputLabel` renders a real `<label>`), generated ids, `aria-describedby`→hint/error, `aria-invalid`, `aria-required`, and `role="alert"` on errors. Grouped controls (`RadioInput`, `Checklist`) get `role="radiogroup"`/`group"`.
- **Roles added**: `Dialog` (`role="dialog"`+`aria-modal`+`aria-labelledby`), `Switch` (`role="switch"`+`aria-checked`), live regions on `Alert`/`Message`/`BlockLoading`/`Spinner`, `Pagination` (`<nav>`+`aria-current`), `Breadcrumbs` (`aria-current`), disclosures (`ExpandableContainer`/`Dropdown`/`MoreInfo`/`TruncatedList`: `aria-expanded`+`aria-controls`).
- **Formatted value outputs** (`NumberDisplay`/`DateDisplay`/`BooleanDisplay`) render native `<data value>` / `<time dateTime>` (machine-readable + test hook — assert on `el.value`/`el.dateTime`, not the formatted text). When the visible text is abbreviated (e.g. `compact` "1.5M"), the full reading is exposed to screen readers via `role="img"`+`aria-label`.
- Deferred to a follow-up (marked `// FIXME(a11y-tier2)`): full `SelectInputContainer` combobox roles, `Tabs` roving-tabindex arrow navigation, `Tooltip` keyboard trigger, `Menu` advanced keyboard nav.

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
