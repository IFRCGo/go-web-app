---
"@ifrc-go/ui": patch
---

Fix button hover feedback overflowing the button

- Match the hover feedback radius to the button shape for outline, filled and translucent variants
- Remove the outward hover halo for these variants so it no longer extends beyond the button border
