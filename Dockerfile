# Build the production assets
FROM node:24 AS build

WORKDIR /home/node
ENV CI=true

# Install dependencies
COPY package.json package-lock.json ./
COPY tests/e2e/package.json tests/e2e/package-lock.json ./tests/e2e/
RUN --mount=type=cache,target=/root/.npm \
  npm ci && cd tests/e2e && npm ci && npm run playwright-deps

# Build the production assets
COPY . .
RUN npm run build

# Run unit and integration tests
# Avoid failing the integration tests to capture playwright test results
FROM build AS test
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
RUN [ "[ -f tests-failed.txt ]" ]
CMD [ "npm", "run", "test" ]

FROM nginx:1.25.5-bookworm
LABEL org.opencontainers.image.source=https://github.com/jettisonproj/jettison-ui
EXPOSE 80

COPY --from=build /home/node/dist/*.html /srv/http/
COPY --from=build /home/node/dist/*.svg /srv/http/
COPY --from=build /home/node/dist/assets/ /srv/http/assets/
COPY --from=build /home/node/rootfs/etc/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /home/node/rootfs/etc/nginx/sites/jettison /etc/nginx/sites/jettison
