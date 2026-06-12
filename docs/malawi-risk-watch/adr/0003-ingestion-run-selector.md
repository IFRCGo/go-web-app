# ADR 0003 — JBA ingestion-run selector in the header (run-info popup, data-aware default)

**Status:** implemented

## Context
JBA delivers one ingestion run per day; each run's `forecastIssueDate` keys that day's impacts. Users need to switch
runs, and the initial view must not land on a pending/failed run with no impacts. The previous JBA heading appended
the issue date as `(issued yyyy-mm-dd)`.

## Decision
- Add `IngestionRunFilter`, a compact label-less `SelectInput` rendered in the side-panel `Container`'s
  **`headerActions`** (passed through a new `RiskImminentEventMap` `headerActions` prop). Options are `jbaIngestionRuns`
  ordered `runDate DESC`; the option label is the run's `runDate`.
- An `IngestionRunInfo` `InfoPopup` (run date, status, files processed `n/m`, forecast issued, completed) is wired as
  the `SelectInput`'s **`actions`** slot (`@ifrc-go/ui` has no literal `after`).
- **Default run** = the run whose `runDate` matches the most recent **impact** issue date, else `ingestionRuns[0]`.
  `activeIssueDate` falls back to the latest impact issue date when the runs query is empty/unavailable — so impacts
  still render independent of the runs query.
- `runDate` is treated as equal to `forecastIssueDate` (string-compared). The `(issued …)` heading suffix is removed.
- The side-panel `empty` gate was relaxed to `events.length === 0` so a no-impact run shows the empty message while
  the header/filters stay visible (only JBA passes `sidePanelFilters`).

## Alternatives
- Keep the issue date in the heading instead of a header select + popup.
- Default to the newest run unconditionally (`ingestionRuns[0]`) — rejected to avoid empty default views.
- The select is `nonClearable`, so there is always an active run.

## Consequences
- Run metadata is discoverable via the popup; the heading stays clean.
- The `runDate === forecastIssueDate` mapping is assumed (see [assumptions A12](../assumptions.md#-a12--rundate--forecastissuedate-ingestion-run--impacts-join)); the `activeIssueDate` fallback limits the blast radius.
- **Inconsistency:** ARC still appends `(observed <date>)` to its heading, so JBA and ARC headings now differ.
- `IngestionRunInfo` labels are hard-coded (`// FIXME: use strings`).

## Files
`Jba/IngestionRunFilter/index.tsx`, `Jba/index.tsx` (run state, default, fallback, heading), `RiskImminentEventMap/index.tsx` (`headerActions` prop; `empty` gate).
