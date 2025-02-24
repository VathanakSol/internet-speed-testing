# Use a Node.js base image
FROM node:18-alpine

# Install Python and pip
RUN apk add --no-cache python3 py3-pip speedtest-cli

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
