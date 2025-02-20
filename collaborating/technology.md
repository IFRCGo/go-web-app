## Technologies Used to Build the IFRC GO Website

The IFRC GO web application is built using [React](https://react.dev/) and [Vite](https://vitejs.dev/), with [TypeScript](https://www.typescriptlang.org/) as the primary programming language and [pnpm](https://pnpm.io/) as the package manager.

### Libraries and Tools

* **Styling**
  * [PostCSS](https://postcss.org/) with CSS Modules

* **Maps**
  * [@mapbox-gl](https://www.npmjs.com/package/mapbox-gl) for rendering maps
  * [@togglecorp/re-map](https://www.npmjs.com/package/@togglecorp/re-map), a thin wrapper around MapboxGL, for easier integration with React

* **Icons and UI**
  * [@ifrc-go/icons](https://www.npmjs.com/package/@ifrc-go/icons), the IFRC GO icons library
  * [@ifrc-go/ui](https://www.npmjs.com/package/@ifrc-go/ui), the UI library powering the IFRC GO platform

* **Routing**
  * [React Router](https://www.npmjs.com/package/react-router-dom) for client-side routing

* **Excel Exports**
  * [exceljs](https://www.npmjs.com/package/exceljs) for generating and importing Excel files

* **Data Fetching**
  * [@togglecorp/toggle-request](https://www.npmjs.com/package/@togglecorp/toggle-request), a hooks-based request library

* **Form Handling**
  * [@togglecorp/toggle-form](https://www.npmjs.com/package/@togglecorp/toggle-form), a hooks-based form library for managing complex forms with validation and type support

* **Testing and Monitoring**
  * [Storybook](https://storybook.js.org/) for manual testing and visual regression tests of React components
  * [Sentry](https://sentry.io/welcome/) for reporting exceptions and monitoring application performance and reliability
  * [Playwright](https://playwright.dev/) for end-to-end testing
  * [Vitest](https://vitest.dev/) for unit testing

* **Versioning and Changelog**
  * [Changesets](https://github.com/changesets/changesets) for managing versioning and generating changelogs
