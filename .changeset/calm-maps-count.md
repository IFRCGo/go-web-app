---
"go-web-app": minor
"@ifrc-go/ui": minor
---

Update the PER dashboards to use the current PER API

- Global Summary uses the PER map-data API (`/api/v2/per-map-data`)
- Global Performance uses the PER dashboard-data API (`/api/v2/per-dashboard-data`)
- Add the PER dashboard charts, filters and Excel export to the app
- Add PER dashboard components to the UI library
- Show the PER rating labels translated and in the same colours as the other PER pages
- Show the date of the latest PER update from the API in the dashboard header
- Leave National Societies that only did an Orientation out of the PER cycle counts
- Translate the cycle labels, KPI descriptions, rating headings and map errors of the PER dashboards
- Keep the counts of the other regions visible when a region is selected on the Global Summary
- Filter the Global Performance by cycle when a bar of the cycle chart is clicked
- Show the number of processes in the assessment type donut tooltip
- Let keyboard users deselect a region, resize the High Priority Components treemap with the page and show map errors readably
- Let keyboard users filter with the High Priority Components tiles and open a National Society on the PER map (Tab to reach, arrow keys to move between National Societies, Enter to open, Escape to close)
- Retry loading the PER dashboard data when the connection drops or the server fails, without a time limit on slow connections
- Keep the selected KPI tab and phase on the Global Summary in step with the phase filter, and let a selected KPI tab be clicked again to clear its filter
- Export exactly what the Global Summary shows, with each National Society's current cycle
- Count a PER consideration in the consideration filter only once the process reached Assessment, as the gauges do
