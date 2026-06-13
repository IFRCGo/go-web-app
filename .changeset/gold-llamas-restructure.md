---
"@ifrc-go/ui": major
---

Restructure the library around a declared component layer model (raw → generic → specific) and token specs.

- **Token specs**: `textSize`, `backgroundColor`, `borderRadius` and `boxShadow` join `spacing` as token-valued props resolved through static utility classes (no more runtime style injection; `useSpacingToken` is replaced by the pure `getSpacingClassName`). Ordinal specs support offsets.
- **Variant model**: generic components keep the two-axis `colorVariant` + `styleVariant` API; specific components expose a single curated `variant` (`Button`: `primary`/`secondary`/`tertiary`/`subtle`; `Alert`'s `type` and `ProgressBar`'s `colorVariant` are renamed to `variant`).
- **Boolean→token conversions**: `withBackground`/`withDarkBackground`/`withLightBackground` → `backgroundColor`; `withShadow`/`withoutShadow` → `boxShadow`.
- **Naming**: `variant` → `styleVariant` on Container/InputContainer/Heading; `containerRef` → `elementRef`; `layoutElementRef` removed.
- **Structural**: new generic `RawOutput`→`RawDisplay` value-rendering adapter (DataDisplay and KeyFigure rebuilt on it); `KeyFigureView` → `KeyFigureCard`; `RawFileInput` split into a headless primitive plus the new `FileInputButton`; `List` removed in favor of `ListView` + `RawList` + `DefaultMessage`.
- **HTML/ARIA-aligned renames**: `Modal`→`Dialog`, `Popup`→`Popover`, `InlineFrame`→`Iframe`, `Pager`→`Pagination`, `Label`→`DisplayLabel`, `ReducedListDisplay`→`TruncatedList`, `TextOutput`→`DataDisplay` (renders `<dl>`), the `*Output` value family → `*Display` (renders `<data>`/`<time>`), `InfoPopup`→`MoreInfo`, `DropdownMenu`→`Menu` (+ new generic `Dropdown`), `Chip` split into `ChipLayout`/`Tag`/`Selection`/`SelectionList` (replacing the `Dismissable*Output` trio), `DropdownMenuContext`→`MenuContext`.
- **Accessibility**: form-field label/`aria-describedby`/`aria-invalid`/`role="alert"` wiring in `InputContainer`; dialog/switch/live-region/disclosure/nav roles; and the value-output pattern (native `<data value>`/`<time dateTime>` for machine + tests, `role="img"`+`aria-label` exposing the full reading of abbreviated values to screen readers). Some widget patterns (combobox, tabs roving-tabindex, tooltip keyboard) are deferred and marked `FIXME(a11y-tier2)`.

See `packages/ui/MIGRATION.md` for exact call-site rewrites.
