#!/bin/bash
# deploy-app-settings.sh
# Automates updating App Service environment variables using Bicep + parameters JSON

RESOURCE_GROUP="rg-legal-ai-dev"
TEMPLATE_FILE="main.bicep"
PARAMETERS_FILE="main.parameters.json"

echo "🚀 Starting deployment of App Settings to App Service..."
az deployment group create \
  --resource-group $RESOURCE_GROUP \
  --template-file $TEMPLATE_FILE \
  --parameters @$PARAMETERS_FILE

if [ $? -eq 0 ]; then
  echo "✅ Deployment succeeded. App Settings updated."
else
  echo "❌ Deployment failed. Check error output above."
fi

