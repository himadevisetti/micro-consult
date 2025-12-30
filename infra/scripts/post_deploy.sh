#!/bin/bash
set -euo pipefail

RG="rg-legal-ai-prod"
APP="expert-snapshot-legal-docker"

echo "🔹 Assigning UAMI to App Service..."
az webapp identity assign \
  --resource-group $RG \
  --name $APP \
  --identities "/subscriptions/<subId>/resourceGroups/$RG/providers/Microsoft.ManagedIdentity/userAssignedIdentities/expert-snapshot-legal-uami"

echo "🔹 Updating App Registration URIs..."
# ExpertSnapshotAuth redirect URIs (prod only)
az ad app update \
  --id facb92f0-86db-4116-99c7-071c469c5718 \
  --web-redirect-uris \
    "https://microconsultnetwork.com/api/auth/callback/microsoft" \
    "https://www.microconsultnetwork.com/api/auth/callback/microsoft"

# GraphDocxConverter (client credentials flow, no redirect URIs needed in prod)
az ad app update \
  --id 4afe5d49-f775-42d7-a625-7fabce4df597 \
  --set web.redirectUris=""

echo "🔹 Validating ACS connection string..."
az communication connection-string show \
  --name acs-core-microConsult \
  --resource-group rg-microConsult-dev \
  --output tsv

echo "🔹 Updating App Settings (non-secret values)..."
az webapp config appsettings set \
  --resource-group $RG \
  --name $APP \
  --settings \
    COMPANY_NAME="Expert Snapshot Legal" \
    SUPPORT_EMAIL="support@microconsultnetwork.com" \
    FRONTEND_BUILD_PATH="/app/frontend" \
    STORAGE_PATH="/storage" \
    DEBUG_LOGS="true" \
    DEBUG_READ_FIELDS="false" \
    DEBUG_TRACE="false" \
    NODE_ENV="production" \
    CANDIDATE_TTL_MS="86400000" \
    BIND_HOST="0.0.0.0" \
    CHROME_BIN="/usr/bin/google-chrome" \
    PYTHON_BIN="/opt/venv/bin/python3" \
    DISABLE_TELEMETRY="false" \
    AZURE_FORM_RECOGNIZER_ENDPOINT="https://legal-ai-foundry-dev.services.ai.azure.com/" \
    GRAPH_CLIENT_ID="4afe5d49-f775-42d7-a625-7fabce4df597" \
    GRAPH_TENANT="consumers" \
    AZURE_STORAGE_ACCOUNT_NAME="retainerdocs" \
    AZURE_STORAGE_CONTAINER_NAME="documents" \
    SQL_CONNECTION_TIMEOUT="30000" \
    SQL_REQUEST_TIMEOUT="30000" \
    JWT_EXPIRES_IN="8h" \
    VERIFICATION_TOKEN_TTL_HOURS="24" \
    RESET_TOKEN_TTL_HOURS="1" \
    APP_BASE_URL="https://microconsultnetwork.com" \
    AZURE_CLIENT_ID="94dfed5e-ec48-437a-8f5b-394d12f53a3d" \
    AZURE_TENANT_ID="3188f024-fce9-420f-bc71-264d7ffb403e" \
    AZURE_SIGNIN_REDIRECT_URI="https://microconsultnetwork.com/api/auth/callback/microsoft" \
    AZURE_SIGNIN_CLIENT_ID="facb92f0-86db-4116-99c7-071c469c5718" \
    FRONTEND_MICROSOFT_CALLBACK_URL="https://microconsultnetwork.com/auth/callback/microsoft" \
    RETENTION_DAYS="180"

echo "🔹 Restarting App Service..."
az webapp restart --resource-group $RG --name $APP

echo "✅ Post-deploy automation complete."

