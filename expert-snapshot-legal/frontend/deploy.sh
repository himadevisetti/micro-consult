#!/bin/bash

set -euo pipefail

echo "🔹 Step 1: Building frontend and telemetry..."
cd /Users/himadevisetti/micro-consult/expert-snapshot-legal/frontend
BUILD_TELEMETRY=true npm run build && npm run build

echo "🔹 Step 2: Building Docker image..."
cd /Users/himadevisetti/micro-consult
docker build -t ghcr.io/himadevisetti/expert-snapshot-legal:latest .

echo "🔹 Step 3: Pushing Docker image to GHCR..."
docker push ghcr.io/himadevisetti/expert-snapshot-legal:latest

echo "🔹 Step 4: Restarting Azure App Service..."
az webapp restart \
  --name expert-snapshot-legal-docker \
  --resource-group rg-legal-ai-dev

echo "✅ Deployment complete."

