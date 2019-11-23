# This is the rrot Dockeerfile
# App-specific Dockerfiles should start with "FROM" with this image.

FROM node:10

# Create app directory
WORKDIR /usr/src/app

# Bundle app source
COPY . ./

# Install dependencies.
RUN yarn

ENV NODE_ENV=production
