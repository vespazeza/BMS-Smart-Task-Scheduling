# Smart Task Scheduling & Alert System
# Single Node.js process: serves the built React app (dist/) and the API
# from server/index.js on process.env.PORT (default 3001).
# Requires Node >=22.13 for the built-in node:sqlite module.

FROM node:22-bookworm-slim

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source and build the frontend
COPY . .
RUN npm run build

# Persist the SQLite DB + uploaded files outside the image layer
ENV DATA_DIR=/data
VOLUME ["/data"]

ENV PORT=3001
ENV HOST=0.0.0.0
EXPOSE 3001

CMD ["node", "--disable-warning=ExperimentalWarning", "server/index.js"]
