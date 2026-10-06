# Cypress E2E — markolosic.github.io

End-to-end tests for [markolosic.github.io](https://markolosic.github.io) written with
[Cypress](https://www.cypress.io), using the **Page Object Model**.

## Structure

```
cypress/pages/      Page objects (BasePage, HomePage, BlogPage, BlogPostPage)
cypress/fixtures/   Expected content used by the assertions
cypress/e2e/        Specs (home page, blog list, blog post)
cypress/support/    Global hooks and commands
.github/            GitHub Actions workflow (tests in Docker on every PR)
Dockerfile          Test image based on cypress/included
```

## Setup

```bash
npm install
```

## Running

```bash
npm test                 # headless run (Electron)
npm run test:chrome      # Chrome
npm run test:firefox     # Firefox
npm run cy:open          # Cypress interactive runner
```

Set `BASE_URL` to run against another environment, e.g. a local copy of the site:

```bash
BASE_URL=http://localhost:8080 npm test
```

## Docker

Tests can run inside the official Cypress image, so no local browsers are needed:

```bash
npm run docker:build     # build the image (cypress-e2e)
npm run docker:test      # run all tests; screenshots of failures land in ./cypress/screenshots
```

Pass extra Cypress arguments through Docker Compose:

```bash
docker compose run --rm tests npx cypress run --browser firefox
BASE_URL=http://host.docker.internal:8080 docker compose run --rm tests
```

## CI

`.github/workflows/cypress.yml` builds the Docker image and runs the full test suite on every
pull request (and on demand via *Run workflow*). Screenshots are uploaded as a build artifact
when tests fail.
