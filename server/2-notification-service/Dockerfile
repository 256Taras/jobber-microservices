### First stage: Build the project
FROM node:21-alpine3.18 as builder

# Set the working directory inside the container
WORKDIR /app

# Copy package configuration and dependency files
COPY package*.json ./
COPY tsconfig.json ./
COPY .npmrc ./
COPY src ./src
COPY tools ./tools

# Install the latest version of npm
RUN npm install -g npm@latest

# Install dependencies and build the project
RUN npm ci && npm run build



### Second stage: Create the final image for running the application
FROM node:21-alpine3.18

# Set the working directory inside the container
WORKDIR /app

# Install curl
RUN apk add --no-cache curl

# Copy package configuration and dependency files
COPY package*.json ./
COPY tsconfig.json ./
COPY .npmrc ./

# Install pm2 and the latest version of npm
RUN npm install -g pm2 npm@latest

# Install only production dependencies
RUN npm ci --production

# Copy the build artifacts from the first stage
COPY --from=builder /app/build ./build

# Expose port 4001 for the application
EXPOSE 4001

# Command to run the application
CMD [ "npm", "run", "start" ]
