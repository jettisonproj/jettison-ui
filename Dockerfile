# Build the production assets
FROM node:24 AS build

WORKDIR /home/node
COPY . .
RUN npm ci && npm run build

# Run unit and integration tests
FROM build as test
RUN npm run lint && \
  npm run test && \
  cd tests/e2e && \
  npm ci && \
  npm run playwright-deps && \
  CI=true npm run test

# Build the Integration Tests
FROM test as integration-test
WORKDIR /home/node/tests/e2e
ENV CI=true
CMD [ "npm", "run", "test" ]

FROM nginx:1.25.5-bookworm
LABEL org.opencontainers.image.source=https://github.com/jettisonproj/jettison-ui
EXPOSE 80

COPY --from=build /home/node/dist/*.html /srv/http/
COPY --from=build /home/node/dist/*.svg /srv/http/
COPY --from=build /home/node/dist/assets/ /srv/http/assets/
COPY --from=build /home/node/rootfs/etc/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /home/node/rootfs/etc/nginx/sites/jettison /etc/nginx/sites/jettison
