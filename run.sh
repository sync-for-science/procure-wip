#!/bin/bash

echo "PORT:           $PORT"
echo "DATA_HOST: $DATA_HOST"

# Needs to be present:
cat ./public/config/epic_endpoints.json

# TEMPLATE NEEDS to be present, for substitution:
cat config-override-dev.json

sed -e s@DATA_HOST@$DATA_HOST@g config/config-override-dev.template.json > public/config/config-override-dev.json

cat public/config/config-override-dev.json

# build production deployments in Dockerfile?
# /usr/local/bin/npm build

/usr/local/bin/npm start
