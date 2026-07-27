## IFRC GO UI

[![npm (scoped)](https://img.shields.io/npm/v/@ifrc-go/ui)](https://github.com/IFRCGo/go-web-app/blob/develop/LICENSE)
[![npm (scoped)](https://img.shields.io/npm/l/@ifrc-go/ui)](https://github.com/IFRCGo/go-web-app/blob/develop/LICENSE)
[![Build](https://github.com/IFRCGo/go-web-app/actions/workflows/ci.yml/badge.svg)](https://github.com/IFRCGo/go-web-app/actions/workflows/ci.yml)

[IFRC GO UI](https://www.npmjs.com/package/@ifrc-go/ui) is a React components library for the IFRC GO platform and its associated initiatives.

## Built with

[![React][react-shields]][react-url] [![Vite][vite-shields]][vite-url] [![Typescript][typescript-shields]][typescript-url]

## Installation

Install the `@ifrc-go/ui` package and its peer dependencies.

```bash
# using pnpm
pnpm install @ifrc-go/ui
# using npm
npm install @ifrc-go/ui
```

## Usage

```tsx
import { Button } from '@ifrc-go/ui';

function Example() {
    const handleButtonClick = () => {
        console.warn('button clicked');
    };

    return (
        <Button
            name="button"
            onClick={handleButtonClick}
            variant="tertiary"
        >
            Button
        </Button>
    );
}
```

## Design System Philosophy

The layout system establishes a foundation for building interfaces that feel **fluid, consistent, and naturally responsive**. It minimizes repetitive styling decisions while maintaining precise spatial rhythm across the UI.

### Tight, Opinionated Layouts

Ad‑hoc manual styling is discouraged. Layout components provide default spacing and alignment, ensuring design rhythm consistency.

**Composition Over Customization**

Use pre‑defined primitives (`Container`, `InlineLayout`, `BlockView`, etc.) instead of manual CSS tweaks.

### Naturally Responsive Fluid Layouts

Every layout primitive flows naturally with available space. Components expand, shrink, and align seamlessly without relying on fixed widths or explicit breakpoints.

Responsiveness is inherent—inline flows align, block flows stack, and grids re‑flow automatically. Developers rarely need to write custom media queries.

### Consistent Spacing System

All spacing uses a unified token scale, ensuring predictable rhythm and easy collaboration between design and development.

**Optical Correction**

Subtle optical adjustments compensate for line‑height inconsistencies (e.g., in ListView), producing visually balanced layouts.


## Component Layers

Every component belongs to one of three layers (see [CONTRIBUTING.md](./CONTRIBUTING.md) for the full rules):

- **Raw** (`Raw*`) — unstyled behavioral primitives (`RawButton`, `RawInput`, `RawList`). No visual opinion, no spec props.
- **Generic** — the small set that covers most designs through composition. `*Layout` components arrange slots *inside* another component's element (`ButtonLayout` inside `RawButton`); `*View` components are *standalone* generic blocks (`BlockView`, `InlineView`, `ListView`); plus building blocks like `Container`, `InputContainer`, `Heading`, and `RawOutput`. Generic components carry the token-spec props and expose two-axis variants (`colorVariant` + `styleVariant`).
- **Specific** — consumer-facing components composed from the layers below (`Button`, `Alert`, `TextOutput`, `KeyFigureCard`). They expose a single curated `variant` and narrow spec scales to their design needs.

Imports point downward only: specific components never import each other.

## Token Specs

Visual dimensions are token-valued props ("specs") resolved against the CSS-variable scales in `index.css` through static utility classes:

| Spec | Prop | Values | Offset |
| --- | --- | --- | --- |
| Spacing | `spacing` | `none`, `5xs`–`5xl` | `spacingOffset` |
| Text size | `textSize` | `2xs`–`4xl` | `textSizeOffset` |
| Background | `backgroundColor` | `foreground`, `background`, `element` | — |
| Border radius | `borderRadius` | `none`–`3xl`, `full` | `borderRadiusOffset` |
| Shadow | `boxShadow` | `none`, `xs`–`2xl` | `boxShadowOffset` |

Ordinal specs accept an **offset**: the resolved token shifts along the scale (clamped), so the same `spacing="md"` or `textSize="md"` can resolve one step larger or smaller inside a visually bigger or denser context — without inventing new tokens.

## Accessibility

The library is built **native-semantics-first**: components reach for the correct HTML element or ARIA role rather than re-creating behaviour on a `<div>`, so keyboard and screen-reader support largely come for free. See [CONTRIBUTING.md](./CONTRIBUTING.md#accessibility) for the full conventions; the highlights:

- **Form fields** wire `label`↔control↔hint↔error once in `InputContainer` — real `<label htmlFor>`, `aria-describedby`, `aria-invalid`, and `role="alert"` on errors.
- **Interactive widgets** follow the WAI-ARIA Authoring Practices pattern (dialog, tabs, combobox, switch, disclosure).
- **Formatted outputs speak to three audiences at once** — the headline accessibility pattern:

| Audience | Sees / hears / reads | Carrier |
| --- | --- | --- |
| Sighted | `1.5M` | visible text |
| Screen reader | `1,500,000` | `role="img"` + `aria-label` |
| Machine / test | `1500000` | native `<data value>` / `<time datetime>` |

```tsx
<data value="1500000" role="img" aria-label="1,500,000">1.5M</data>
<time dateTime="2026-06-13" role="img" aria-label="13 June 2026">13 Jun</time>
```

The `role="img"` (and `aria-label`) appear **only when the visible text is an abbreviated, lossy form** of the value; full values render as a plain `<data>`/`<time>` that reads correctly on its own. Tests assert on the native `value`/`dateTime` attribute, never on the formatted text.

## UI Layout Concepts

### ListView

`ListView` represents a layout structure designed to display multiple related items following a consistent spatial rhythm It abstracts repetitive spacing/alignment so each item can focus on content. It supports three predefined layout modes — inline, block, and grid — to cover a wide range of patterns without manual styling.

#### Design goals

- **Unified rhythm:** Centralizes spacing, dividers, and density across lists.
- **Natural responsiveness:** Lists adapt by wrapping, stacking, or re‑flowing columns.
- **Optical balance:** Subtle corrections (e.g., for text line-height) ensure rows look evenly spaced.
- **Tight layouts:** The list, not its items, manages spacing.

#### Visual mental models

**Inline:** one‑dimensional flow (chips/actions)
```
[Tag] [Tag] [Tag] [Tag]
```
**Block:** vertical reading flow (rows)
```
• Row A
• Row B
• Row C
```
**Grid:** two‑dimensional gallery (cards)
```
[Card][Card][Card]
[Card][Card][Card]
```

#### Conceptual behaviors by mode

**Inline** – flows left→right; supports wrapping or truncation.  
**Block** – stacks vertically; uses consistent rhythm and dividers.  
**Grid** – manages both **target column count** and **minimum card width**, reserving gutter space for balance.

#### Spacing and semantics

- The **list owns its space**; items avoid external margins.
- **Spacing tokens** ensure alignment across modes.
- Semantic structure uses proper list roles and preserves keyboard order.

#### Composition examples

- Settings panel → `ListView(block)` + inset dividers.
- Card gallery → `ListView(grid)` + cards using `BlockView`.
- Metadata chips → `ListView(inline)` with compact density.

---

### InlineLayout

`InlineLayout` arranges elements horizontally in a single visual line. It’s designed for content with clear *before* and *after* anchors.

#### Structure

```
Before → Content → After
```
**Before:** leading visuals or icons.  
**Content:** main label or text; expands to fill space.  
**After:** trailing actions or indicators.

#### Key ideas

- Single-line composition — **no wrapping**.  
- Uses **spacing tokens** for consistent horizontal rhythm.  
- Vertical alignment via **optical baseline**, not bounding box.  
- Overflow handled by truncation in content.

#### When to use
- Buttons or navigation items.  
- List rows with icons/actions.  
- Inputs with prefix/suffix.  
- Any case needing stable inline alignment.

### InlineView — Concept

`InlineView` adapts the InlineLayout model for constrained spaces. It keeps **Before + Content** on the same line and lets **After** lift above when width is limited.

#### Visual model

**Normal width:**
```
[●]  Title of the item                                  [⋯]
```
**Constrained width:**
```
                              [⋯]
[●]  Long content title that wraps
```

#### Principles

- **Container-query driven:** adapts to container width, not viewport breakpoints.  
- Maintains stable reading order and focus.  
- Token-based spacing; no ad‑hoc margins.  
- Ensures optical alignment across lines.

#### Use cases

- List rows with actions that should stay visible.  
- Settings lines with long labels.  
- Headings with metadata that move above gracefully.

#### InlineLayout vs InlineView
- **InlineLayout:** fixed single-line pattern.  
- **InlineView:** adaptive variant that wraps gracefully under constraint.


### BlockView

`BlockView` defines vertical stacking for **header–content–footer** structures — cards, forms, panels, or page sections.

### Mental model

```
┌──── BlockView ────┐
│ Header (optional) │
│ Content           │
│ Footer (optional) │
└───────────────────┘
```

#### Principles

- Encodes hierarchy through space, not borders.  
- Uses **spacing tokens** to control vertical rhythm.  
- Supports optional dividers (none / inset / full‑bleed).  
- Applies **optical compensation** for mixed typography.

#### Composition

- Header → `InlineLayout` for titles/actions.  
- Content → nested BlockViews or lists.  
- Footer → actions or summaries.

#### Use cases

Cards, dashboards, forms, or document sections that need predictable vertical rhythm.

---

### Container

`Container` is the universal section wrapper used across pages, cards, sidebars, and in‑page groups. It provides alignment, gutters, and visual context for nested layout primitives and is intended to cover most common layout use case scenarios throughout the system.

#### Mental model

```
Container (Section)
├─ Header / Toolbar
├─ Content (lists, grids, forms)
└─ Footer / Actions
```

#### Principles

- Acts as the boundary for each section or block.  
- Supplies inner padding via **spacing tokens**; children don’t manage external margins.  
- Optionally provides background, shadow, and padding based on the use case, along with overlay states (empty, loading, errored) while maintaining consistent rhythm.

#### Use cases

- Page sections and panels.  
- Card bodies and dashboards.  
- Sidebar link groups.  
- Nested sub‑sections inside larger compositions.

### Spacing System — Tokens & Scaling

The spacing system provides a **shared vocabulary** paddings and gaps across all layout primitives.

#### Principles

- Tokens (`5xs` → `5xl`) define a modular scale.  
- The `getSpacingClassName()` resolver maps tokens to static utility classes.  
- Shared across ListView, BlockView, Inline*, and Container.  
- Adjusts for **optical harmony** and **density presets** (Compact ↔ Comfortable).  
- Scales subtly with breakpoints for comfort and consistency.

`getSpacingClassName` (from `@ifrc-go/ui/utils`) resolves semantic spacing tokens into static classes applying gaps and padding; `getSpacingValue` returns the raw CSS value for the rare inline-style case.

#### Design intent

Ensures the entire system speaks one **spacing language**, decoupling *meaning* from *measurement* for future‑proof, theme‑driven design.

- Keeps all components aligned to the same rhythm.  
- Maps tokens to theme-aware, relative units (e.g., rem).  
- Enables consistent density and scaling without hardcoded numbers.
- Tokens stay meaningful while values stay flexible.  
- Components never multiply pixels; spacing math lives inside the resolver.  
- Works across layout primitives to keep rhythm unified.


## Changelog

The [changelog](https://github.com/IFRCGo/go-web-app/blob/develop/packages/ui/CHANGELOG.md) file summarizes the changes made to the library across different releases. The changelog is regularly updated to reflect what's changed in each new release.

## Contributing

[See contribution guide →](https://github.com/IFRCGo/go-web-app/tree/develop/packages/ui/CONTRIBUTING.md)

## License

[MIT](https://github.com/IFRCGo/go-web-app/blob/develop/LICENSE)

<!-- MARKDOWN LINKS & IMAGES -->

<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[react-shields]: https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB

[react-url]: https://reactjs.org/

[vite-shields]: https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white

[vite-url]: https://vitejs.dev/

[typescript-shields]: https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white

[typescript-url]: https://www.typescriptlang.org/
