---
"@ifrc-go/ui": minor
---

- Remove deprecated ChartAxisX component
- Remove deprecated ChartAxisY component
- Add ChartContainer component
- Add DefaultMessage component
- Add padding in Message component
- Update Container component
  - Add an option to center header description
  - Add an option for the footer border
  - Change default behavior of footer to wrap and add option to disable wrapping
  - Add errored property
  - Fix behavior for the empty and errored message
  - Improve grid responsive behavior
- Update table to support errored state
- Add useDebouncedValue hook
- Update useBasicLayout hook to properly incorporate the wrap feature
- Add throttling in useSizeTracking hook
