###################
# BUILD FOR LOCAL DEVELOPMENT AND PRODUCTION
###################

FROM node:18-alpine As build

ARG BUILD_ENV

WORKDIR /usr/src/app

# Install git and SSH
RUN apk add --no-cache git openssh bash

# The file must be named id_ed25519
COPY --chown=node:node ./secrets/docker-volume/id_ed25519 /secrets/id_ed25519

# Create app directory

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure copying both package.json AND package-lock.json (when available).
# Copying this first prevents re-running npm install on every code change.
COPY --chown=node:node package*.json ./

# Install app dependencies using the `npm ci` command instead of `npm install`
# `npm ci && npm cache clean --force` must be in the same RUN command as
# `echo "Host github.com\n\tIdentityFile /secrets/id_ed25519\n\tStrictHostKeyChecking no\n" >> ~/.ssh/config && \` for this to work
RUN mkdir -p ~/.ssh && \
    ssh-keyscan -H github.com >> ~/.ssh/known_hosts && \
    eval "$(ssh-agent -s)" && \
    ssh-add /secrets/id_ed25519 && \
    echo "Host github.com\n\tIdentityFile /secrets/id_ed25519\n\tStrictHostKeyChecking no\n" >> ~/.ssh/config && \
    npm ci && npm cache clean --force

# Delete the private key
RUN rm /secrets/id_ed25519

# Bundle app source
COPY . .
RUN file=$(ls -la .) && echo $file

# Delete `build` and `build-dev` folders
# RUN rm -fr build-dev
# RUN rm -fr build

# command will generate @prisma-platform/client and @prisma-simulation/client in node_modules
# RUN npm run generate:prisma
# RUN npx nestia setup
# Run the build command which creates the production bundle

# RUN mkdir ./development_logs
# RUN chown -R node:node ./development_logs
# Use the node user from the image (instead of the root user)

# RUN npm run build-dev
# RUN file=$(ls -la ./build-dev) && echo $file
# RUN npm run build-prod
# RUN file=$(ls -la ./build) && echo $file

RUN npm run build-all -- ${BUILD_ENV}

USER node
CMD ls -la . && pwd -P && echo "BUILDS FOR LOCAL DEVELOPMENT AND PRODUCTION ARE COMPLETED!"

# Do NOT use the node user from the image (instead of the root user) else will encounter this error: EACCES: permission denied, mkdir '/usr/src/app/build'.

###################
# DEVELOPMENT
###################

FROM node:18-alpine As development

WORKDIR /usr/src/app

# RUN file="$(ls -la .)" && echo $file && pwd -P
# COPY --from=build /usr/src/app/build-dev ./build-dev
COPY --from=build /usr/src/app/build-dev .
COPY --from=build /usr/src/app/node_modules ./node_modules
# RUN npx prisma generate --schema ./build-dev/prisma/schema.prisma

# bash scripts/npm-build will make these directories
# RUN mkdir -m 777 ./build-dev/development_logs
RUN chown -R node:node ./development_logs

USER node
CMD pwd -P && echo "Running ls -la ." && \
    ls -la . && \
    echo "Running ls -la /run" && \
    ls -la /run && \
    # echo "Running ls -la ./build-dev" && \
    # ls -la ./build-dev && \
    echo "Running ls -la ./node_modules/@prisma/client" && \
    ls -la ./node_modules/@prisma/client && \
    echo "Running ls -la ./node_modules/.prisma/client" && \
    ls -la ./node_modules/.prisma/client && \
    # cd build-dev/ && \
    node src/bin/main.js

###################
# PRODUCTION
###################

FROM node:18-alpine As production

WORKDIR /usr/src/app

# COPY --from=build /usr/src/app/build ./build
COPY --from=build /usr/src/app/build .
COPY --from=build /usr/src/app/node_modules ./node_modules
# RUN npx prisma generate --schema ./build/prisma/schema.prisma

# bash scripts/npm-build will make these directories
# RUN mkdir ./build/production_logs
RUN chown -R node:node ./production_logs

USER node
CMD pwd -P && echo "Running ls -la ." && \
    ls -la . && \
    echo "Running ls -la /run" && \
    ls -la /run && \
    # echo "Running ls -la ./build" && \
    # ls -la ./build && \
    echo "Running ls -la ./node_modules/@prisma/client" && \
    ls -la ./node_modules/@prisma/client && \
    echo "Running ls -la ./node_modules/.prisma/client" && \
    ls -la ./node_modules/.prisma/client && \
    # cd build/ && \
    node src/bin/main.js

# FROM node:18-alpine As production

# # Create app directory
# WORKDIR /usr/src/app

# # Install git and SSH
# RUN apk add --no-cache git openssh

# # Copy application dependency manifests to the container image.
# # A wildcard is used to ensure copying both package.json AND package-lock.json (when available).
# # Copying this first prevents re-running npm install on every code change.
# COPY --chown=node:node package*.json ./
# COPY --chown=node:node nest*.json ./

# # Install app dependencies using the `npm ci` command instead of `npm install`
# RUN npm ci && npm cache clean --force
# # Bundle app source
# COPY --chown=node:node . .
# # command will generate @prisma-platform/client and @prisma-simulation/client in node_modules
# RUN npm run generate:prisma
# # RUN npx nestia setup
# # Run the build command which creates the production bundle
# RUN npm run build
# RUN mkdir ./production_logs
# RUN chown -R node:node ./production_logs
# # Use the node user from the image (instead of the root user)
# USER node

# CMD node build/src/main.js