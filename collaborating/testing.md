## Testing the IFRC GO Project

### Unit Testing with Vitest

We use [Vitest](https://vitest.dev/) for running unit tests. To run the unit tests, navigate to the `app` folder and run the following command:

```bash
pnpm test
```

### End-to-End Testing with Playwright

For end-to-end testing, we use [Playwright](https://playwright.dev/). The test scripts are located in the `e2e-tests` folder under the `packages` directory. For further information, please refer to the [Playwright documentation](https://playwright.dev/docs/intro).

> \[!NOTE]\
> Ensure all environment variables are correctly configured before running the tests. Make sure all necessary packages are installed.

To run the Playwright tests, use the following commands:

* To run the tests
  ```bash
  pnpm playwright test
  ```

* To run the tests in UI mode
  ```bash
  pnpm playwright test --ui
  ```

* To run the tests in headed mode
  ```bash
  pnpm playwright test --headed
  ```

For more information on running and debugging tests, refer to the [Playwright documentation](https://playwright.dev/docs/running-tests).
