# @ifrc-go/ui

## 2.0.0-beta.2

### Patch Changes

- 9957c1d: Make some minor improvements and adjustments

  - Button
    - Add custom hover behaviour for primary and text variant
    - Update color for text variant
  - ConfirmButton
    - Add spacing for actions
  - Container
    - Add option for fixed height
    - Fix content grow for overflow condition
  - InlineFrame
    - Adjust size
  - KeyFigureView
    - Reduce spacing between icon and figure
  - Label
    - Add option for uppercase transformation
  - Modal
    - Fix content overflow
    - Adjust size
  - Pager
    - Reduce size and font-size to match the design
  - RawFileInput
    - Forward disabled and readOnly props to layout
  - RawTextArea
    - Adjust default min and max heights
  - SelectInputContainer/GenericOption
    - Adjust padding and gap
    - Update hover color
  - Table/TableBodyContent
    - Remove hover effect from row
  - Table/TableHeader
    - Add background
    - Remove bottom border
  - Adjust --width-content-max to 56rem (to closely match UI design)

## 2.0.0-beta.1

### Patch Changes

- 6bc2fe6: Do minor improvements on some components

  - Button: add default colorVariant according to the styleVariants
  - Description: add overflow wrap
  - ExpandableContainer: fix footer action rendering condition
  - Heading: update styling for level 6
  - InlineLayout: add a fallback fix for before, after component for go icons
  - ListView: fix responsiveness for sidebar layout on start
  - TabLayout: update styling for step tab
  - TabListLayout: update styling for step tab
  - ColumnShortcuts: update styling for action columns
  - TableActions: update styling to avoid shrink

## 2.0.0-beta.0

### Major Changes

- 09e2d2e: Introduce new, more strict/opinionated layout system. Update components to reflect the new layout system.

  - Add base layout components
    - InlineLayout
    - BlockLayout
    - ButtonLayout
    - TabLayout
    - TabListLayout
  - Add base views
    - ListView
    - Container (major restructure)
    - InlineView
  - Update useSpacingToken
    - Add optical correction
    - Add option to add additional inline spacing
  - Update spacing tokens
    - Add more tokens (5xs to 5xl)
    - Re-scale tokens to consider optical correction
  - Update components to use new layout and spacing system
  - Remove outdated components
    - BodyOverlay
    - Grid
    - Header
    - Footer
    - FilterBar
    - Overlay
  - Remove outdated hooks
    - useBasicLayout
    - useSpacingTokens (replace with useSpacingToken)
  - Update eslint config

## 1.5.2

### Patch Changes

- 7e470bc: - Update `name` prop in Switch component to support number
  - Update value of `--go-ui-color-semantic-yellow`
- b52d175: add info heading and description in element column in table component

## 1.5.2-beta.1

### Patch Changes

- b52d175: add info heading and description in element column in table component

## 1.5.2-beta.0

### Patch Changes

- 7e470bc: - Update `name` prop in Switch component to support number
  - Update value of `--go-ui-color-semantic-yellow`

## 1.5.1

### Patch Changes

- bfcaecf: Add `addNumDaysToDate` and `ceilToEndOfMonth` date helper functions

## 1.5.0

### Minor Changes

- c26bda4: Add MultiTimelineHeader component to column shortcuts

## 1.4.0

### Minor Changes

- 18ccc85: - Add missing eslint config packages
  - Add elementId prop in Container

## 1.3.1

### Patch Changes

- fe4b727: Update eslint

## 1.3.0

### Minor Changes

- 4032688: Add printable Signature component

## 1.2.4

### Patch Changes

- 4843cb0: - Pass styling props to `BarChart` and `TimeSeriesChart`
  - Fix date separation logic in `getDatesSeparatedByYear`

## 1.2.2

### Patch Changes

- c5a446f: Fix label type for chip component

## 1.2.1

### Patch Changes

- 801ec3c: Add _primary red_ as fallback color for ProgressBar

## 1.2.0

### Minor Changes

- fe6a455: Add Chip component

### Patch Changes

- dd92691: Add DismissableListOutput, DismissableMultListOutput and DismissableTextOutput components
- d7f5f53: - Add support for background in Checkbox, TextOutput
  - Add support for inverted view in Switch
  - Add new view withBorderAndHeaderBackground in Container
  - Add option to set className for label and list container in Legend
- 81dc3bd: - Improve PieChart component and ProgressBar component
  - PieChart component
    - Added a `colorSelector` prop to select color for each pie
  - ProgressBar component
    - Introduced a `color` prop to customize the progress bar's color

## 1.1.6

### Patch Changes

Updated @ifrc-go/icons to v2.0.1

## 1.1.5

### Patch Changes

- 453a397: - Add and export Legend component
  - Add FilterBar component
  - Update RawList to extend Key prop from react
  - Add a pageWidth option for Modal size
  - Update Container to use FilterBar
  - Remove withGridViewInFilterProp from Container, make it the default behavior
  - Add filterActions props in Container

## 1.1.4

### Patch Changes

- 073fa1e: Add a constant for default invalid text

## 1.1.3

### Patch Changes

- 0ab207d: Improve styling and add default options
- 66151a7: Fix overflow issue on heading component

## 1.1.2

### Patch Changes

- 7f0212b: Add ellipsize prop to Heading component

## 1.1.1

### Patch Changes

- a1c0554: Prioritize local name ahead of English name for local units
  Update source links and texts for Country Risk Watch section
- e9552b4: Fix `useDebouncedValue` export

## 1.1.0

### Minor Changes

- 176e01b7: Adjust spacing tokens
- b38d9d9: - Remove deprecated ChartAxisX component
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
- a2455b1a: Add a label description selector to the BarChart component
  - The label description will be visible in a tooltip when hovered over.
- 329ddfcf: Add incrementDate, incrementMonth, getNumberOfDays, getNumberOfMonths, getTemporalDiff utility functions

## 1.0.0

### Major Changes

- ### IFRC GO UI v1.0.0 release

  This is the first “stable” release of the IFRC GO UI Components library.
  This landmark release marks a significant step forward in delivering
  stable and robust user interface components tailored specifically for
  the needs of the IFRC (International Federation of Red Cross and Red Crescent Societies)
  community.

  ### List of added components, hooks and contexts

  ### Components

  - Alert
  - AlertContainer
  - BarChart
  - BlockLoading
  - BodyOverlay
  - BooleanInput
  - BooleanOutput
  - Breadcrumbs
  - Button
  - ChartAxes
  - ChartAxisX
  - ChartAxisY
  - Checkbox
  - Checklist
  - ConfirmButton
  - Container
  - DateInput
  - DateOutput
  - DateRangeOutput
  - DropdownMenu
  - ExpandableContainer
  - Footer
  - Grid
  - Header
  - Heading
  - HtmlOutput
  - IconButton
  - Image
  - InfoPopup
  - InputContainer
  - InputError
  - InputHint
  - InputLabel
  - InputSection
  - KeyFigure
  - LegendItem
  - List
  - Message
  - Modal
  - MultiSelectInput
  - NavigationTabList
  - NumberInput
  - NumberOutput
  - Overlay
  - PageContainer
  - PageHeader
  - Pager
  - PasswordInput
  - PieChart
  - Popup
  - Portal
  - ProgressBar
  - RadioInput
  - RawButton
  - RawFileInput
  - RawInput
  - RawList
  - RawTextArea
  - ReducedListDisplay
  - SearchMultiSelectInput
  - SearchSelectInput
  - SegmentInput
  - SelectInput
  - SelectInputContainer
  - Spinner
  - StackedProgressBar
  - Switch
  - Table
  - Tabs
  - TextArea
  - TextInput
  - TextOutput
  - TimeSeriesChart
  - Tooltip

  ### Components used in PDF export

  - Container
  - DescriptionText
  - Heading
  - Image
  - TextOutput

  ### Hooks

  - useBasicLayout
  - useBlurEffect
  - useBooleanState
  - useFloatPlacement
  - useKeyboard
  - useSizeTracking
  - useSpacingTokens
  - useTranslation

  ### Contexts

  - alert
  - dropdown-menu
  - language
  - navigation-tab
