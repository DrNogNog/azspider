# Use an official Node.js runtime as a parent image with Python support
FROM node:20-slim

# Install Python and pip
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    git \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user for security
RUN groupadd -r backend && useradd -r -g backend backend

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy the backend application code
COPY . .

# Set up Python virtual environment and install Sherlock
RUN python3 -m venv /usr/src/app/sherlock_project/sherlock_project/.venv
RUN /usr/src/app/sherlock_project/sherlock_project/.venv/bin/pip install --upgrade pip
RUN /usr/src/app/sherlock_project/sherlock_project/.venv/bin/pip install \
    "certifi>=2019.6.16" \
    "colorama>=0.4.1" \
    "PySocks>=1.7.0" \
    "requests>=2.22.0" \
    "requests-futures>=1.0.0" \
    "stem>=1.8.0" \
    "torrequest>=0.1.0" \
    "pandas>=2.2.1" \
    "openpyxl>=3.0.10" \
    "tomli>=2.2.1"

# Change ownership to the backend user
RUN chown -R backend:backend /usr/src/app

# Switch to the backend user
USER backend

# Expose the port the app runs on
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Define the command to run your app
CMD ["node", "app.js"]
