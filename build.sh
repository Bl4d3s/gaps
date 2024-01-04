#!/bin/bash
set -e

npm ci
./minify
npm run test
mvn clean install

docker buildx build \
  -t ghcr.io/bl4d3s/gaps:latest \
  -f Dockerfile .
