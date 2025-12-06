#!/bin/bash
set -euo pipefail

RG="rg-legal-ai-prod"
APP="expert-snapshot-legal-docker"

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

echo "🔹 Example SSL binding commands (replace <THUMBPRINT>):"
echo "az webapp config ssl bind --resource-group $RG --name $APP --certificate-thumbprint <THUMBPRINT_ROOT> --ssl-type SNI"
echo "az webapp config ssl bind --resource-group $RG --name $APP --certificate-thumbprint <THUMBPRINT_WWW> --ssl-type SNI"

echo "🔹 Restarting App Service..."
az webapp restart --resource-group $RG --name $APP

echo "✅ DNS/IP/SSL extraction complete. Update GoDaddy A record (@) → $PRIMARY_IP and CNAME (www) → $DEFAULT_HOSTNAME."

