# ADR 0004 — Forecast lead-time numbered slider (replaces the radio group)

**Status:** implemented

## Context
JBA produces 10 TIFFs/day (one per lead time, day 1–10). The earlier control was a `RadioInput` group ("1d 2d … 10d").
The design handoff (`design_handoff_lead_time_selector`, direction **B2 — Numbered Slider**) called for a single
horizontal slider with a numbered 1–10 scale. GO ships **no** slider primitive.

## Decision
Build `LeadTimeFilter` as a bespoke, dependency-free slider:
- A track (`role="slider"`) with a red fill, a 20 px white handle (red border), and a row of clickable numbered
  buttons 1–10. Range/`default` from `JBA_LEAD_TIME_DAYS = [1..10]` / `JBA_DEFAULT_LEAD_TIME_DAYS = 3`; state lifted to
  `RiskImminentEvents`.
- Interaction: pointer drag with `setPointerCapture` (+ `onPointerCancel` reset), keyboard (Arrow/Home/End, clamped),
  and direct number-button clicks. Touch hit-area extended beyond the 6 px track.
- A11y: `aria-valuemin/max/now/valuetext` on the track; `aria-pressed` per number button; `:focus-visible` rings.
- **All design tokens mapped to GO CSS variables** (`--go-ui-color-primary-red`, `--go-ui-color-gray-30`,
  `--go-ui-box-shadow-sm`, `--go-ui-font-*`, `--go-ui-border-radius-full`, focus ring via `color-mix`). Label via
  `InputLabel`. Only raw geometry (20 px / 2.5 px / 6 px) is literal, per the handoff.
- Selecting `leadTimeDays` filters the markers and selects the COG TIFF to overlay.

## Alternatives
- The prior `RadioInput` group (replaced).
- Other slider directions on the prototype canvas (bubble, notched, handle-pill, bar scrubber, dropdown, stepper,
  timeline); **B2** ("refined & wired to data") was chosen. The icon-marker handle variant was rejected — B2 uses no icons.

## Consequences
- A reusable accessible slider now exists without adding a GO primitive.
- Changing lead time re-renders impacts and lazily fetches that lead day's COG; there is **no explicit
  loading/empty state** for a not-yet-available lead time (a follow-up the handoff flagged).
- Label/day strings are hard-coded (`// FIXME: use strings`).
- GO's `formatNumber` ignores its `unit` option, so the unit is shown in headings, not per value (relevant to ADR 0005).

## Files
`Jba/LeadTimeFilter/index.tsx`, `Jba/LeadTimeFilter/styles.module.css`, `malawi/constants.ts` (9–12),
`RiskImminentEvents/index.tsx` (93–95), `design_handoff_lead_time_selector/README.md`.
