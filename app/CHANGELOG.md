# go-web-app

## 7.12.1

### Patch Changes

- Fix nullable type of assessment for NS capacity

## 7.12.0

### Minor Changes

- f766bc7: Add link to IFRC Survey Designer in the tools section under learn menu

### Patch Changes

- 7f51854: - Surge CoS: Health fix
- 3a1cac8: Hide focal point details based on user permissions
- 43d3bf1: - Add Surge CoS Administration section
  - Add Surge CoS Faecal Sludge Management (FSM) section
  - Update Surge CoS IT&T section
  - Update Surge CoS Basecamp section (as OSH)

## 7.11.1

### Patch Changes

- ff426cd: Use current language for field report title generation

## 7.11.0

### Minor Changes

- Field report number generation: Change only when the country or event changes

## 7.10.1

### Patch Changes

- 14567f1: Improved tables by adding default and second-level ordering in [#1633](https://github.com/IFRCGo/go-web-app/issues/1633)

  - Appeal Documents table, `emergencies/{xxx}/reports` page
  - Recent Emergencies in Regions – All Appeals table
  - All Deployed Personnel – Default sorting (filters to be added)
  - Deployed ERUs – Changed filter title
  - Key Documents tables in Countries
  - Response documents
  - Main page – Active Operations table
  - The same `AppealsTable` is used in:
    - Active Operations in Regions
    - Previous Operations in Countries

- 78d25b2:

  - Update on the ERU MHPSS Module in the Catalogue of Services in [#1648](https://github.com/IFRCGo/go-web-app/issues/1648)
  - Update on a PER role profile in [#1648](https://github.com/IFRCGo/go-web-app/issues/1648)
  - Update link to the IM Technical Competency Framework in [#1483](https://github.com/IFRCGo/go-web-app/issues/1483)

- 44623a7: Undo DREF Imminent changes
- b57c453: Show the number of people assisted in the DREF Final Report export in [#1665](https://github.com/IFRCGo/go-web-app/issues/1665)

## 7.10.0

### Minor Changes

- 4f89133: Fix DREF PGA export styling

## 7.9.0

### Minor Changes

- 7927522: Update Imminent DREF Application in [#1455](https://github.com/IFRCGo/go-web-app/issues/1455)

  - Hide sections/fields
  - Rename sections/fields
  - Remove sections/fields
  - Reflect changes in the PDF export

### Patch Changes

- Updated dependencies [4032688]
  - @ifrc-go/ui@1.3.0

## 7.8.1

### Patch Changes

- 9c51dee: Remove `summary` field from field report form
- Update @ifrc-go/ui version

## 7.8.0

### Minor Changes

- 4843cb0: Added Operational Learning 2.0

  - Key Figures Overview in Operational Learning
  - Map View for Operational Learning
  - Learning by Sector Bar Chart
  - Learning by Region Bar Chart
  - Sources Over Time Line Chart
  - Methodology changes for the prioritization step
  - Added an option to regenerate cached summaries
  - Summary post-processing and cleanup
  - Enabled MDR code search in admin

### Patch Changes

- f96e177: Move field report/emergency title generation logic from client to server
- e85fc32: Integrate `crate-ci/typos` for code spell checking
- 4cdea2b: Add redirection logic for `preparedness#operational-learning`
- 9a50443: Add appeal doc type for appeal documents
- 817d56d: Display properly formatted appeal type in search results
- 1159fa4: Redirect obsolete URLs to recent ones
  - redirect `/reports/` to `/field-reports/`
  - redirect `/deployments/` -> `/surge/overview`
- Updated dependencies [4843cb0]
  - @ifrc-go/ui@1.2.3

## 7.7.0

### Minor Changes

- 3258b96: Add local unit validation workflow

### Patch Changes

- Updated dependencies [c5a446f]
  - @ifrc-go/ui@1.2.2

## 7.6.6

### Patch Changes

- 8cdc946: Hide Local unit contact details on the list view for logged in users in [#1485](https://github.com/ifRCGo/go-web-app/issues/1485)
  Update `tinymce-react` plugin to the latest version and enabled additional plugins, including support for lists in [#1481](https://github.com/ifRCGo/go-web-app/issues/1481)
- ecca810: Replace the from-communication-copied text of CoS Health header
- 7cf2514: Prioritize GDACS as the Primary Source for Imminent Risk Watch in [#1547](https://github.com/IFRCGo/go-web-app/issues/1547)
- 8485076: Add Organization type and Learning type filter in Operational learning in [#1469](https://github.com/IFRCGo/go-web-app/issues/1469)
- 766d98d: Auto append https:// for incomplete URLs in [#1505](https://github.com/IFRCGo/go-web-app/issues/1505)

## 7.6.5

### Patch Changes

- 478e73b: Update labels for severity control in Imminent Risk Map
  Update navigation for the events in Imminent Risk Map
  Fix issue displayed when opening a DREF import template
  Fix submission issue when importing a DREF import file
- f82f846: Update Health Section in Catalogue of Surge Services
- ade84aa: Display ICRC Presence
  - Display ICRC presence across partner countries
  - Highlight key operational countries

## 7.6.4

### Patch Changes

- d85f64d: Update Imminent Events

  - Hide WFP ADAM temporarily from list sources
  - Show exposure control for cyclones from GDACS only

## 7.6.3

### Patch Changes

- 7bbf3d2: Update key insights disclaimer text in Ops. Learning
- 0e40681: Update FDRS data in Country / Context and Structure / NS indicators

  - Add separate icon for each field for data year
  - Use separate icon for disaggregation
  - Update descriptions on dref import template (more details on _Missing / to be implemented_ section in https://github.com/IFRCGo/go-web-app/pull/1434#issuecomment-2459034932)

- Updated dependencies [801ec3c]
  - @ifrc-go/ui@1.2.1

## 7.6.2

### Patch Changes

- 4fa6a36: Updated PER terminology and add PER logo in PER PDF export
- 813e93f: Add link to GO UI storybook in resources page
- 20dfeb3: Update DREF import template
  - Update guidance
  - Improve template stylings
  - Update message in error popup when import fails
- 8a18ad8: Add beta tag, URL redirect, and link to old dashboard on Ops Learning

## 7.6.1

### Patch Changes

- 7afaf34: Fix null event in appeal for operational learning

## 7.6.0

### Minor Changes

- Add new Operational Learning Page

  - Add link to Operational Learning page under `Learn` navigation menu
  - Integrate LLM summaries for Operational Learning

## 7.5.3

### Patch Changes

- d7f5f53: Revamp risk imminent events for cyclone
  - Visualize storm position, forecast uncertainty, track line and exposed area differently
  - Add option to toggle visibility of these different layers
  - Add severity legend for exposure
  - Update styling for items in event list
  - Update styling for event details page
- 36a64fa: Integrate multi-select functionality in operational learning filters to allow selection of multiple filter items.
- 894d00c: Add a new 404 page
- 7757e54: Add an option to download excel import template for DREF (Response) which user can fill up and import.
- a8d021d: Update resources page
  - Add a new video for LocalUnits
  - Update ordering of videos
- aea512d: Prevent users from pasting images into rich text field
- fd54657: Add Terms and Conditions page
- bf55ccc: Add Cookie Policy page
- df80c4f: Fix contact details in Field Report being always required when filled once
- 81dc3bd: Added color mapping based on PER Area and Rating across all PER charts
- Updated dependencies [dd92691]
- Updated dependencies [d7f5f53]
- Updated dependencies [fe6a455]
- Updated dependencies [81dc3bd]
  - @ifrc-go/ui@1.2.0

## 7.5.2

### Patch Changes

- 37bba31: Add collaboration guide

## 7.5.1

### Patch Changes

- 2a5e4a1: Add Core Competency Framework link to Resources page in [#1331](https://github.com/IFRCGo/go-web-app/issues/1331)
- 31eaa97: Add Health Mapping Report to Resources page in [#1331](https://github.com/IFRCGo/go-web-app/issues/1331)
- 4192da1: - Local Units popup, view/edit mode improvements in [#1178](https://github.com/IFRCGo/go-web-app/issues/1178)
  - Remove ellipsize heading option in local units map popup
  - Local units title on popup are now clickable that opens up a modal to show details
  - Added an Edit button to the View Mode for users with edit permissions
  - Users will now see a **disabled grey button** when the content is already validated
- 5c7ab88: Display the public visibility field report to public users in [#1743](https://github.com/IFRCGo/go-web-app/issues/1343)

## 7.5.0

### Minor Changes

- 5845699: Clean up Resources page

## 7.4.2

### Patch Changes

- d734e04: - Fix duplication volunteer label in the Field Report details
  - Fix rating visibility in the Country > NS Overview > Strategic priorities page

## 7.4.1

### Patch Changes

- a4f77ab: Fetch and use latest available WorldBank data in [#571](https://github.com/IFRCGo/go-api/issues/2224)
- ebf033a: Update Technical Competencies Link on the Cash page of the Catalogue of Surge Services in [#1290](https://github.com/IFRCGo/go-web-app/issues/1290)
- 18d0dc9: Use `molnix status` to filter surge alerts in [#2208](https://github.com/IFRCGo/go-api/issues/2208)
- b070c66: Check guest user permission for local units
- 72df1f2: Add new drone icon for UAV team in [#1280](https://github.com/IFRCGo/go-web-app/issues/1280)
- 2ff7940: Link version number to release notes on GitHub in [#1004](https://github.com/IFRCGo/go-web-app/issues/1004)
  Updated @ifrc-go/icons to v2.0.1
- Updated dependencies [72df1f2]
  - @ifrc-go/ui@1.1.6

## 7.4.0

### Minor Changes

- b6bd6aa: Implement Guest User Permission in [#1237](https://github.com/IFRCGo/go-web-app/issues/1237)

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
- 3fbe60f: Hide add/edit local units on production environment
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

- Fix crash due to undefined ICRC presence in country page

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
