# go-web-app

## 7.3.13

### Patch Changes

- 453a397: - Update Local Unit map, table and form to match the updated design in [#1178](https://github.com/IFRCGo/go-web-app/issues/1178)
  - Add delete button in Local units table and form
  - Use filter prop in container and remove manual stylings
  - Update size of WikiLink to match height of other action items
  - Add error boundary to BaseMap component
- Updated dependencies [453a397]
  - @ifrc-go/ui@1.1.5

## 7.3.12

### Patch Changes

- ba6734e: Show admin labels in maps in different languages, potentially fixing [#1036](https://github.com/IFRCGo/go-web-app/issues/1036)

## 7.3.11

### Patch Changes

- d9491a2: Fix appeals statistics calculation

## 7.3.10

### Patch Changes

- 3508c83: Add missing validations in DREF forms
- 3508c83: Fix region filter in All Appeals table
- 073fa1e: Remove personal detail for focal point in local units table
- b508475: Add June 2024 Catalogue of Surge Services Updates
- 3508c83: Handle countries with no bounding box
- d9491a2: Fix appeals based statistics calculation
- Updated dependencies [073fa1e]
  - @ifrc-go/ui@1.1.4

## 7.3.9

### Patch Changes

- 49f5410: - Reorder CoS list
  - Update texts in CoS strategic partnerships resource mobilisation

## 7.3.8

### Patch Changes

- 478ab69: Hide contact information from IFRC Presence
- 3fbe60f: Hide add/edit local units on production environmet
- 90678ed: Show Organization Type properly in Account Details page

## 7.3.7

### Patch Changes

- 909a5e2: Fix Appeals table for Africa Region
- 5a1ae43: Add presentation mode in local units map
- 96120aa: Fix DREF exports margins and use consistent date format
- 8a4f26d: Avoid crash on country pages for countries without bbox

## 7.3.6

### Patch Changes

- 1b4b6df: Add local unit form
- 2631a9f: Add office type and location information for IFRC delegation office
- 2d7a6a5: - Enable ability to start PER in IFRC supported languages
  - Make PER forms `readOnly` in case of language mismatch
- e4bf098: Fix incorrect statistics for past appeals of a country
- Updated dependencies [0ab207d]
- Updated dependencies [66151a7]
  - @ifrc-go/ui@1.1.3

## 7.3.5

### Patch Changes

- 894a762: Fix seasonal risk score in regional and global risk watch

## 7.3.4

### Patch Changes

- d368ada: Fix GNI per capita in country profile overview

## 7.3.3

### Patch Changes

- 73e1966: Update CoS pages as mentioned in #913
- 179a073: Show all head of delegation under IFRC Presence
- 98d6b62: Fix region operation map to apply filter for Africa

## 7.3.2

### Patch Changes

- f83c12b: Show Local name when available and use English name as fallback for local units data

## 7.3.1

### Patch Changes

- 7f0212b: Integrate mapbox street view for local units map
- Updated dependencies [7f0212b]
  - @ifrc-go/ui@1.1.2

## 7.3.0

### Minor Changes

- 0dffd52: Add table view in NS local units

## 7.2.5

### Patch Changes

- 556766e: - Refetch token list after new token is created
  - Update link for terms and conditions for Montandon

## 7.2.4

### Patch Changes

- 30eac3c: Add option to generate API token for Montandon in the user profile

## 7.2.3

### Patch Changes

- Fix crash due to undefined ICRC presense in country page

## 7.2.2

### Patch Changes

- - Update country risk page sources
  - Update CoS pages
- Updated dependencies [a1c0554]
- Updated dependencies [e9552b4]
  - @ifrc-go/ui@1.1.1

## 7.2.1

### Patch Changes

- Remove personal identifiable information for local units

## 7.2.0

### Minor Changes

- 9657d4b: Update country pages with appropriate source links
- 66fa7cf: Show FDRS data retrieval year in NS indicators
- b69e8e5: Update IFRC legal status link
- 300250a: Show latest strategic plan of National Society under Strategic Priorities
- 9657d4b: Add GO Wiki links for country page sections
- b38d9d9: Improve overall styling of country pages
  - Make loading animation consistent across all pages
  - Make empty message consistent
  - Use ChartContainer and update usage of charting hooks
  - Update BaseMap to extend defaultMapOptions (instead of replacing it)
  - Add an option to provide popupClassName in MapPopup
- 80be711: Rename `Supporting Partners` to `Partners`.
  - Update IFRC legal status link.
  - Update the name of the strategic priorities link to indicate that they were created by the National Society.
- 176e01b: Simplify usage of PER question group in PER assessment form
  - Add min widths in account table columns

## 7.1.5

### Patch Changes

- Updated dependencies
  - @ifrc-go/ui@1.0.0
