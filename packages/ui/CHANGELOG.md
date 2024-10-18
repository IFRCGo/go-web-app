# @ifrc-go/ui

## 1.2.0

### Minor Changes

- fe6a455: Add Chip component

### Patch Changes

- dd92691: Add DismissableListOutput, DismissableMultListOutput and DismissableTextOutput components
- d7f5f53: - Add support for background in Checkbox, TextOutput
  - Add support for inverted view in Switch
  - Add new view withBorderAndHeaderBackground in Container
  - Add option to set className for label and list container in Legend
- 81dc3bd: - Improve PieChart component and ProgresBar component
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
  - Remove withGridViewInFiterProp from Container, make it the default behavior
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
