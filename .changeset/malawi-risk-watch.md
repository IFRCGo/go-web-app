---
"go-web-app": minor
---

Add Malawi Risk Watch to the country risk watch page

- Add the Flood Foresight (JBA) and Parametric Trigger Model (ARC) sources for Malawi, backed by the Malawi Risk Watch GraphQL API
- Show forecast impact per district and lead time, with a national trigger status and MRCS review for the parametric model
- Add a Layers panel to shade districts and size bubbles by the forecast or HDX metrics, and to show local units
- Overlay the JBA forecast raster from Cloud Optimized GeoTIFFs, reading only the visible window
- Show local units by type with their icons, and their details on click
- Prefill an early warning field report from a district event
- Enable the sources with `APP_MALAWI_RISK_WATCH_DOMAIN`; they stay hidden when it is unset
