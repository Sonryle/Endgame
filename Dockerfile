# Dockerfile

# Step 1: Use a Node.js image to build the app
FROM node:22 AS builder

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app’s source code
COPY . .

# Build the app
RUN npm run build

RUN ls /app/dist
RUN ls /app/

RUN cp /app/server.cjs /app/dist/server.cjs
RUN cp /app/package*.json /app/dist/
RUN cp /app/src /app/dist/ -r

# Step 2: Use a nodejs image to serve the static files
FROM node:22

# Copy the build files to workdir
COPY --from=builder /app/dist /

# Install dependencies
RUN npm install

# Expose port 5137
EXPOSE 5137

# Start Nginx server
CMD ["node", "server.cjs"]
