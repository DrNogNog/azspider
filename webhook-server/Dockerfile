# Use an official Node.js runtime as a parent image
FROM node:20-slim

# Create a non-root user for security
RUN groupadd -r webhook && useradd -r -g webhook webhook

# Set the working directory to the project root inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json from the build context root
COPY package*.json ./

# Install all project dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy the entire project into the container
COPY . .

# Change ownership to the webhook user
RUN chown -R webhook:webhook /usr/src/app

# Switch to the webhook user
USER webhook

# Expose the port the app runs on
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Define the command to run your webhook server application
CMD ["node", "index.js"]
