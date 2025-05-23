# syntax=docker/dockerfile:1.15
# DOCKER_BUILDKIT=1 docker build --secret id=npm,src=$HOME/.npmrc .

# Create a node_modules folder for development
FROM node:24-slim AS dev-builder
WORKDIR /opt/msed
COPY package*.json ./
RUN npm ci

# Compile the project
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Create the production image
FROM node:24-slim
WORKDIR /opt/msed
COPY package*.json ./
RUN npm ci --only=production
COPY --from=dev-builder /opt/msed/dist ./dist

USER node
CMD [ "node", "./dist/main.js" ]
