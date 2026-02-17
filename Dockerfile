FROM node:24 AS build

WORKDIR /home/node
COPY . .
RUN npm ci
RUN npm run build

FROM build as test
RUN npm run lint

# Build the Integration Tests for the Go application
FROM ubuntu:24.04 as integration-test
RUN apt-get update && \
  apt-get -y install curl && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists /var/cache/apt/archives
WORKDIR /root
COPY tests .
CMD [ "./integration-test.sh" ]

FROM nginx:1.25.5-bookworm
LABEL org.opencontainers.image.source=https://github.com/jettisonproj/jettison-ui
EXPOSE 80

COPY --from=build /home/node/dist/build/* /srv/http/
COPY --from=build /home/node/rootfs/etc/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /home/node/rootfs/etc/nginx/sites/jettison /etc/nginx/sites/jettison
