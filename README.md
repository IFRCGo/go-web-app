# IFRC GO - Web App

Web client for the [GO](https://go.ifrc.org) platform

## Getting started

### Prerequisites

You can either use [`docker`](https://www.docker.com/) or [`yarn`](https://yarnpkg.com/) to locally run or build this application.

### Local setup

#### 1. Clone the repo

```bash
git clone git@github.com:IFRCGo/go-web-app.git
cd go-web-app
```

#### 2. Install the dependencies

```bash
# Skip if running through docker
yarn install
```

#### 3. Setup environment variables:

Create a `.env` file with following variables

```env
APP_TITLE=
APP_MAPBOX_ACCESS_TOKEN=
APP_TINY_API_KEY=
APP_API_ENDPOINT=
APP_RISK_API_ENDPOINT=
```

You can contact IFRC team to get appropriate values for these variables

#### 4. Run dev instance

```bash
yarn start
# or
docker-compose up
```

## TODO
- [ ] Roadmap
- [ ] Contributing
- [ ] License
- [ ] Contact
- [ ] Acknowledgements
