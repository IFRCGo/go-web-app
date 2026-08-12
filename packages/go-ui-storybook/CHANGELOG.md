# go-ui-storybook

## 2.0.0-beta.0

### Major Changes

- a7f9050: Add stories for new GO UI components (Chip, ExpandableContainer, InputSection, and the layout/view components), reorganize stories into clearer groups, and sync existing stories with the latest `@ifrc-go/ui` props.

### Patch Changes

- a7eda50: Add word limits to TextArea and a new ConfirmModal

  - Set `maxWords` on TextArea to limit how many words can be entered
  - Show the current word count
  - Add ConfirmModal, a confirmation dialog that can be shown without a button

- Updated dependencies [a7eda50]
- Updated dependencies [7cd1e0b]
  - @ifrc-go/ui@2.3.0-beta.0

## 1.0.11

### Patch Changes

- Updated dependencies [cf73a97]
- Updated dependencies [4b0cd41]
  - @ifrc-go/ui@2.2.0

## 1.0.11-beta.0

### Patch Changes

- Updated dependencies [4b0cd41]
  - @ifrc-go/ui@2.2.0-beta.0

## 1.0.10

### Patch Changes

- Updated dependencies [22038c4]
- Updated dependencies [bd93064]
- Updated dependencies [52aefd2]
- Updated dependencies [e619fc8]
  - @ifrc-go/ui@2.1.0

## 1.0.10-beta.2

### Patch Changes

- Updated dependencies [bd93064]
  - @ifrc-go/ui@2.1.0-beta.3

## 1.0.10-beta.1

### Patch Changes

- Updated dependencies [e619fc8]
  - @ifrc-go/ui@2.1.0-beta.2

## 1.0.10-beta.0

### Patch Changes

- Updated dependencies [52aefd2]
  - @ifrc-go/ui@2.0.1-beta.0

## 1.0.9

### Patch Changes

- 09e2d2e: Fix failing stories from GO UI revamp
- Updated dependencies [9957c1d]
- Updated dependencies [6bc2fe6]
- Updated dependencies [92b4a38]
- Updated dependencies [09e2d2e]
  - @ifrc-go/ui@2.0.0

## 1.0.9-beta.3

### Patch Changes

- Updated dependencies [92b4a38]
  - @ifrc-go/ui@2.0.0-beta.3

## 1.0.9-beta.2

### Patch Changes

- Updated dependencies [9957c1d]
  - @ifrc-go/ui@2.0.0-beta.2

## 1.0.9-beta.1

### Patch Changes

- Updated dependencies [6bc2fe6]
  - @ifrc-go/ui@2.0.0-beta.1

## 1.0.9-beta.0

### Patch Changes

- 09e2d2e: Fix failing stories from GO UI revamp
- Updated dependencies [09e2d2e]
  - @ifrc-go/ui@2.0.0-beta.0

## 1.0.8

### Patch Changes

- Updated dependencies [7e470bc]
- Updated dependencies [b52d175]
  - @ifrc-go/ui@1.5.2

## 1.0.8-beta.1

### Patch Changes

- Updated dependencies [b52d175]
  - @ifrc-go/ui@1.5.2-beta.1

## 1.0.8-beta.0

### Patch Changes

- Updated dependencies [7e470bc]
  - @ifrc-go/ui@1.5.2-beta.0

## 1.0.7

### Patch Changes

- Updated dependencies [bfcaecf]
  - @ifrc-go/ui@1.5.1

## 1.0.6

### Patch Changes

- Updated dependencies [c26bda4]
  - @ifrc-go/ui@1.5.0

## 1.0.5

### Patch Changes

- Updated dependencies [18ccc85]
  - @ifrc-go/ui@1.4.0

## 1.0.4

### Patch Changes

- fe4b727: Update eslint and use workspace protocol to reference @ifrc-go/ui
- Updated dependencies [fe4b727]
  - @ifrc-go/ui@1.3.1

## 1.0.3

### Patch Changes

- db732fd: Add Dockerfile and Helm chart to deploy Storybook

## 1.0.2

### Patch Changes

- Update @ifrc-go/ui version

## 1.0.1

### Patch Changes

- 72df1f2: Updated @ifrc-go/icons to v2.0.1

- Updated dependencies [72df1f2]
  - @ifrc-go/ui@1.1.6

## 1.0.0

### Major Changes

- 836e73b: Initial Release v1.0.0

Integrated storybook for IFRC GO UI components in [#406](https://github.com/IFRCGo/go-web-app/issues/406)
The storybook is deployed to chromatic via Github Actions CI.

Wrote stories for following components

- Alert
- BarChart
- BlockLoading
- BooleanInput
- BooleanOutput
- Breadcrumbs
- CheckBox
- Checklist
- ConfirmButton
- Container
- DateInput
- DateRangeOutput
- DropdownMenu
- Footer
- Grid
- Header
- HtmlOutput
- IconButton
- Image
- InfoPopup
- InputContainer
- KeyFigure
- LegendItem
- List
- Message
- Modal
- MultiSelectInput
- NavigationTabList
- NumberInput
- NumberOutput
- PageContainer
- PageHeader
- Pager
- PasswordInput
- PieChart
- Popup
- RadioInput
- RawFileInput
- RawList
- ReducedListDisplay
- SearchMultiSelectInput
- SearchSelectInput
- SegmentInput
- SelectInput
- Spinner
- StackedProgressBar
- Switch
- Table
- Tabs
- TextArea
- TextInput
- TimeSeriesChart

## 0.0.1

### Patch Changes

- Updated dependencies
  - @ifrc-go/ui@1.0.0
