FROM node:12
# FROM centos/nodejs-12-centos7

WORKDIR procure-wip

COPY package.json \
     package-lock.json \
     ./

# before install?
RUN mkdir -p ./public/config/ \
    && curl https://open.epic.com/MyApps/EndpointsJson -o ./public/config/epic_endpoints.json
RUN cat ./public/config/epic_endpoints.json

RUN npm install

COPY . ./

# RUN /usr/local/bin/npm build
# ^ run build, for production deployments?
