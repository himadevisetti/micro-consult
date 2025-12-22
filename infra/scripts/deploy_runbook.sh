#!/bin/bash
set -euo pipefail

RG="rg-legal-ai-prod"
APP="expert-snapshot-legal-docker"

##############################################
# 1. Post‑Deploy Automation (UAMI + App Regs + App Settings)
##############################################

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

##############################################
# 2. DNS/IP/SSL Extraction
##############################################

echo "🔹 Fetching outbound IP addresses for App Service..."
OUTBOUND_IPS=$(az webapp show \
  --resource-group $RG \
  --name $APP \
  --query outboundIpAddresses -o tsv)

echo "Outbound IPs: $OUTBOUND_IPS"
PRIMARY_IP=$(echo $OUTBOUND_IPS | cut -d',' -f1)
echo "✅ Primary IP (use for A record @): $PRIMARY_IP"

echo "🔹 Fetching default hostname..."
DEFAULT_HOSTNAME=$(az webapp show \
  --resource-group $RG \
  --name $APP \
  --query defaultHostName -o tsv)

echo "✅ Default hostname (use for CNAME www): $DEFAULT_HOSTNAME"

echo "🔹 Current DNS resolution..."
nslookup microconsultnetwork.com || true
nslookup www.microconsultnetwork.com || true

echo "🔹 Fetching SSL certificate thumbprints..."
az webapp config ssl list \
  --resource-group $RG \
  --query "[].{Name:hostNames[0], Thumbprint:thumbprint}" -o table

echo "✅ Use the thumbprints above to bind certs for microconsultnetwork.com and www.microconsultnetwork.com"

##############################################
# 3. Validation
##############################################

ROOT_URL="https://microconsultnetwork.com"
WWW_URL="https://www.microconsultnetwork.com"

echo "🔎 Testing HTTPS endpoints..."
curl -I $ROOT_URL
curl -I $WWW_URL

echo "🔎 Testing SSL certificate binding..."
echo | openssl s_client -connect microconsultnetwork.com:443 -servername microconsultnetwork.com 2>/dev/null | openssl x509 -noout -subject -issuer -dates
echo | openssl s_client -connect www.microconsultnetwork.com:443 -servername www.microconsultnetwork.com 2>/dev/null | openssl x509 -noout -subject -issuer -dates

echo "🔎 Testing login callback..."
curl -I "$ROOT_URL/api/auth/callback/microsoft" || true
curl -I "$WWW_URL/api/auth/callback/microsoft" || true

echo "🔎 Testing SQL connectivity..."
sqlcmd -S microconsult-sqlserver-dev.database.windows.net \
       -d expert-snapshot-legal-db-dev \
       -U sqladmin \
       -P "$(az keyvault secret show --vault-name kv-expert-snapshot-legal --name azure-sql-password --query value -o tsv)" \
       -Q "SELECT TOP 1 name FROM sys.databases"

echo "🔎 Testing ACS email send..."
az communication email send \
  --sender "support@microconsultnetwork.com" \
  --recipient "test@yourdomain.com" \
  --subject "Validation Email" \
  --body-plain-text "Deployment validation successful." \
  --connection-string "$(az keyvault secret show --vault-name kv-expert-snapshot-legal --name acs-connection-string --query value -o tsv)"

echo "✅ Full runbook complete. DNS/IP/SSL values extracted, App Registrations updated, App Service configured, and validation checks run."

