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

# Create public directory and copy static files
RUN mkdir -p /usr/src/app/public/js
COPY public/js/swagger-custom.js /usr/src/app/public/js/

# Set execute permissions for scripts
RUN chmod +x ./scripts/*.sh

# Expose port
EXPOSE 5000

# Default command (will be overridden by docker-compose)
CMD ["npm", "run", "dev"] 