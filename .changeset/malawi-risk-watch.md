---
"go-web-app": minor
---

Add Malawi Risk Watch to the country risk watch page

- Add the Flood Foresight (JBA) and Parametric Trigger Model (ARC) sources for Malawi, backed by the Malawi Risk Watch GraphQL API
- Show forecast impact per district and lead time, with a national trigger status and MRCS review for the parametric model
- Add a Layers panel to shade districts and size bubbles by the forecast or HDX metrics, and to show local units
- Prefill an early warning field report from a district event
- Keep the country view when a district is selected on the Malawi sources
- Enable the sources with `APP_MALAWI_RISK_WATCH_GRAPHQL_ENDPOINT`; they stay hidden when it is unset
