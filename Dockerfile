FROM node:14

WORKDIR procure-wip

COPY package.json \
     package-lock.json \
     ./

# before install?
RUN mkdir -p ./public/config/ \
    && curl https://open.epic.com/MyApps/EndpointsJson -o ./public/config/epic_endpoints.json
# RUN cat ./public/config/epic_endpoints.json

RUN npm ci

COPY . ./
