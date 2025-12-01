#!/bin/bash
echo '{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentParameters.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {' > main.parameters.json

while IFS='=' read -r key value; do
  key=$(echo "$key" | tr -d '\r' | xargs)
  value=$(echo "$value" | tr -d '\r' | xargs)
  [[ -z "$key" || "$key" =~ ^# ]] && continue
  echo "    \"$key\": { \"value\": \"$value\" }," >> main.parameters.json
done < expert-snapshot-legal/frontend/.env

echo '  }
}' >> main.parameters.json

