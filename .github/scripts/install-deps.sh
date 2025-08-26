#!/bin/bash

# Configure npm to be more resilient to rate limiting
echo "🔧 Configuring npm for better rate limiting resilience..."
npm config set fetch-retries 5
npm config set fetch-retry-factor 2
npm config set fetch-retry-mintimeout 10000
npm config set fetch-retry-maxtimeout 60000
npm config set registry https://registry.npmjs.org
npm config set audit false
npm config set fund false

# Function to install with retry logic
install_with_retry() {
  local max_attempts=3
  local attempt=1
  
  while [ $attempt -le $max_attempts ]; do
    echo "📥 Installing dependencies (attempt $attempt/$max_attempts)..."
    
    if timeout 600 npm ci --prefer-offline --no-audit --no-fund; then
      echo "✅ Dependencies installed successfully!"
      return 0
    else
      echo "❌ Attempt $attempt failed"
      if [ $attempt -lt $max_attempts ]; then
        local wait_time=$((30 * attempt))
        echo "⏳ Waiting $wait_time seconds before retry..."
        sleep $wait_time
      fi
      attempt=$((attempt + 1))
    fi
  done
  
  echo "💥 Failed to install dependencies after $max_attempts attempts"
  return 1
}

# Try alternative registry if main fails
install_with_fallback() {
  if ! install_with_retry; then
    echo "🔄 Trying alternative registry..."
    npm config set registry https://registry.yarnpkg.com
    install_with_retry
  fi
}

# Run the installation
install_with_fallback
