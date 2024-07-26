## Development

The stable branch for IFRC Go application is `develop`. All the PR's that needs to be merged for deployment should target the `develop` branch.

For long running features, the specific `project/project-x` should be targeted when creating a PR for a particular feature related to the project.

### Prerequisites

To begin, ensure you have network access. Then, you'll need the following
1. [Git](https://git-scm.com/)
2. [Node.JS](https://nodejs.org/en/) version >=18 / 20+
3. [Yarn 1](https://classic.yarnpkg.com/en/)
4. Alternatively, you can use [Docker](https://www.docker.com/) to build the application.

### Local development

1. Clone the repository using HTTPS, SSH, or Github CLI
```bash
git clone https://github.com/IFRCGo/go-web-app.git #HTTPS
git clone git@github.com:IFRCGo/go-web-app.git #SSH
gh repo clone IFRCGo/go-web-app #Github CLI
```
2. Install the dependencies
```bash
yarn install
```
3. Copy `app/.env.example` to `app/.env` and update the variables
```bash
cp app/.env.example app/.env
```
4. Start the development server
```bash
yarn start:app
```
