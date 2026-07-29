# National Risk Watch

A system that forecasts Early Warning alerts, disseminates notifications, and visualizes exposure information to support decision making, following the country advisory. It has:
- A front-end, which is being developed in (a fork of) this repo. It can be rendered as standalone, or embedded within the IFRC GO navigation structure. 
- And `data pipelines` (producing forecasts) and `back-end services` (ingesting and processing forecast data via API and publishing this - alongside seed data - via APIs) which are developed in a [separate repo](https://github.com/rodekruis/IBF/blob/main).

## Getting started

1. Launch the [NRW backend services](https://github.com/rodekruis/IBF/blob/main/services) and populate the DB. See [README](https://github.com/rodekruis/IBF/blob/main/README.md)
2. Copy [`sample.env`](./app/sample.env), rename it to `.env` and set any needed values there.
3. **NOTE**: You can set `APP_NRW_STANDALONE` to `false` or `true` for respectively *embedded* or *standalone* version. If the former, then set up and run the `go-api` submodule service first. See [go-api README](./go-api/README.md).
4. The FontAwesome API token must be available when installing dependencies: `FONTAWESOME_API_KEY=XXXX pnpm install`.
5. Launch with `pnpm start` and visit `http://localhost:3000`.
6. In embedded version: go to Country > Country Profile > National Risk Watch. Standalone version is directly accessible at `http://localhost:3000`.

## CI/CD setup

The CI workflow needs the environment variable `FONTAWESOME_API_KEY`.
