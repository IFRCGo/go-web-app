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

## Directory Structure

```
.
├── patches/ (Patches to any of the external dependencies)
├── public/ (Content that needs to be copied during build)
├── scripts/ (Scripts used during builds)
├── generated/ (Generated files: eg. Typescript Definitions)
├── index.html (Base html file)
└── src/
    ├── App/
    │   ├── Auth.tsx (Defines page redirections wrt user authentication)
    │   ├── index.tsx (Defines providers: eg. Auth, Route, Request, Alert)
    │   └── routes.tsx (Defines routes for the pages)
    ├── assets/ (images, icons)
    ├── components/ (Components from GO UI)
    │   ├── domain/ (Components that are specific to a domain)
    │   └── parked/ (Components that are not used yet)
    ├── config.ts (Defines configurations read from environment variables)
    ├── contexts/ (Custom contexts)
    ├── declarations/ (Type declarations for external libraries)
    ├── hooks (React Hooks)
    │   └── domain/ (Hooks that are specific to a domain)
    ├── index.tsx (Initializes React)
    ├── utils (Utility functions)
    │   └── domain/ (Utility functions that are specific to a domain)
    └── views/ (Pages that we can navigate on the platform)
        └── RootLayout/
            └── index.tsx (Defines root layout and requests fetched for DomainContext)
```

## TODO

- [ ] Roadmap
- [ ] Contributing
- [ ] License
- [ ] Contact
- [ ] Acknowledgements
