#!/bin/bash
set -euo pipefail

ROOT_URL="https://microconsultnetwork.com"
WWW_URL="https://www.microconsultnetwork.com"
EXPECTED_IP="<NEW_PROD_APP_SERVICE_IP>"   # replace with actual IP from prod App Service JSON

echo "🔎 Checking DNS resolution..."
nslookup microconsultnetwork.com
nslookup www.microconsultnetwork.com

echo "🔎 Verifying A record points to new prod IP..."
CURRENT_IP=$(dig +short microconsultnetwork.com | tail -n1)
if [[ "$CURRENT_IP" == "$EXPECTED_IP" ]]; then
  echo "✅ microconsultnetwork.com resolves to expected prod IP: $CURRENT_IP"
else
  echo "❌ microconsultnetwork.com resolves to $CURRENT_IP (expected $EXPECTED_IP)"
fi

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

echo "✅ Validation checks complete."

