# syntax=docker/dockerfile:1

FROM node:26-trixie-slim AS base
WORKDIR /home/node
ENV CI=true

# Install app dependencies
# Only invalidated by changes to the root lockfile
FROM base AS deps
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
  npm ci

# Install e2e node modules
# These are also needed by the build, since `tsc -b` type checks the e2e tests
FROM base AS e2e-modules
COPY tests/e2e/package.json tests/e2e/package-lock.json ./tests/e2e/
RUN --mount=type=cache,target=/root/.npm \
  cd tests/e2e && npm ci

# Install the playwright browser and its system dependencies
# Only needed by the test targets, so the production image skips it
FROM e2e-modules AS e2e-deps
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
  --mount=type=cache,target=/var/lib/apt,sharing=locked \
  rm -f /etc/apt/apt.conf.d/docker-clean && \
  cd tests/e2e && npm run playwright-deps

# Build the production assets
FROM deps AS build
COPY --from=e2e-modules /home/node/tests/e2e/node_modules ./tests/e2e/node_modules
COPY tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts index.html ./
COPY tests/e2e/playwright.config.ts tests/e2e/ui.test.ts ./tests/e2e/
COPY public ./public
COPY src ./src
RUN npm run build

# Run unit and integration tests
# Avoid failing the integration tests to capture playwright test results
FROM e2e-deps AS test
COPY --from=build /home/node/ ./
# Files only needed by lint. .gitignore is read by prettier to skip dist and coverage
COPY eslint.config.js .gitignore README.md CLAUDE.md ./
RUN npm run lint && \
  npm run test && \
  cd tests/e2e && \
  if ! npm run test; then touch tests-failed.txt; fi && \
  tar -czf playwright-report.tar.gz playwright-report && \
  tar -czf test-results.tar.gz test-results

# Capture test artifacts
FROM scratch AS test-results
COPY --from=test /home/node/tests/e2e/playwright-report.tar.gz /playwright-report.tar.gz
COPY --from=test /home/node/tests/e2e/test-results.tar.gz /test-results.tar.gz

# Build the Integration Tests
FROM test AS integration-test
WORKDIR /home/node/tests/e2e
# Check for test results failures before publishing the integration-tests image
RUN test ! -f tests-failed.txt
CMD [ "npm", "run", "test" ]

FROM nginx:1.30.7-trixie
LABEL org.opencontainers.image.source=https://github.com/jettisonproj/jettison-ui
EXPOSE 80

COPY --link rootfs/etc/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --link rootfs/etc/nginx/sites/jettison /etc/nginx/sites/jettison
COPY --link --from=build /home/node/dist/ /srv/http/
