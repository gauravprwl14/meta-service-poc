# Base image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies)
RUN npm install --include=dev

# Copy app source code
COPY . .

# Set execute permissions for scripts
RUN chmod +x ./scripts/*.sh

# Expose port
EXPOSE 5000

# Default command (will be overridden by docker-compose)
CMD ["npm", "run", "dev"] 