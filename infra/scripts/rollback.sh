#!/bin/bash
set -euo pipefail

RG="rg-legal-ai-prod"

echo "⚠️ WARNING: This will delete the entire resource group $RG and all resources inside it."
read -p "Are you sure you want to proceed? (yes/no): " CONFIRM

if [[ "$CONFIRM" == "yes" ]]; then
  echo "🔹 Deleting resource group $RG..."
  az group delete --name $RG --yes --no-wait
  echo "✅ Resource group deletion initiated."
else
  echo "❌ Rollback aborted."
fi

